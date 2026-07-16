"use server";

import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db";
import { Siparis } from "./queries";
import { siparisSchema } from "./schema";
import type { Siparis as SiparisType } from "./types";
import { logIslem } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { Kurulum } from "@/features/kurulum/queries";
import { checkAndDecrementStock, restoreStock } from "@/features/urun/queries";
import { Garanti } from "@/features/garanti/queries";
import { Urun } from "@/features/urun/queries";
import { calculateWarrantyEndDate } from "@/lib/warranty/calculateWarrantyEndDate";

/* ---------- SiparisNo üreteci ---------- */

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

/* ---------- Liste / Detay ---------- */

export async function getSiparisListAction(): Promise<SiparisType[]> {
  await connectDB();
  const docs = await Siparis.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function getSiparisByIdAction(id: string): Promise<SiparisType | null> {
  await connectDB();
  const doc = await Siparis.findById(id).populate("musteriId", "adSoyad telefon eposta").lean();
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}

/* ---------- Yardımcı ---------- */

function createOdemePlani(
  toplamTutar: number,
  yontem: "pesin" | "taksit" | "senet",
  taksitSayisi: number,
  siparisTarihi: Date,
  manuelTaksitler?: { tutar: number; vadeTarihi: string }[],
): any {
  if (yontem === "pesin") {
    return {
      yontem: "pesin",
      taksitSayisi: 1,
      taksitTutari: toplamTutar,
      odenenTaksitSayisi: 1,
      taksitler: [{ taksitNo: 1, tutar: toplamTutar, vadeTarihi: siparisTarihi, odendiMi: true, odemeTarihi: siparisTarihi }],
    };
  }
  if (yontem === "senet" && manuelTaksitler && manuelTaksitler.length > 0) {
    const taksitler = manuelTaksitler.map((m, i) => ({
      taksitNo: i + 1,
      tutar: m.tutar,
      vadeTarihi: new Date(m.vadeTarihi),
      odendiMi: false,
      odemeTarihi: null,
    }));
    const odenen = taksitler.filter((t) => t.odendiMi).reduce((a, t) => a + t.tutar, 0);
    return {
      yontem: "senet",
      taksitSayisi: taksitler.length,
      taksitTutari: taksitler.length > 0 ? taksitler[0].tutar : 0,
      odenenTaksitSayisi: 0,
      taksitler,
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

/* ---------- Oluşturma ---------- */

export async function createSiparisAction(input: {
  musteriId: string;
  urunler: { urunId: string; urunAdi: string; kapakResmi: string; adet: number; fiyat: number }[];
  dinamikTeslimatAdresi: string;
  dinamikFaturaAdresi: string;
  odemeYontemi?: "pesin" | "taksit" | "senet";
  taksitSayisi?: number;
  manuelTaksitler?: { tutar: number; vadeTarihi: string }[];
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();

  const toplamTutar = input.urunler.reduce((t, u) => t + u.fiyat * u.adet, 0);
  const siparisNo = await generateSiparisNo();
  const yontem = input.odemeYontemi || "pesin";
  const taksitSayisi = yontem === "taksit" ? (input.taksitSayisi || 2) : 1;
  const siparisTarihi = new Date();

  // Stok kontrolü + düşüm
  const stokResult = await checkAndDecrementStock(input.urunler);
  if (!stokResult.success) return { success: false, error: stokResult.error };

  const odemePlani = createOdemePlani(toplamTutar, yontem, taksitSayisi, siparisTarihi, input.manuelTaksitler);

  const doc = await Siparis.create({
    musteriId: input.musteriId,
    siparisNo,
    durum: "beklemede",
    toplamTutar,
    siparisTarihi,
    dinamikTeslimatAdresi: input.dinamikTeslimatAdresi,
    dinamikFaturaAdresi: input.dinamikFaturaAdresi,
    urunler: input.urunler,
    odemePlani,
  });

  await logIslem(session.user.id, "ekle", "siparisler");
  revalidatePath("/dashboard/siparis");
  return { success: true, data: JSON.parse(JSON.stringify(doc)) };
}

/* ---------- Durum güncelleme (transaction + otomatik kurulum) ---------- */

const statusFlow: Record<string, string[]> = {
  beklemede: ["onaylandi", "iptal"],
  onaylandi: ["hazirlaniyor", "iptal"],
  hazirlaniyor: ["kargoda", "iptal"],
  kargoda: ["teslim_edildi"],
  teslim_edildi: [],
  iptal: [],
};

export async function updateSiparisDurumAction(id: string, yeniDurum: string) {
  const authSession = await auth();
  if (!authSession?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();

  const siparis = await Siparis.findById(id).lean();
  if (!siparis) return { success: false, error: "Sipariş bulunamadı" };

  const allowed = statusFlow[siparis.durum] ?? [];
  if (!allowed.includes(yeniDurum)) {
    return { success: false, error: `${siparis.durum} → ${yeniDurum} geçersiz geçiş` };
  }

  // Durum güncelle + onaylandi ise kurulum oluştur
  await Siparis.findByIdAndUpdate(id, { $set: { durum: yeniDurum } });

  // İptal edilirse stokları geri ekle
  if (yeniDurum === "iptal") {
    await restoreStock(siparis.urunler);
  }

  // Teslim edildi ise her ürün için garanti oluştur (varsa atla)
  if (yeniDurum === "teslim_edildi") {
    for (const u of siparis.urunler) {
      const existingGaranti = await Garanti.findOne({
        siparisId: id,
        urunId: u.urunId,
      }).lean();

      if (!existingGaranti) {
        const urunDoc = await Urun.findById(u.urunId).lean();
        const warrantyMonths = (urunDoc as any)?.warrantyPeriodMonths ?? 24;
        if (warrantyMonths > 0) {
          const baslangic = new Date();
          const bitis = calculateWarrantyEndDate(baslangic, warrantyMonths);
          await Garanti.create({
            siparisId: id,
            musteriId: (siparis as any).musteriId,
            urunId: u.urunId,
            garantiBaslangic: baslangic,
            garantiBitis: bitis,
          });
        }
      }
    }
  }

  if (yeniDurum === "onaylandi") {
    const existing = await Kurulum.countDocuments({ siparisId: id });
    if (existing === 0) {
      const kurulumlar = siparis.urunler.map((u: any) => ({
        siparisId: siparis._id,
        urunId: u.urunId,
        kurulumTarihi: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 gün varsayılan
        durum: "planlandi" as const,
      }));
      await Kurulum.insertMany(kurulumlar);
    }
  }

  await logIslem(authSession.user.id, "guncelle", "siparisler");
  revalidatePath("/dashboard/siparis");
  revalidatePath("/dashboard/siparis/" + id);
  revalidatePath("/dashboard/garanti");
  if ((siparis as any).musteriId) {
    revalidatePath("/dashboard/musteri/" + (siparis as any).musteriId);
  }
  return { success: true };
}

/* ---------- Ödeme Planı Düzenle ---------- */

export async function updateOdemePlaniAction(
  siparisId: string,
  odemePlani: {
    yontem: "pesin" | "taksit" | "senet";
    taksitSayisi: number;
    taksitTutari: number;
    taksitler: { taksitNo: number; tutar: number; vadeTarihi: string; odendiMi: boolean; odemeTarihi: string | null }[];
  },
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();

  const siparis = await Siparis.findById(siparisId).lean();
  if (!siparis) return { success: false, error: "Sipariş bulunamadı" };

  const odenenTaksitSayisi = odemePlani.taksitler.filter((t) => t.odendiMi).length;

  const updated = await Siparis.findByIdAndUpdate(
    siparisId,
    {
      $set: {
        odemePlani: {
          yontem: odemePlani.yontem,
          taksitSayisi: odemePlani.taksitSayisi,
          taksitTutari: odemePlani.taksitTutari,
          odenenTaksitSayisi,
          taksitler: odemePlani.taksitler.map((t) => ({
            taksitNo: t.taksitNo,
            tutar: t.tutar,
            vadeTarihi: new Date(t.vadeTarihi),
            odendiMi: t.odendiMi,
            odemeTarihi: t.odemeTarihi ? new Date(t.odemeTarihi) : null,
          })),
        },
      },
    },
    { new: true },
  ).lean();

  await logIslem(session.user.id, "guncelle", "siparisler");
  revalidatePath("/dashboard/siparis/" + siparisId);
  return { success: true, data: JSON.parse(JSON.stringify(updated)) };
}
