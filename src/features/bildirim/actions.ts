"use server";

import { connectDB } from "@/lib/db";
import { Bildirim } from "@/features/auth/queries";

export async function getBildirimListAction(kullaniciId: string) {
  await connectDB();
  const docs = await Bildirim.find({ kullaniciId })
    .sort({ tarih: -1 })
    .limit(20)
    .lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function getOkunmamisBildirimSayisiAction(kullaniciId: string) {
  await connectDB();
  return Bildirim.countDocuments({ kullaniciId, okunduMu: false });
}

export async function bildirimOkunduAction(bildirimId: string) {
  await connectDB();
  await Bildirim.findByIdAndUpdate(bildirimId, { okunduMu: true });
  return { success: true };
}

export async function tumBildirimlerOkunduAction(kullaniciId: string) {
  await connectDB();
  await Bildirim.updateMany({ kullaniciId, okunduMu: false }, { okunduMu: true });
  return { success: true };
}
