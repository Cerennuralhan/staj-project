import { Schema, model, models } from "mongoose";

const KategoriSchema = new Schema(
  { kategoriAdi: { type: String, required: true }, resim: { type: String, default: "" }, sira: { type: Number, default: 0 } },
  { timestamps: true },
);

const UrunResimSchema = new Schema({ resim: { type: String, required: true }, sira: { type: Number, default: 0 } }, { _id: false });

const UrunSchema = new Schema(
  {
    kategoriId: { type: Schema.Types.ObjectId, ref: "Kategori", required: true },
    urunAdi: { type: String, required: true, trim: true },
    aciklama: { type: String, default: "" },
    fiyat: { type: Number, required: true, min: 0 },
    stok: { type: Number, required: true, min: 0, default: 0 },
    kapakResmi: { type: String, default: "" },
    warrantyPeriodMonths: { type: Number, required: true, min: 1, max: 120, default: 24 },
    yayinlandiMi: { type: Boolean, default: true },
    resimler: { type: [UrunResimSchema], default: [] },
    renk: { type: [String], default: [] },
    materyal: { type: [String], default: [] },
    satisSayisi: { type: Number, default: 0 },
    oneCikan: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Kategori = models.Kategori || model("Kategori", KategoriSchema);
export const Urun = models.Urun || model("Urun", UrunSchema);

/* ---------- Stok yardımcıları ---------- */

export async function checkAndDecrementStock(
  items: { urunId: string; adet: number }[],
): Promise<{ success: true } | { success: false; error: string }> {
  const stokBitenUrunler: { id: string; adi: string }[] = [];

  for (const item of items) {
    const urun = await Urun.findById(item.urunId).select("urunAdi stok").lean();
    if (!urun) return { success: false, error: "Ürün bulunamadı" };
    if (urun.stok < item.adet) {
      return {
        success: false,
        error: `Yetersiz stok: "${urun.urunAdi}" için sadece ${urun.stok} adet kaldı.`,
      };
    }
  }
  for (const item of items) {
    const yeniStok = (await Urun.findByIdAndUpdate(item.urunId, { $inc: { stok: -item.adet } }, { new: true }).select("stok")) as any;
    if (yeniStok && yeniStok.stok <= 0) {
      const urun = await Urun.findById(item.urunId).select("urunAdi").lean() as any;
      stokBitenUrunler.push({ id: item.urunId.toString(), adi: urun?.urunAdi || "Ürün" });
    }
  }

  /* Stok biten ürünler için adminlere bildirim gönder */
  if (stokBitenUrunler.length > 0) {
    try {
      const { Kullanici } = await import("@/features/auth/queries");
      const { Bildirim } = await import("@/features/auth/queries");
      const adminler = await Kullanici.find({ rol: { $in: ["admin", "satis"] } }).select("_id").lean();
      const bildirimDocs = adminler.map((a: any) => ({
        kullaniciId: a._id,
        baslik: "Stok Tükendi",
        mesaj: stokBitenUrunler.map((u) => u.adi).join(", ") + " stokta tükendi.",
        tur: "stok_tukendi",
        ilgiliUrunId: stokBitenUrunler[0].id,
        linkUrl: `/dashboard/urun?q=${encodeURIComponent(stokBitenUrunler[0].adi)}&highlight=stok`,
        okunduMu: false,
        tarih: new Date(),
      }));
      await Bildirim.insertMany(bildirimDocs);
    } catch {}
  }

  return { success: true };
}

export async function restoreStock(
  items: { urunId: any; adet: number }[],
): Promise<void> {
  for (const item of items) {
    await Urun.findByIdAndUpdate(item.urunId, { $inc: { stok: item.adet } });
  }
}
