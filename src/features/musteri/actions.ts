"use server";

import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db";
import { Musteri } from "./queries";
import { Siparis } from "@/features/siparis/queries";
import { musteriSchema } from "./schema";
import type { Musteri as MusteriType } from "./types";
import { logIslem } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function getMusteriListAction(params: {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  bultenOnay?: boolean;
}) {
  await connectDB();
  const { search, page = 1, limit = 20, sort = "-createdAt", bultenOnay } = params;
  const filter: Record<string, unknown> = {};

  if (search) {
    const re = { $regex: search, $options: "i" };
    filter.$or = [{ adSoyad: re }, { telefon: re }, { eposta: re }];
  }

  if (bultenOnay !== undefined) {
    filter.bultenOnay = bultenOnay;
  }

  const sortObj: Record<string, 1 | -1> = {};
  if (sort.startsWith("-")) { sortObj[sort.slice(1)] = -1; } else { sortObj[sort] = 1; }

  const [docs, total] = await Promise.all([
    Musteri.find(filter).sort(sortObj).skip((page - 1) * limit).limit(limit).lean(),
    Musteri.countDocuments(filter),
  ]);

  return {
    data: JSON.parse(JSON.stringify(docs)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getMusteriOzetAction() {
  await connectDB();
  const now = new Date();
  const ayBasi = new Date(now.getFullYear(), now.getMonth(), 1);
  const ucAyOnce = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  const [toplam, buAyYeni, bultenAbone, sonGuncelleDoc] = await Promise.all([
    Musteri.countDocuments(),
    Musteri.countDocuments({ createdAt: { $gte: ayBasi } }),
    Musteri.countDocuments({ bultenOnay: true }),
    Musteri.findOne().sort({ updatedAt: -1 }).select("updatedAt").lean(),
  ]);

  // Son 3 ayda sipariş vermiş müşteri sayısı
  const aktifSiparisMusteriIds = await Siparis.distinct("musteriId", {
    siparisTarihi: { $gte: ucAyOnce },
  });

  return {
    toplam,
    buAyYeni,
    bultenAbone,
    aktif: aktifSiparisMusteriIds.length,
    sonGuncelleme: sonGuncelleDoc ? (sonGuncelleDoc as any).updatedAt : null,
  };
}

export async function getAllMusteriListAction(filter?: Record<string, unknown>) {
  await connectDB();
  const docs = await Musteri.find(filter || {}).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function getBultenAboneListAction() {
  await connectDB();
  const docs = await Musteri.find({ bultenOnay: true })
    .select("adSoyad eposta")
    .sort({ adSoyad: 1 })
    .lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function getMusteriByIdAction(id: string) {
  await connectDB();
  const doc = await Musteri.findById(id).lean();
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}

export async function createMusteriAction(input: unknown) {
  const parsed = musteriSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors };

  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  const doc = await Musteri.create(parsed.data);
  await logIslem(session.user.id, "ekle", "musteriler");
  revalidatePath("/dashboard/musteri");
  return { success: true, data: JSON.parse(JSON.stringify(doc)) };
}

export async function updateMusteriAction(id: string, input: unknown) {
  const parsed = musteriSchema.partial().safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors };

  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  const doc = await Musteri.findByIdAndUpdate(id, { $set: parsed.data }, { new: true }).lean();
  if (!doc) return { success: false, error: "Müşteri bulunamadı" };
  await logIslem(session.user.id, "guncelle", "musteriler");
  revalidatePath("/dashboard/musteri");
  return { success: true, data: JSON.parse(JSON.stringify(doc)) };
}

export async function deleteMusteriAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  await connectDB();
  await Musteri.findByIdAndDelete(id);
  await logIslem(session.user.id, "sil", "musteriler");
  revalidatePath("/dashboard/musteri");
  return { success: true };
}

export async function getMusteriOdemelerAction(musteriId: string) {
  await connectDB();
  const siparisler = await Siparis.find({ musteriId: musteriId })
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(siparisler));
}

export async function updateMusteriNotAction(id: string, notlar: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  await connectDB();
  await Musteri.findByIdAndUpdate(id, { notlar });
  await logIslem(session.user.id, "guncelle", "musteriler");
  revalidatePath("/dashboard/musteri");
  revalidatePath(`/dashboard/musteri/${id}`);
  return { success: true };
}
