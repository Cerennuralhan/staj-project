import { connectDB } from "@/lib/db";
import { IslemKaydi } from "@/features/auth/queries";

export async function logIslem(
  kullaniciId: string,
  islem: "ekle" | "guncelle" | "sil",
  koleksiyon: string,
  hedefId?: string,
) {
  try {
    await connectDB();
    await IslemKaydi.create({
      kullaniciId,
      islem,
      koleksiyon,
      hedefId: hedefId || undefined,
      tarih: new Date(),
    });
  } catch (error) {
    console.error("İşlem kaydı oluşturulamadı:", error);
  }
}

export async function getIslemKayitlariByHedef(hedefId: string) {
  await connectDB();
  const docs = await IslemKaydi.find({ hedefId })
    .sort({ tarih: -1 })
    .limit(50)
    .populate("kullaniciId", "adSoyad eposta")
    .lean();
  return JSON.parse(JSON.stringify(docs));
}
