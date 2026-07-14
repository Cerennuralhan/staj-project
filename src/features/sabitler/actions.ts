"use server";

import { connectDB } from "@/lib/db";
import { Sabit } from "./queries";

export async function getSabitAction(anahtar: string) {
  await connectDB();
  const doc = await Sabit.findOne({ anahtar }).lean();
  return doc ? doc.deger : null;
}

export async function setSabitAction(anahtar: string, deger: any) {
  await connectDB();
  await Sabit.updateOne({ anahtar }, { $set: { anahtar, deger } }, { upsert: true });
  return { success: true };
}
