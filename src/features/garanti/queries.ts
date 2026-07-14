import { Schema, model, models } from "mongoose";

const GarantiSchema = new Schema(
  {
    siparisId: { type: Schema.Types.ObjectId, ref: "Siparis", required: true },
    musteriId: { type: Schema.Types.ObjectId, ref: "Musteri", required: true },
    urunId: { type: Schema.Types.ObjectId, ref: "Urun", required: true },
    seriNo: { type: String, default: "" },
    garantiBaslangic: { type: Date, required: true },
    garantiBitis: { type: Date, required: true },
  },
  { timestamps: true },
);

const GarantiTalebiSchema = new Schema(
  { garantiId: { type: Schema.Types.ObjectId, ref: "Garanti", required: true }, aciklama: { type: String, required: true }, durum: { type: String, enum: ["acik", "inceleniyor", "cozuldu"], default: "acik" }, cozumTuru: { type: String, enum: ["urun_incelendi", "kullanici_hatasi"] } },
  { timestamps: true },
);

export const Garanti = models.Garanti || model("Garanti", GarantiSchema);
export const GarantiTalebi = models.GarantiTalebi || model("GarantiTalebi", GarantiTalebiSchema);
