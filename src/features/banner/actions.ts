"use server";

import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db";
import { BannerModel } from "./queries";
import { logIslem } from "@/lib/audit";
import type { BannerInput } from "./schema";

export async function getBannerListAction() {
  await connectDB();
  const docs = await BannerModel.find().sort({ sira: 1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function createBannerAction(data: BannerInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  await connectDB();
  await BannerModel.create(data);
  await logIslem(session.user.id, "ekle", "banner");
  return { success: true };
}

export async function updateBannerAction(id: string, data: Partial<BannerInput>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  await connectDB();
  await BannerModel.findByIdAndUpdate(id, data);
  await logIslem(session.user.id, "guncelle", "banner");
  return { success: true };
}

export async function deleteBannerAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum gerekli" };
  await connectDB();
  await BannerModel.findByIdAndDelete(id);
  await logIslem(session.user.id, "sil", "banner");
  return { success: true };
}
