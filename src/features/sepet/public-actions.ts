"use server";

import { connectDB } from "@/lib/db";
import { Sepet } from "./queries";
import { Urun } from "@/features/urun/queries";

export async function sepetGetAction(uyeId?: string, misafirSepetId?: string) {
  await connectDB();
  let sepet = null;
  if (uyeId) {
    sepet = await Sepet.findOne({ uyeId }).lean();
  } else if (misafirSepetId) {
    sepet = await Sepet.findOne({ misafirSepetId }).lean();
  }
  return sepet ? JSON.parse(JSON.stringify(sepet)) : null;
}

export async function sepetDetayliGetirAction(uyeId?: string, misafirSepetId?: string) {
  await connectDB();
  let sepet = null;
  if (uyeId) {
    sepet = await Sepet.findOne({ uyeId }).lean();
  } else if (misafirSepetId) {
    sepet = await Sepet.findOne({ misafirSepetId }).lean();
  }
  if (!sepet || !sepet.urunler?.length) return { urunler: [], toplamTutar: 0 };

  const urunIds = sepet.urunler.map((u: any) => u.urunId);
  const urunler = await Urun.find({ _id: { $in: urunIds } }).lean();
  const urunMap = new Map(urunler.map((u: any) => [u._id.toString(), u]));

  const detayli = sepet.urunler.map((u: any) => {
    const urun = urunMap.get(u.urunId.toString());
    return {
      urunId: u.urunId.toString(),
      adet: u.adet,
      urunAdi: urun?.urunAdi || "",
      kapakResmi: urun?.kapakResmi || "",
      fiyat: urun?.fiyat || 0,
      stok: urun?.stok ?? 0,
    };
  });

  const toplamTutar = detayli.reduce((t: number, u: any) => t + u.fiyat * u.adet, 0);
  return { urunler: detayli, toplamTutar };
}

export async function sepetUrunEkleAction(
  urunId: string,
  adet: number,
  uyeId?: string,
  misafirSepetId?: string,
) {
  await connectDB();
  const filter = uyeId ? { uyeId } : { misafirSepetId };
  let sepet = await Sepet.findOne(filter).lean();

  if (sepet) {
    const existingUrun = sepet.urunler.find(
      (u: any) => u.urunId.toString() === urunId,
    );
    if (existingUrun) {
      await Sepet.updateOne(
        { _id: sepet._id, "urunler.urunId": urunId },
        { $inc: { "urunler.$.adet": adet }, $set: { guncellemeTarihi: new Date() } },
      );
    } else {
      await Sepet.updateOne(
        { _id: sepet._id },
        { $push: { urunler: { urunId, adet } }, $set: { guncellemeTarihi: new Date() } },
      );
    }
  } else {
    const doc: Record<string, any> = { urunler: [{ urunId, adet }], guncellemeTarihi: new Date() };
    if (uyeId) doc.uyeId = uyeId;
    if (misafirSepetId) doc.misafirSepetId = misafirSepetId;
    await Sepet.create(doc);
  }

  return { success: true };
}

export async function sepetUrunSilAction(
  urunId: string,
  uyeId?: string,
  misafirSepetId?: string,
) {
  await connectDB();
  const filter = uyeId ? { uyeId } : { misafirSepetId };
  await Sepet.updateOne(filter, {
    $pull: { urunler: { urunId } },
    $set: { guncellemeTarihi: new Date() },
  });
  return { success: true };
}

export async function sepetUrunAdetGuncelleAction(
  urunId: string,
  adet: number,
  uyeId?: string,
  misafirSepetId?: string,
) {
  await connectDB();
  const filter = uyeId ? { uyeId } : { misafirSepetId };
  if (adet <= 0) {
    return sepetUrunSilAction(urunId, uyeId, misafirSepetId);
  }
  await Sepet.updateOne(
    { ...filter, "urunler.urunId": urunId },
    { $set: { "urunler.$.adet": adet, guncellemeTarihi: new Date() } },
  );
  return { success: true };
}

export async function sepetTemizleAction(uyeId?: string, misafirSepetId?: string) {
  await connectDB();
  const filter = uyeId ? { uyeId } : { misafirSepetId };
  await Sepet.deleteOne(filter);
  return { success: true };
}

/* ---------- Misafir sepetini kullanıcı sepetiyle birleştir ---------- */

export async function sepetBirlestirAction(misafirSepetId: string, uyeId: string) {
  await connectDB();
  const misafirSepet = await Sepet.findOne({ misafirSepetId }).lean();
  if (!misafirSepet || !misafirSepet.urunler?.length) return { success: true };

  let uyeSepet = await Sepet.findOne({ uyeId }).lean();

  for (const urun of misafirSepet.urunler) {
    const urunIdStr = (urun as any).urunId.toString();
    const adet = (urun as any).adet;

    if (uyeSepet) {
      const existing = uyeSepet.urunler.find(
        (u: any) => u.urunId.toString() === urunIdStr,
      );
      if (existing) {
        await Sepet.updateOne(
          { _id: uyeSepet._id, "urunler.urunId": urunIdStr },
          { $inc: { "urunler.$.adet": adet } },
        );
      } else {
        await Sepet.updateOne(
          { _id: uyeSepet._id },
          { $push: { urunler: { urunId: urunIdStr, adet } } },
        );
      }
    } else {
      await Sepet.create({ uyeId, urunler: [{ urunId: urunIdStr, adet }], guncellemeTarihi: new Date() });
    }
  }

  // Misafir sepetini temizle
  await Sepet.deleteOne({ misafirSepetId });
  return { success: true };
}
