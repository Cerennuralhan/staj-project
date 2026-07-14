"use server";

import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db";
import { Kategori } from "./queries";
import { kategoriSchema } from "./schema";
import type { Kategori as KategoriType } from "./types";
import { logIslem } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function getKategorilerAction(): Promise<KategoriType[]> {
  await connectDB();
  const list = await Kategori.find().sort({ sira: 1 }).lean();
  return JSON.parse(JSON.stringify(list));
}

export async function createKategoriAction(input: unknown) {
  const parsed = kategoriSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors };

  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  const kategori = await Kategori.create(parsed.data);
  await logIslem(session.user.id, "ekle", "kategoriler");
  revalidatePath("/dashboard/kategori");
  return { success: true, data: JSON.parse(JSON.stringify(kategori)) };
}

export async function updateKategoriAction(id: string, input: unknown) {
  const parsed = kategoriSchema.partial().safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors };

  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  const kategori = await Kategori.findByIdAndUpdate(id, { $set: parsed.data }, { new: true }).lean();
  if (!kategori) return { success: false, error: "Kategori bulunamadı" };

  await logIslem(session.user.id, "guncelle", "kategoriler");
  revalidatePath("/dashboard/kategori");
  return { success: true, data: JSON.parse(JSON.stringify(kategori)) };
}

export async function deleteKategoriAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  await Kategori.findByIdAndDelete(id);
  await logIslem(session.user.id, "sil", "kategoriler");
  revalidatePath("/dashboard/kategori");
  return { success: true };
}

export async function reorderKategoriAction(items: { _id: string; sira: number }[]) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  const ops = items.map((item) => ({
    updateOne: { filter: { _id: item._id }, update: { $set: { sira: item.sira } } },
  }));
  await Kategori.bulkWrite(ops);
  await logIslem(session.user.id, "guncelle", "kategoriler");
  revalidatePath("/dashboard/kategori");
  return { success: true };
}
