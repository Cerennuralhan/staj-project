"use server";

import { connectDB } from "@/lib/db";
import { Slider, Galeri, Sayfa, IletisimMesaji, Magaza } from "./queries";
import { Kullanici, Bildirim } from "@/features/auth/queries";

export async function getSliders() {
  await connectDB();
  const docs = await Slider.find().sort({ sira: 1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function getGaleri() {
  await connectDB();
  const docs = await Galeri.find().sort({ sira: 1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function getSayfaBySlug(slug: string) {
  await connectDB();
  const doc = await Sayfa.findOne({ slug }).lean();
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}

export async function getMagaza() {
  await connectDB();
  const doc = await Magaza.findOne().lean();
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}

export async function submitIletisim(input: {
  adSoyad: string;
  telefon: string;
  eposta: string;
  mesaj: string;
}) {
  try {
    await connectDB();
    const kayit = await IletisimMesaji.create({ ...input, tarih: new Date() });
    const mesajId = kayit._id.toString();

    const hedefKullanicilar = await Kullanici.find({
      rol: { $in: ["admin", "satis"] },
      aktifMi: true,
    }).select("_id").lean();

    if (hedefKullanicilar.length > 0) {
      const bildirimler = hedefKullanicilar.map((k) => ({
        kullaniciId: k._id,
        baslik: "Yeni İletişim Mesajı",
        mesaj: `${input.adSoyad} - ${input.mesaj.slice(0, 100)}${input.mesaj.length > 100 ? "..." : ""}`,
        tur: "mesaj" as const,
        linkUrl: `/dashboard/mesajlar?highlight=${mesajId}`,
        okunduMu: false,
        tarih: new Date(),
      }));
      await Bildirim.insertMany(bildirimler);
    }

    return { success: true };
  } catch (err) {
    console.error("Iletisim mesaji kayit hatasi:", err);
    return { success: false, error: "Mesaj kaydedilirken bir hata oluştu." };
  }
}
