import { Schema, model, models } from "mongoose";

const FaturaKalemSchema = new Schema(
  {
    urunAdi: { type: String, required: true },
    adet: { type: Number, required: true, min: 1 },
    birimFiyat: { type: Number, required: true, min: 0 },
    kdvOrani: { type: Number, required: true },
    araToplam: { type: Number, required: true },
    kdvTutari: { type: Number, required: true },
  },
  { _id: false },
);

const FaturaSchema = new Schema(
  {
    faturaNo: { type: String, required: true, unique: true },
    tedarikciId: { type: Schema.Types.ObjectId, ref: "Tedarikci", required: true },
    tedarikciBilgi: {
      firmaAdi: String,
      adres: String,
      telefon: String,
      eposta: String,
      vergiDairesi: String,
      vergiNo: String,
    },
    aliciBilgi: {
      firmaAdi: String,
      adres: String,
      telefon: String,
      eposta: String,
      vergiDairesi: String,
      vergiNo: String,
    },
    kalemler: { type: [FaturaKalemSchema], required: true, validate: [(v: any[]) => v.length > 0, "En az bir kalem gerekli"] },
    odemeSekli: { type: String, required: true },
    vadeTarihi: { type: Date },
    teslimatNotu: { type: String, default: "" },
    araToplam: { type: Number, required: true },
    kdvTutari: { type: Number, required: true },
    genelToplam: { type: Number, required: true },
    dosyaUrl: { type: String, default: "" },
  },
  { timestamps: true, collection: "faturalar" },
);

const FaturaSayacSchema = new Schema({
  _id: { type: String, required: true },
  sira: { type: Number, required: true, default: 0 },
});

export const Fatura = models.Fatura || model("Fatura", FaturaSchema);
export const FaturaSayac = models.FaturaSayac || model("FaturaSayac", FaturaSayacSchema);
