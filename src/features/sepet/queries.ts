import { Schema, model, models } from "mongoose";

const SepetUrunSchema = new Schema(
  { urunId: { type: Schema.Types.ObjectId, ref: "Urun", required: true }, adet: { type: Number, required: true, min: 1 } },
  { _id: false },
);

const SepetSchema = new Schema(
  {
    uyeId: { type: Schema.Types.ObjectId, ref: "Uye", default: null },
    misafirSepetId: { type: String, default: null },
    urunler: { type: [SepetUrunSchema], default: [] },
    guncellemeTarihi: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

SepetSchema.index({ uyeId: 1 });
SepetSchema.index({ misafirSepetId: 1 });

export const Sepet = models.Sepet || model("Sepet", SepetSchema);
