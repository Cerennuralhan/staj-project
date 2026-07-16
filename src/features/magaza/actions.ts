"use server";

import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db";
import { Slider, Galeri, Sayfa, IletisimMesaji, Magaza } from "./queries";
import { Kullanici } from "@/features/auth/queries";
import { Musteri } from "@/features/musteri/queries";
import { hasPermission } from "@/lib/auth/permissions";
import { logIslem } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import type { SliderInput, GaleriInput, SayfaInput, MagazaInput } from "./schema";
import { magazaSchema } from "./schema";

export async function getSliderListAction() {
  await connectDB();
  const docs = await Slider.find().sort({ sira: 1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function createSliderAction(data: SliderInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  await connectDB();
  await Slider.create(data);
  await logIslem(session.user.id, "ekle", "slider");
  return { success: true };
}

export async function updateSliderAction(id: string, data: Partial<SliderInput>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  await connectDB();
  await Slider.findByIdAndUpdate(id, data);
  await logIslem(session.user.id, "guncelle", "slider");
  return { success: true };
}

export async function deleteSliderAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  await connectDB();
  await Slider.findByIdAndDelete(id);
  await logIslem(session.user.id, "sil", "slider");
  return { success: true };
}

export async function getGaleriListAction() {
  await connectDB();
  const docs = await Galeri.find().sort({ sira: 1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function createGaleriAction(data: GaleriInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  await connectDB();
  await Galeri.create(data);
  await logIslem(session.user.id, "ekle", "galeri");
  return { success: true };
}

export async function updateGaleriAction(id: string, data: Partial<GaleriInput>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  await connectDB();
  await Galeri.findByIdAndUpdate(id, data);
  await logIslem(session.user.id, "guncelle", "galeri");
  return { success: true };
}

export async function deleteGaleriAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  await connectDB();
  await Galeri.findByIdAndDelete(id);
  await logIslem(session.user.id, "sil", "galeri");
  return { success: true };
}

export async function getSayfaListAction() {
  await connectDB();
  const docs = await Sayfa.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function createSayfaAction(data: SayfaInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  await connectDB();
  await Sayfa.create(data);
  await logIslem(session.user.id, "ekle", "sayfalar");
  return { success: true };
}

export async function updateSayfaAction(id: string, data: Partial<SayfaInput>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  await connectDB();
  await Sayfa.findByIdAndUpdate(id, data);
  await logIslem(session.user.id, "guncelle", "sayfalar");
  return { success: true };
}

export async function deleteSayfaAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  await connectDB();
  await Sayfa.findByIdAndDelete(id);
  await logIslem(session.user.id, "sil", "sayfalar");
  return { success: true };
}

export async function getIletisimMesajlariAction() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const kullanici = await Kullanici.findById(session.user.id).select("rol").lean();
  if (!kullanici) return [];

  if (!hasPermission((kullanici as any).rol as any, "mesaj")) return [];

  await connectDB();
  const docs = await IletisimMesaji.find().sort({ tarih: -1 }).lean();
  const epostalar = [...new Set(docs.filter(d => d.eposta).map(d => d.eposta))] as string[];
  const musteriler = await Musteri.find({ eposta: { $in: epostalar } }).select("_id eposta adSoyad").lean();
  const epostaMap = new Map(musteriler.map(m => [m.eposta, m]));
  const result = docs.map(d => ({
    ...d,
    musteriId: d.eposta ? epostaMap.get(d.eposta) || null : null,
  }));
  return JSON.parse(JSON.stringify(result));
}

export async function getOkunmamisMesajSayisiAction() {
  await connectDB();
  return IletisimMesaji.countDocuments({ $or: [{ okunduMu: false }, { okunduMu: { $exists: false } }] });
}

export async function markIletisimMesajiOkunduAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  await connectDB();
  await IletisimMesaji.findByIdAndUpdate(id, { $set: { okunduMu: true } });
  return { success: true };
}

export async function markIletisimMesajiOkunmadiAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  await connectDB();
  await IletisimMesaji.findByIdAndUpdate(id, { $set: { okunduMu: false } });
  return { success: true };
}

export async function markAllIletisimMesajlariOkunduAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  await connectDB();
  await IletisimMesaji.updateMany(
    { $or: [{ okunduMu: false }, { okunduMu: { $exists: false } }] },
    { $set: { okunduMu: true } },
  );
  return { success: true };
}

export async function deleteIletisimMesajiAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  await connectDB();
  await IletisimMesaji.findByIdAndDelete(id);
  await logIslem(session.user.id, "sil", "iletisim_mesajlari");
  return { success: true };
}

export async function getMagazaAction() {
  await connectDB();
  const doc = await Magaza.findOne().lean();
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}

export async function updateMagazaAction(data: MagazaInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  const parsed = magazaSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors.map((e) => e.message).join(", ") };
  try {
    await connectDB();
    const existing = await Magaza.findOne();
    if (existing) {
      await Magaza.findByIdAndUpdate(existing._id, parsed.data);
    } else {
      await Magaza.create(parsed.data);
    }
    await logIslem(session.user.id, "guncelle", "magaza");
    revalidatePath("/dashboard/magaza");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function getIletisimMesajiByIdAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const kullanici = await Kullanici.findById(session.user.id).select("rol").lean();
  if (!kullanici) return null;
  if (!hasPermission((kullanici as any).rol as any, "mesaj")) return null;

  await connectDB();
  const doc = await IletisimMesaji.findById(id).lean();
  if (!doc) return null;

  const musteri = doc.eposta
    ? await Musteri.findOne({ eposta: doc.eposta }).select("_id eposta adSoyad").lean()
    : null;

  return JSON.parse(JSON.stringify({ ...doc, musteriId: musteri || null }));
}

export async function getDefaultWarrantyPeriodAction(): Promise<number> {
  await connectDB();
  const magaza = await Magaza.findOne().select("defaultWarrantyPeriodMonths").lean();
  return (magaza as any)?.defaultWarrantyPeriodMonths ?? 24;
}
