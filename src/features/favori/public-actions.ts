"use server";

import { connectDB } from "@/lib/db";
import { Favori } from "./queries";

export async function favoriEkleAction(uyeId: string, urunId: string) {
  await connectDB();
  const existing = await Favori.findOne({ uyeId, urunId }).lean();
  if (existing) return { success: false, error: "Zaten favorilerde" };

  await Favori.create({ uyeId, urunId, tarih: new Date() });
  return { success: true };
}

export async function favoriSilAction(uyeId: string, urunId: string) {
  await connectDB();
  await Favori.deleteOne({ uyeId, urunId });
  return { success: true };
}

export async function favoriListAction(uyeId: string) {
  await connectDB();
  const docs = await Favori.find({ uyeId })
    .sort({ tarih: -1 })
    .populate("urunId")
    .lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function favoriKontrolAction(uyeId: string, urunId: string) {
  await connectDB();
  const doc = await Favori.findOne({ uyeId, urunId }).lean();
  return !!doc;
}
