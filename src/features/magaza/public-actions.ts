"use server";

import { connectDB } from "@/lib/db";
import { Slider, Galeri, Sayfa, IletisimMesaji, Magaza } from "./queries";

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
    await IletisimMesaji.create({ ...input, tarih: new Date() });
    return { success: true };
  } catch (err) {
    console.error("Iletisim mesaji kayit hatasi:", err);
    return { success: false, error: "Mesaj kaydedilirken bir hata oluştu." };
  }
}
