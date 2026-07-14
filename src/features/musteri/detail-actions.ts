"use server";

import { connectDB } from "@/lib/db";
import { Musteri } from "./queries";
import { Siparis } from "@/features/siparis/queries";
import { Kurulum } from "@/features/kurulum/queries";
import { Garanti, GarantiTalebi } from "@/features/garanti/queries";

function computeGarantiDurum(bitis: string | Date): { durum: "aktif" | "suresi_doldu"; kalanGun: number } {
  const d = new Date(bitis);
  const kalanGun = Math.ceil((d.getTime() - Date.now()) / 86400000);
  return { durum: kalanGun >= 0 ? "aktif" : "suresi_doldu", kalanGun: Math.max(kalanGun, 0) };
}

export async function getMusteriDetayAction(id: string) {
  await connectDB();

  const [musteri, siparisler, garantiler] = await Promise.all([
    Musteri.findById(id).lean(),
    Siparis.find({ musteriId: id }).sort({ createdAt: -1 }).lean(),
    Garanti.find({ musteriId: id })
      .sort({ createdAt: -1 })
      .populate("urunId", "urunAdi kapakResmi")
      .populate("siparisId", "siparisNo")
      .lean(),
  ]);

  if (!musteri) return null;

  // Kurulumları sipariş ID'lerinden bul
  const siparisIds = siparisler.map((s) => s._id);
  const kurulumlar = siparisIds.length > 0
    ? await Kurulum.find({ siparisId: { $in: siparisIds } }).sort({ kurulumTarihi: -1 }).lean()
    : [];

  const garantiIds = garantiler.map((g) => g._id);
  const talepler = garantiIds.length > 0
    ? await GarantiTalebi.find({ garantiId: { $in: garantiIds } }).sort({ createdAt: -1 }).lean()
    : [];

  const mappedGarantiler = garantiler.map((g) => {
    const { durum, kalanGun } = computeGarantiDurum(g.garantiBitis);
    return { ...g, durum, kalanGun };
  });

  const mappedTalepler = talepler.map((t) => {
    const garanti = mappedGarantiler.find((g) => g._id.toString() === t.garantiId.toString());
    return { ...t, urunAdi: garanti?.urunId ?? "—" };
  });

  return {
    musteri: JSON.parse(JSON.stringify(musteri)),
    siparisler: JSON.parse(JSON.stringify(siparisler)),
    kurulumlar: JSON.parse(JSON.stringify(kurulumlar)),
    garantiler: JSON.parse(JSON.stringify(mappedGarantiler)),
    garantiTalepleri: JSON.parse(JSON.stringify(mappedTalepler)),
  };
}
