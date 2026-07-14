import { Schema, model, models } from "mongoose";

const MusteriSchema = new Schema(
  {
    adSoyad: { type: String, required: true },
    telefon: { type: String, default: "" },
    alternatifTelefon: { type: String, default: "" },
    eposta: { type: String, default: "" },
    dogumTarihi: { type: Date, default: null },
    cinsiyet: { type: String, enum: ["erkek", "kadin", "belirtilmemis"], default: "belirtilmemis" },
    uyruk: { type: String, default: "" },
    tcVergiNo: { type: String, default: "" },
    musteriDurumu: { type: String, enum: ["aktif", "pasif", "askida"], default: "aktif" },
    adres: { type: String, default: "" },
    faturaSokak: { type: String, default: "" },
    faturaMahalleIlce: { type: String, default: "" },
    faturaSehir: { type: String, default: "" },
    faturaPostaKodu: { type: String, default: "" },
    faturaUlke: { type: String, default: "" },
    faturaTeslimatAyni: { type: Boolean, default: false },
    odemeYontemi: { type: String, default: "" },
    iban: { type: String, default: "" },
    bankaAdi: { type: String, default: "" },
    hesapSahibi: { type: String, default: "" },
    notlar: { type: String, default: "" },
    bultenOnay: { type: Boolean, default: false },
    uyeId: { type: Schema.Types.ObjectId, ref: "Uye", default: null },
  },
  { timestamps: true },
);

MusteriSchema.index({ uyeId: 1 }, { sparse: true });

export const Musteri = models.Musteri || model("Musteri", MusteriSchema);
