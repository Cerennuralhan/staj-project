import { Schema, model, models } from "mongoose";

const KurulumSchema = new Schema(
  {
    siparisId: { type: Schema.Types.ObjectId, ref: "Siparis", required: true },
    urunId: { type: Schema.Types.ObjectId, ref: "Urun", required: true },
    montajKullaniciId: { type: Schema.Types.ObjectId, ref: "Kullanici", default: null },
    kurulumTarihi: { type: Date, required: true },
    durum: { type: String, enum: ["planlandi", "tamamlandi", "iptal"], default: "planlandi" },
  },
  { timestamps: true },
);

const KurulumFotografiSchema = new Schema(
  { kurulumId: { type: Schema.Types.ObjectId, ref: "Kurulum", required: true }, resim: { type: String, required: true }, aciklama: { type: String, default: "" } },
  { timestamps: true },
);

export const Kurulum = models.Kurulum || model("Kurulum", KurulumSchema);
export const KurulumFotografi = models.KurulumFotografi || model("KurulumFotografi", KurulumFotografiSchema);
