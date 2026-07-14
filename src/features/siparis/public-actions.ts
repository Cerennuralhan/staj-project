"use server";

import { connectDB } from "@/lib/db";
import { Siparis } from "./queries";
import { Musteri } from "@/features/musteri/queries";
import { Uye } from "@/features/uye/queries";
import { Kurulum } from "@/features/kurulum/queries";
import { Garanti } from "@/features/garanti/queries";
import { auth } from "@/lib/auth/config";
import { logIslem } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { checkAndDecrementStock } from "@/features/urun/queries";

async function generateSiparisNo(): Promise<string> {
  const year = new Date().getFullYear();
  const last = await Siparis.findOne({ siparisNo: { $regex: `^SIP-${year}-` } })
    .sort({ siparisNo: -1 })
    .select("siparisNo")
    .lean();
  let seq = 1;
  if (last) {
    const parts = last.siparisNo.split("-");
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }
  return `SIP-${year}-${String(seq).padStart(4, "0")}`;
}

function createOdemePlani(toplamTutar: number, yontem: "pesin" | "taksit", taksitSayisi: number, siparisTarihi: Date): any {
  if (yontem === "pesin") {
    return {
      yontem: "pesin",
      taksitSayisi: 1,
      taksitTutari: toplamTutar,
      odenenTaksitSayisi: 1,
      taksitler: [{ taksitNo: 1, tutar: toplamTutar, vadeTarihi: siparisTarihi, odendiMi: true, odemeTarihi: siparisTarihi }],
    };
  }
  const taksitTutari = Math.round((toplamTutar / taksitSayisi) * 100) / 100;
  const taksitler = Array.from({ length: taksitSayisi }, (_, i) => {
    const vade = new Date(siparisTarihi);
    vade.setMonth(vade.getMonth() + i);
    return { taksitNo: i + 1, tutar: i === taksitSayisi - 1 ? toplamTutar - taksitTutari * (taksitSayisi - 1) : taksitTutari, vadeTarihi: vade, odendiMi: false, odemeTarihi: null };
  });
  return { yontem: "taksit", taksitSayisi, taksitTutari, odenenTaksitSayisi: 0, taksitler };
}

export async function checkoutAction(input: {
  uyeId?: string;
  adSoyad: string;
  eposta: string;
  telefon: string;
  teslimatAdresi: string;
  faturaAdresi: string;
  urunler: { urunId: string; urunAdi: string; kapakResmi: string; adet: number; fiyat: number }[];
  kaydetAdres?: boolean;
  odemeYontemi?: "pesin" | "taksit";
  taksitSayisi?: number;
}) {
  if (!input.urunler?.length) return { success: false, error: "Sepet boş" };
  if (!input.teslimatAdresi?.trim()) return { success: false, error: "Teslimat adresi zorunludur" };

  await connectDB();

  // Musteri bul: önce uyeId ile, yoksa eposta ile
  let musteri = null;
  if (input.uyeId) {
    musteri = await Musteri.findOne({ uyeId: input.uyeId }).lean();
  }
  if (!musteri) {
    musteri = await Musteri.findOne({ eposta: input.eposta }).lean();
  }

  if (musteri) {
    const update: Record<string, unknown> = {
      adres: input.teslimatAdresi,
      telefon: input.telefon,
      adSoyad: input.adSoyad,
    };
    if (input.uyeId && !(musteri as any).uyeId) {
      update.uyeId = input.uyeId;
    }
    await Musteri.findByIdAndUpdate(musteri._id, { $set: update });
  } else {
    musteri = await Musteri.create({
      adSoyad: input.adSoyad,
      telefon: input.telefon,
      eposta: input.eposta,
      adres: input.teslimatAdresi,
      ...(input.uyeId ? { uyeId: input.uyeId } : {}),
    });
  }

  // "Adresi kaydet" işaretliyse, uyeler.adres ve musteriler.adres güncelle
  if (input.kaydetAdres && input.uyeId) {
    await Uye.findByIdAndUpdate(input.uyeId, {
      $set: { adres: input.teslimatAdresi },
    });
  }

  const toplamTutar = input.urunler.reduce((t, u) => t + u.fiyat * u.adet, 0);
  const siparisNo = await generateSiparisNo();
  const siparisTarihi = new Date();
  const yontem = input.odemeYontemi || "pesin";
  const ts = yontem === "taksit" ? (input.taksitSayisi || 2) : 1;

  // Stok kontrolü + düşüm
  const stokResult = await checkAndDecrementStock(input.urunler);
  if (!stokResult.success) return { success: false, error: stokResult.error };

  const odemePlani = createOdemePlani(toplamTutar, yontem, ts, siparisTarihi);

  const doc = await Siparis.create({
    musteriId: musteri._id,
    siparisNo,
    durum: "beklemede",
    toplamTutar,
    siparisTarihi,
    dinamikTeslimatAdresi: input.teslimatAdresi,
    dinamikFaturaAdresi: input.faturaAdresi,
    urunler: input.urunler.map((u) => ({
      urunId: new mongoose.Types.ObjectId(u.urunId),
      urunAdi: u.urunAdi,
      kapakResmi: u.kapakResmi,
      adet: u.adet,
      fiyat: u.fiyat,
    })),
    odemePlani,
  });

  // Eğer uyeId varsa, sepeti temizle
  if (input.uyeId) {
    const { Sepet } = await import("@/features/sepet/queries");
    await Sepet.deleteOne({ uyeId: input.uyeId });
  }

  return { success: true, siparisNo, siparisId: doc._id.toString() };
}

export async function markTaksitOdendiAction(siparisId: string, taksitNo: number) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  const siparis = await Siparis.findById(siparisId).lean();
  if (!siparis) return { success: false, error: "Sipariş bulunamadı" };
  if (!siparis.odemePlani) return { success: false, error: "Ödeme planı bulunamadı" };

  const taksit = (siparis.odemePlani as any).taksitler?.find((t: any) => t.taksitNo === taksitNo);
  if (!taksit) return { success: false, error: "Taksit bulunamadı" };
  if (taksit.odendiMi) return { success: false, error: "Taksit zaten ödenmiş" };

  const now = new Date();
  await Siparis.findByIdAndUpdate(siparisId, {
    $set: {
      "odemePlani.taksitler.$[elem].odendiMi": true,
      "odemePlani.taksitler.$[elem].odemeTarihi": now,
    },
    $inc: { "odemePlani.odenenTaksitSayisi": 1 },
  }, {
    arrayFilters: [{ "elem.taksitNo": taksitNo }],
  });

  await logIslem(session.user.id, "guncelle", "siparisler");
  revalidatePath("/dashboard/musteri");
  return { success: true };
}

export async function toggleTaksitAction(siparisId: string, taksitNo: number) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  const siparis = await Siparis.findById(siparisId).lean();
  if (!siparis) return { success: false, error: "Sipariş bulunamadı" };
  if (!siparis.odemePlani) return { success: false, error: "Ödeme planı bulunamadı" };

  const taksit = (siparis.odemePlani as any).taksitler?.find((t: any) => t.taksitNo === taksitNo);
  if (!taksit) return { success: false, error: "Taksit bulunamadı" };

  const now = new Date();
  const yeniDurum = !taksit.odendiMi;

  await Siparis.findByIdAndUpdate(siparisId, {
    $set: {
      "odemePlani.taksitler.$[elem].odendiMi": yeniDurum,
      "odemePlani.taksitler.$[elem].odemeTarihi": yeniDurum ? now : null,
    },
    $inc: { "odemePlani.odenenTaksitSayisi": yeniDurum ? 1 : -1 },
  }, {
    arrayFilters: [{ "elem.taksitNo": taksitNo }],
  });

  await logIslem(session.user.id, "guncelle", "siparisler");
  revalidatePath("/dashboard/musteri");
  return { success: true };
}

export async function getUyeSiparislerimAction(uyeId: string) {
  await connectDB();
  const musteri = await Musteri.findOne({ uyeId }).lean();
  if (!musteri) return [];

  const siparisler = await Siparis.find({ musteriId: musteri._id })
    .sort({ createdAt: -1 })
    .lean();

  const siparisIds = siparisler.map((s) => s._id);

  const [kurulumlar, garantiler] = await Promise.all([
    Kurulum.find({ siparisId: { $in: siparisIds } }).lean(),
    Garanti.find({ siparisId: { $in: siparisIds } }).lean(),
  ]);

  const kurulumMap = new Map<string, any[]>();
  for (const k of kurulumlar) {
    const key = k.siparisId.toString();
    if (!kurulumMap.has(key)) kurulumMap.set(key, []);
    kurulumMap.get(key)!.push(k);
  }

  const garantiMap = new Map<string, any[]>();
  for (const g of garantiler) {
    const key = g.siparisId.toString();
    if (!garantiMap.has(key)) garantiMap.set(key, []);
    garantiMap.get(key)!.push(g);
  }

  const result = siparisler.map((s) => {
    const id = s._id.toString();
    return {
      ...JSON.parse(JSON.stringify(s)),
      kurulumlar: kurulumMap.get(id) || [],
      garantiler: garantiMap.get(id) || [],
    };
  });

  return JSON.parse(JSON.stringify(result));
}
