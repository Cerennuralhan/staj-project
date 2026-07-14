import { Schema, model, models } from "mongoose";

const FavoriSchema = new Schema(
  {
    uyeId: { type: Schema.Types.ObjectId, ref: "Uye", required: true },
    urunId: { type: Schema.Types.ObjectId, ref: "Urun", required: true },
    tarih: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

FavoriSchema.index({ uyeId: 1, urunId: 1 }, { unique: true });

export const Favori = models.Favori || model("Favori", FavoriSchema);
