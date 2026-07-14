"use server";

import { connectDB } from "@/lib/db";
import { Urun as UrunModel, Kategori as KategoriModel } from "./queries";
import type { Urun } from "./types";

export async function getPublicProducts(filters?: {
  kategoriId?: string;
  minFiyat?: number;
  maxFiyat?: number;
  renkler?: string[];
  materyaller?: string[];
  sirala?: string;
}): Promise<Urun[]> {
  await connectDB();
  const filter: any = { yayinlandiMi: true };

  if (filters?.kategoriId) filter.kategoriId = filters.kategoriId;
  if (filters?.minFiyat !== undefined || filters?.maxFiyat !== undefined) {
    filter.fiyat = {};
    if (filters?.minFiyat !== undefined) filter.fiyat.$gte = filters.minFiyat;
    if (filters?.maxFiyat !== undefined) filter.fiyat.$lte = filters.maxFiyat;
  }
  if (filters?.renkler?.length) filter.renk = { $in: filters.renkler };
  if (filters?.materyaller?.length) filter.materyal = { $in: filters.materyaller };

  let sort: any = { createdAt: -1 };
  if (filters?.sirala === "cok_satan") sort = { satisSayisi: -1 };
  else if (filters?.sirala === "dusuk_butce") sort = { fiyat: 1 };
  else if (filters?.sirala === "populer") sort = { oneCikan: -1, createdAt: -1 };
  else if (filters?.sirala === "kampanyali") sort = { oneCikan: -1, fiyat: 1 };

  const docs = await UrunModel.find(filter).sort(sort).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function getPublicProductById(id: string): Promise<Urun | null> {
  await connectDB();
  const doc = await UrunModel.findById(id).lean();
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}

export async function searchProductsAction(query: string): Promise<Urun[]> {
  await connectDB();
  if (!query.trim()) return [];
  const docs = await UrunModel.find({
    yayinlandiMi: true,
    urunAdi: { $regex: query.trim(), $options: "i" },
  })
    .limit(10)
    .lean();
  return JSON.parse(JSON.stringify(docs));
}

/* ---------- Filtre verileri ---------- */

export async function getKategoriCountsAction(): Promise<{ _id: string; kategoriAdi: string; count: number }[]> {
  await connectDB();
  const kategoriler = await KategoriModel.find().sort({ sira: 1 }).lean();
  const counts = await UrunModel.aggregate([
    { $match: { yayinlandiMi: true } },
    { $group: { _id: "$kategoriId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c: any) => [c._id.toString(), c.count]));
  return kategoriler.map((k: any) => ({
    _id: k._id.toString(),
    kategoriAdi: k.kategoriAdi,
    count: countMap.get(k._id.toString()) || 0,
  }));
}

export async function getFiyatAraligiAction(): Promise<{ min: number; max: number }> {
  await connectDB();
  const result = await UrunModel.aggregate([
    { $match: { yayinlandiMi: true } },
    { $group: { _id: null, min: { $min: "$fiyat" }, max: { $max: "$fiyat" } } },
  ]);
  if (!result.length) return { min: 0, max: 100000 };
  return { min: result[0].min, max: result[0].max };
}

export async function getRenklerAction(): Promise<string[]> {
  await connectDB();
  const result = await UrunModel.distinct("renk", { yayinlandiMi: true });
  return result.filter(Boolean).sort();
}

export async function getMateryallerAction(): Promise<string[]> {
  await connectDB();
  const result = await UrunModel.distinct("materyal", { yayinlandiMi: true });
  return result.filter(Boolean).sort();
}
