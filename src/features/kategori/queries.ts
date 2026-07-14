import { Schema, model, models } from "mongoose";

const KategoriSchema = new Schema(
  {
    kategoriAdi: { type: String, required: true },
    resim: { type: String, default: "" },
    sira: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Kategori = models.Kategori || model("Kategori", KategoriSchema);
