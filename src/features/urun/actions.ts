"use server";

import mongoose from "mongoose";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db";
import { Urun } from "./queries";
import { urunSchema } from "./schema";
import type { Urun as UrunType } from "./types";
import { logIslem } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { getUploadParams } from "@/lib/cloudinary";

export async function getProductsAction(): Promise<UrunType[]> {
  await connectDB();
  const list = await Urun.find({ yayinlandiMi: true }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(list));
}

export async function getProductByIdAction(id: string): Promise<UrunType | null> {
  await connectDB();
  const doc = await Urun.findById(id).lean();
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}

export async function createProductAction(input: unknown) {
  const parsed = urunSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors };

  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  const product = await Urun.create(parsed.data);
  await logIslem(session.user.id, "ekle", "urunler");
  revalidatePath("/dashboard/urun");
  return { success: true, data: JSON.parse(JSON.stringify(product)) };
}

export async function updateProductAction(id: string, input: unknown) {
  const parsed = urunSchema.partial().safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors };

  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  const product = await Urun.findByIdAndUpdate(id, { $set: parsed.data }, { new: true }).lean();
  if (!product) return { success: false, error: "Ürün bulunamadı" };

  await logIslem(session.user.id, "guncelle", "urunler");
  revalidatePath("/dashboard/urun");
  return { success: true, data: JSON.parse(JSON.stringify(product)) };
}

export async function deleteProductAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  await Urun.findByIdAndDelete(id);
  await logIslem(session.user.id, "sil", "urunler");
  revalidatePath("/dashboard/urun");
  return { success: true };
}

export async function reorderImagesAction(productId: string, resimler: { resim: string; sira: number }[]) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  await Urun.findByIdAndUpdate(productId, { $set: { resimler } });
  await logIslem(session.user.id, "guncelle", "urunler");
  revalidatePath("/dashboard/urun");
  return { success: true };
}

export async function getCloudinaryUploadParams() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" } as const;
  return { success: true as const, ...getUploadParams() };
}

export async function getAllProductsAction(): Promise<UrunType[]> {
  await connectDB();
  const list = await Urun.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(list));
}

export async function getUrunListAction(params: {
  search?: string;
  kategoriId?: string;
  stokDurumu?: string;
  minFiyat?: number;
  maxFiyat?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  await connectDB();
  const { search, kategoriId, stokDurumu, minFiyat, maxFiyat, sort, page = 1, limit = 12 } = params;
  const filter: Record<string, unknown> = {};

  if (search) filter.urunAdi = { $regex: search, $options: "i" };
  if (kategoriId) {
    try { filter.kategoriId = new mongoose.Types.ObjectId(kategoriId); } catch { /* ignore */ }
  }
  if (stokDurumu === "var") filter.stok = { $gt: 0 };
  else if (stokDurumu === "yok") filter.stok = 0;
  if (minFiyat !== undefined || maxFiyat !== undefined) {
    const fiyatFilter: Record<string, number> = {};
    if (minFiyat !== undefined) fiyatFilter.$gte = minFiyat;
    if (maxFiyat !== undefined) fiyatFilter.$lte = maxFiyat;
    filter.fiyat = fiyatFilter;
  }

  let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === "fiyat-artan") sortObj = { fiyat: 1 };
  else if (sort === "fiyat-azalan") sortObj = { fiyat: -1 };
  else if (sort === "ad-a-z") sortObj = { urunAdi: 1 };
  else if (sort === "ad-z-a") sortObj = { urunAdi: -1 };

  const [docs, total] = await Promise.all([
    Urun.find(filter).sort(sortObj).skip((page - 1) * limit).limit(limit).lean(),
    Urun.countDocuments(filter),
  ]);

  return {
    data: JSON.parse(JSON.stringify(docs)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getFiyatAraligiAction() {
  await connectDB();
  const [cheapest, expensive] = await Promise.all([
    Urun.findOne().sort({ fiyat: 1 }).select("fiyat").lean(),
    Urun.findOne().sort({ fiyat: -1 }).select("fiyat").lean(),
  ]);
  return {
    min: ((cheapest as any)?.fiyat as number) ?? 0,
    max: ((expensive as any)?.fiyat as number) ?? 0,
  };
}
