"use server";

import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db";
import { Kurulum, KurulumFotografi } from "./queries";
import { Kullanici, Bildirim } from "@/features/auth/queries";
import { Garanti } from "@/features/garanti/queries";
import { Urun } from "@/features/urun/queries";
import { Siparis } from "@/features/siparis/queries";
import { logIslem } from "@/lib/audit";

/* ---------- Liste / Detay (admin / satis) ---------- */

export async function getKurulumListAction() {
  await connectDB();
  const docs = await Kurulum.find()
    .sort({ createdAt: -1 })
    .populate({ path: "siparisId", populate: { path: "musteriId", select: "adSoyad" } })
    .populate("urunId")
    .populate("montajKullaniciId", "adSoyad")
    .lean();
  // her kurulum i00e7in foto011fraflar0131 da getir
  const result = await Promise.all(
    docs.map(async (d) => {
      const fotograflar = await KurulumFotografi.find({ kurulumId: d._id }).lean();
      return { ...d, fotograflar: JSON.parse(JSON.stringify(fotograflar)) };
    }),
  );
  return JSON.parse(JSON.stringify(result));
}

export async function getKurulumByIdAction(id: string) {
  await connectDB();
  const doc = await Kurulum.findById(id)
    .populate("siparisId")
    .populate("urunId")
    .populate("montajKullaniciId", "adSoyad")
    .lean();
  if (!doc) return null;
  const fotograflar = await KurulumFotografi.find({ kurulumId: id }).lean();
  return { ...JSON.parse(JSON.stringify(doc)), fotograflar: JSON.parse(JSON.stringify(fotograflar)) };
}

export async function updateKurulumDurumAction(id: string, durum: "planlandi" | "tamamlandi" | "iptal") {
  await connectDB();
  await Kurulum.findByIdAndUpdate(id, { durum });
  return { success: true };
}

/* ---------- Montaj kullanıcıları (atama için) ---------- */

export async function getMontajKullanicilarAction() {
  await connectDB();
  const docs = await Kullanici.find({ rol: "montaj", aktifMi: true }).select("adSoyad eposta").lean();
  return JSON.parse(JSON.stringify(docs));
}

/* ---------- Kurulum atama (admin / satis) ---------- */

export async function assignKurulumAction(
  kurulumId: string,
  montajKullaniciId: string,
  kurulumTarihi: string,
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  await Kurulum.findByIdAndUpdate(kurulumId, {
    montajKullaniciId,
    kurulumTarihi: new Date(kurulumTarihi),
  });
  await logIslem(session.user.id, "guncelle", "kurulumlar");
  return { success: true };
}

/* ---------- Montaj görünümü (kendi atanan kurulumları) ---------- */

export async function getMontajKurulumListAction(kullaniciId: string) {
  await connectDB();
  const docs = await Kurulum.find({ montajKullaniciId: kullaniciId })
    .sort({ createdAt: -1 })
    .populate("siparisId")
    .populate("urunId")
    .lean();
  // her kurulum i00e7in foto011fraflar0131 da getir
  const result = await Promise.all(
    docs.map(async (d) => {
      const fotograflar = await KurulumFotografi.find({ kurulumId: d._id }).lean();
      return { ...d, fotograflar: JSON.parse(JSON.stringify(fotograflar)) };
    }),
  );
  return JSON.parse(JSON.stringify(result));
}

/* ---------- Fotoğraf yükleme (Cloudinary URL'i kaydet) ---------- */

export async function uploadKurulumFotografiAction(
  kurulumId: string,
  resim: string,
  aciklama: string,
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  const kurulum = await Kurulum.findById(kurulumId).lean();
  if (!kurulum) return { success: false, error: "Kurulum bulunamadı" };
  if (kurulum.durum !== "planlandi")
    return { success: false, error: "Sadece planlanan kurulumlara fotoğraf eklenebilir" };

  await KurulumFotografi.create({ kurulumId, resim, aciklama });
  return { success: true };
}

/* ---------- Kurulum tamamlama (garanti + bildirim) ---------- */

export async function completeKurulumAction(kurulumId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();

  const kurulum = await Kurulum.findById(kurulumId).lean();
  if (!kurulum) return { success: false, error: "Kurulum bulunamadı" };
  if (kurulum.durum !== "planlandi")
    return { success: false, error: "Sadece planlanan kurulumlar tamamlanabilir" };

  // Fotoğraf kontrolü (server-side)
  const fotograflar = await KurulumFotografi.find({ kurulumId }).lean();
  if (fotograflar.length < 1)
    return { success: false, error: "En az 1 fotoğraf yüklenmelidir" };

  // Durumu güncelle
  await Kurulum.findByIdAndUpdate(kurulumId, { durum: "tamamlandi" });

  // Garanti oluştur (aynı siparisId+urunId için kayıt yoksa)
  const existingGaranti = await Garanti.findOne({
    siparisId: kurulum.siparisId,
    urunId: kurulum.urunId,
  }).lean();

  if (!existingGaranti) {
    const siparisDoc = await Siparis.findById(kurulum.siparisId).lean();
    const urunDoc = await Urun.findById(kurulum.urunId).lean();
    if (siparisDoc && urunDoc) {
      const warrantyMonths = (urunDoc as any).warrantyPeriodMonths ?? 24;
      const baslangic = new Date();
      const bitis = new Date(baslangic);
      bitis.setMonth(bitis.getMonth() + warrantyMonths);
      await Garanti.create({
        siparisId: kurulum.siparisId,
        musteriId: (siparisDoc as any).musteriId,
        urunId: kurulum.urunId,
        garantiBaslangic: baslangic,
        garantiBitis: bitis,
      });
    }
  }

  // Bildirim oluştur (admin + montaj rolündeki tüm kullanıcılara)
  const hedefKullanicilar = await Kullanici.find({
    rol: { $in: ["admin", "montaj"] },
    aktifMi: true,
  }).lean();

  const bildirimler = hedefKullanicilar.map((k) => ({
    kullaniciId: k._id,
    baslik: "Kurulum Tamamlandı",
    mesaj: `Kurulum #${kurulumId} tamamlandı.`,
    okunduMu: false,
    tarih: new Date(),
  }));
  if (bildirimler.length > 0) {
    await Bildirim.insertMany(bildirimler);
  }

  await logIslem(session.user.id, "guncelle", "kurulumlar");
  return { success: true };
}
