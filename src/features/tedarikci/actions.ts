"use server";

import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import { Tedarikci, TedarikSiparis } from "./queries";
import { tedarikciSchema, tedarikSiparisSchema } from "./schema";
import type { Tedarikci as TedarikciType, TedarikSiparis as TSiparisType } from "./types";
import { logIslem } from "@/lib/audit";
import { uploadBase64 } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import { Urun } from "@/features/urun/queries";

/* ---------- Tedarikçi CRUD ---------- */

export async function getTedarikciListAction(): Promise<TedarikciType[]> {
  await connectDB();
  const docs = await Tedarikci.find().sort({ firmaAdi: 1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function createTedarikciAction(input: unknown) {
  const parsed = tedarikciSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors };

  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  const doc = await Tedarikci.create(parsed.data);
  await logIslem(session.user.id, "ekle", "tedarikciler", doc._id.toString());
  revalidatePath("/dashboard/tedarikci");
  return { success: true, data: JSON.parse(JSON.stringify(doc)) };
}

export async function updateTedarikciAction(id: string, input: unknown) {
  const parsed = tedarikciSchema.partial().safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors };

  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  await Tedarikci.findByIdAndUpdate(id, { $set: parsed.data });
  await logIslem(session.user.id, "guncelle", "tedarikciler", id);
  revalidatePath("/dashboard/tedarikci");
  revalidatePath(`/dashboard/tedarikci/${id}`);
  return { success: true };
}

export async function deleteTedarikciAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  await Tedarikci.findByIdAndDelete(id);
  await logIslem(session.user.id, "sil", "tedarikciler", id);
  revalidatePath("/dashboard/tedarikci");
  return { success: true };
}

export async function getTedarikciByIdAction(id: string) {
  await connectDB();
  const doc = await Tedarikci.findById(id).lean();
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}

export async function toggleTedarikciAktifAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();

  const t = await Tedarikci.findById(id).select("aktifMi").lean();
  if (!t) return { success: false, error: "Tedarikçi bulunamadı" };

  const yeniDeger = !t.aktifMi;
  const updateRes = await Tedarikci.updateOne({ _id: id }, { $set: { aktifMi: yeniDeger } });

  if (updateRes.modifiedCount === 0) {
    console.error("toggleTedarikciAktifAction: updateOne modifiedCount 0 for id", id);
    return { success: false, error: "Güncelleme başarısız" };
  }

  await logIslem(session.user.id, "guncelle", "tedarikciler", id);
  revalidatePath("/dashboard/tedarikci");
  revalidatePath(`/dashboard/tedarikci/${id}`);
  return { success: true, aktifMi: yeniDeger };
}

/* ---------- Tedarikçi Belgeleri ---------- */

export async function addTedarikciBelgeAction(tedarikciId: string, base64: string, aciklama: string, tur: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  try {
    const url = await uploadBase64(base64, "tedarikci-belgeler");
    await connectDB();
    await Tedarikci.findByIdAndUpdate(tedarikciId, {
      $push: { tedarikciBelgeleri: { url, aciklama, tur, yuklemeTarihi: new Date().toISOString() } },
    });
    await logIslem(session.user.id, "ekle", "tedarikciler", tedarikciId);
    revalidatePath(`/dashboard/tedarikci/${tedarikciId}`);
    return { success: true, url };
  } catch (e: any) {
    return { success: false, error: e.message || "Dosya yüklenemedi" };
  }
}

export async function deleteTedarikciBelgeAction(tedarikciId: string, belgeUrl: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  await Tedarikci.findByIdAndUpdate(tedarikciId, {
    $pull: { tedarikciBelgeleri: { url: belgeUrl } },
  });
  await logIslem(session.user.id, "sil", "tedarikciler", tedarikciId);
  revalidatePath(`/dashboard/tedarikci/${tedarikciId}`);
  return { success: true };
}

/* ---------- Tedarik Siparişleri ---------- */

export async function getTedarikSiparisListAction(): Promise<TSiparisType[]> {
  await connectDB();
  const docs = await TedarikSiparis.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function getTedarikSiparisByIdAction(id: string) {
  await connectDB();
  const doc = await TedarikSiparis.findById(id).lean();
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}

export async function getTedarikSiparisByTedarikciAction(tedarikciId: string): Promise<TSiparisType[]> {
  await connectDB();
  const docs = await TedarikSiparis.find({ tedarikciId }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function getTedarikSiparisUrunlerByTedarikciAction(tedarikciId: string) {
  await connectDB();
  const siparisler = await TedarikSiparis.find({ tedarikciId }).lean();
  const urunIdSet = new Set<string>();
  for (const s of siparisler) {
    for (const u of s.urunler) {
      urunIdSet.add(u.urunId.toString());
    }
  }
  const urunIds = [...urunIdSet];
  if (urunIds.length === 0) return [];
  const urunler = await Urun.find({ _id: { $in: urunIds } }).lean();
  return JSON.parse(JSON.stringify(urunler));
}

export async function createTedarikSiparisAction(input: unknown) {
  const parsed = tedarikSiparisSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors };

  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();
  const now = new Date();
  const doc = await TedarikSiparis.create({
    ...parsed.data,
    siparisTarihi: new Date(parsed.data.siparisTarihi),
    tahminiTeslimatTarihi: parsed.data.tahminiTeslimatTarihi ? new Date(parsed.data.tahminiTeslimatTarihi) : undefined,
    durum: "beklemede",
    durumGecmisi: [{ durum: "beklemede", tarih: now }],
  });
  await logIslem(session.user.id, "ekle", "tedarik_siparisleri", parsed.data.tedarikciId);
  revalidatePath("/dashboard/tedarikci");
  return { success: true, data: JSON.parse(JSON.stringify(doc)) };
}

export async function updateTedarikSiparisDurumAction(id: string, durum: "beklemede" | "yolda" | "teslim_alindi") {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };

  await connectDB();

  const now = new Date();
  const update: Record<string, any> = { durum };
  const pushUpdate: Record<string, any> = { durumGecmisi: { durum, tarih: now } };

  if (durum === "teslim_alindi") {
    const siparis = await TedarikSiparis.findById(id).lean();
    if (!siparis) return { success: false, error: "Sipariş bulunamadı" };

    const bulkOps = siparis.urunler.map((u: any) => ({
      updateOne: {
        filter: { _id: u.urunId },
        update: { $inc: { stok: u.adet } },
      },
    }));
    if (bulkOps.length > 0) await Urun.bulkWrite(bulkOps);
    update.teslimAlmaTarihi = now;
  }

  await TedarikSiparis.findByIdAndUpdate(id, { $set: update, $push: pushUpdate });
  await logIslem(session.user.id, "guncelle", "tedarik_siparisleri", id);
  revalidatePath("/dashboard/tedarikci");
  return { success: true };
}
