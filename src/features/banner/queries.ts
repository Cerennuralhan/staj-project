import { Schema, model, models } from "mongoose";

const BannerSchema = new Schema(
  {
    baslik: { type: String, default: "" },
    aciklama: { type: String, default: "" },
    butonYazisi: { type: String, default: "" },
    butonLinki: { type: String, default: "" },
    resim: { type: String, default: "" },
    sira: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const BannerModel = models.Banner || model("Banner", BannerSchema);
