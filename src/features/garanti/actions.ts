"use server";

import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db";
import { Garanti, GarantiTalebi } from "./queries";
import { Musteri } from "@/features/musteri/queries";
import { Urun, Kategori } from "@/features/urun/queries";
import { Bildirim } from "@/features/auth/queries";
import { logIslem } from "@/lib/audit";

function computeDurum(garantiBitis: string | Date): { durum: "aktif" | "suresi_doldu"; kalanGun: number } {
  const bitis = new Date(garantiBitis);
  const now = new Date();
  const kalanGun = Math.ceil((bitis.getTime() - now.getTime()) / 86400000);
  return { durum: kalanGun >= 0 ? "aktif" : "suresi_doldu", kalanGun: Math.max(kalanGun, 0) };
}

function mapGaranti(doc: any) {
  const { durum, kalanGun } = computeDurum(doc.garantiBitis);
  return { ...doc, durum, kalanGun };
}

export async function getGarantiListAction() {
  await connectDB();
  const docs = await Garanti.find().sort({ createdAt: -1 }).populate("siparisId musteriId urunId").lean();
  const mapped = await Promise.all(
    docs.map(async (doc) => {
      const g = mapGaranti(doc);
      const talepler = await GarantiTalebi.find({ garantiId: doc._id }).sort({ createdAt: -1 }).lean();
      const acikTalepSayisi = talepler.filter((t) => t.durum !== "cozuldu").length;
      return { ...g, talepler: JSON.parse(JSON.stringify(talepler)), acikTalepSayisi };
    }),
  );
  return JSON.parse(JSON.stringify(mapped));
}

export async function getGarantiByIdAction(id: string) {
  await connectDB();
  const doc = await Garanti.findById(id).populate("siparisId musteriId urunId").lean();
  if (!doc) return null;
  const talepler = await GarantiTalebi.find({ garantiId: id }).sort({ createdAt: -1 }).lean();
  return { ...JSON.parse(JSON.stringify(mapGaranti(doc))), talepler: JSON.parse(JSON.stringify(talepler)) };
}

export async function getAcilTaleplerSayisiAction() {
  await connectDB();
  const count = await GarantiTalebi.countDocuments({ durum: { $ne: "cozuldu" } });
  return count;
}

export async function getMusteriListMinAction() {
  await connectDB();
  const docs = await Musteri.find().select("_id adSoyad").sort({ adSoyad: 1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function getUrunListMinAction() {
  await connectDB();
  const docs = await Urun.find().select("_id urunAdi kategoriId").populate("kategoriId", "kategoriAdi").sort({ urunAdi: 1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function getKategoriListMinAction() {
  await connectDB();
  const docs = await Kategori.find().select("_id kategoriAdi").sort({ kategoriAdi: 1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function getYaklasanGarantiListAction() {
  await connectDB();
  const now = new Date();
  const otuzGunSonra = new Date(now.getTime() + 30 * 86400000);
  const docs = await Garanti.find({ garantiBitis: { $gte: now, $lte: otuzGunSonra } })
    .sort({ garantiBitis: 1 })
    .populate("siparisId musteriId urunId")
    .lean();
  return JSON.parse(JSON.stringify(docs.map(mapGaranti)));
}

export async function getUrunAktifGarantiSayisiAction(urunId: string) {
  await connectDB();
  const now = new Date();
  return Garanti.countDocuments({ urunId, garantiBitis: { $gte: now } });
}

export async function createGarantiTalebiAction(garantiId: string, aciklama: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  await GarantiTalebi.create({ garantiId, aciklama, durum: "acik" });
  await logIslem(session.user.id, "ekle", "garanti_talepleri");
  return { success: true };
}

export async function getGarantiTalebiByIdAction(id: string) {
  await connectDB();
  const doc = await GarantiTalebi.findById(id).populate({
    path: "garantiId",
    populate: [{ path: "urunId", select: "urunAdi" }, { path: "musteriId", select: "adSoyad" }],
  }).lean();
  return JSON.parse(JSON.stringify(doc));
}

export async function updateGarantiTalebiAction(id: string, data: { aciklama?: string }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  await GarantiTalebi.findByIdAndUpdate(id, data);
  await logIslem(session.user.id, "guncelle", "garanti_talepleri");
  return { success: true };
}

export async function updateGarantiTalebiDurumAction(
  id: string,
  durum: "acik" | "inceleniyor" | "cozuldu",
  cozumTuru?: "urun_incelendi" | "kullanici_hatasi",
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();

  const updateData: Record<string, any> = { durum };
  if (cozumTuru) updateData.cozumTuru = cozumTuru;

  const talep = await GarantiTalebi.findByIdAndUpdate(id, updateData, { new: true }).lean();
  if (!talep) return { success: false, error: "Talep bulunamadı" };

  await logIslem(session.user.id, "guncelle", "garanti_talepleri");

  if (durum === "cozuldu" && cozumTuru) {
    const garanti = await Garanti.findById(talep.garantiId).lean();
    if (garanti?.musteriId) {
      const baslik = cozumTuru === "urun_incelendi" ? "Ürün İncelendi" : "Kullanıcı Hatası";
      const mesaj = cozumTuru === "urun_incelendi"
        ? "Garanti talebiniz kapsamında ürün incelenmiştir."
        : "Garanti talebiniz kullanıcı hatası olarak işaretlenmiştir.";
      await Bildirim.create({ kullaniciId: garanti.musteriId, baslik, mesaj });
    }
  }

  return { success: true };
}
