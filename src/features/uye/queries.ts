import { Schema, model, models } from "mongoose";

const UyeSchema = new Schema(
  {
    ad: { type: String, required: true },
    soyad: { type: String, required: true },
    eposta: { type: String, required: true, unique: true },
    cepTelefonu: { type: String, required: true },
    sifre: { type: String, required: true },
    adres: { type: String, default: "" },
    kvkkOnay: { type: Boolean, required: true },
    bultenOnay: { type: Boolean, default: false },
    sifreSifirlamaTokeni: { type: String, default: null },
    sifreSifirlamaSonTarih: { type: Date, default: null },
    olusturmaTarihi: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const Uye = models.Uye || model("Uye", UyeSchema);
