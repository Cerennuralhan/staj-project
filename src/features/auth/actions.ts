"use server";

import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db";
import { Kullanici, IslemKaydi, Bildirim } from "./queries";
import { logIslem } from "@/lib/audit";
import bcrypt from "bcryptjs";

export async function getKullaniciListAction() {
  await connectDB();
  const docs = await Kullanici.find().select("-sifre").sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function createKullaniciAction(data: { adSoyad: string; eposta: string; sifre: string; rol: "admin" | "satis" | "montaj" }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  const existing = await Kullanici.findOne({ eposta: data.eposta });
  if (existing) return { success: false, error: "Bu e-posta zaten kayıtlı" };
  const hashed = await bcrypt.hash(data.sifre, 12);
  await Kullanici.create({ ...data, sifre: hashed, aktifMi: true });
  await logIslem(session.user.id, "ekle", "kullanicilar");
  return { success: true };
}

export async function updateKullaniciAction(id: string, data: { adSoyad?: string; eposta?: string; rol?: "admin" | "satis" | "montaj"; aktifMi?: boolean }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  await Kullanici.findByIdAndUpdate(id, data);
  await logIslem(session.user.id, "guncelle", "kullanicilar");
  return { success: true };
}

export async function deleteKullaniciAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  await Kullanici.findByIdAndDelete(id);
  await logIslem(session.user.id, "sil", "kullanicilar");
  return { success: true };
}

export async function getIslemKayitlariAction() {
  await connectDB();
  const docs = await IslemKaydi.find().sort({ tarih: -1 }).limit(200).populate("kullaniciId", "adSoyad eposta").lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function getBildirimListAction() {
  await connectDB();
  const docs = await Bildirim.find().sort({ tarih: -1 }).limit(50).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function createBildirimAction(kullaniciId: string, baslik: string, mesaj: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  await Bildirim.create({ kullaniciId, baslik, mesaj });
  return { success: true };
}
