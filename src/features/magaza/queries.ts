import { Schema, model, models } from "mongoose";

const TedarikciSchema = new Schema(
  { firmaAdi: { type: String, required: true }, telefon: { type: String, default: "" }, eposta: { type: String, default: "" } },
  { timestamps: true },
);

const TedarikSiparisUrunSchema = new Schema(
  { urunId: { type: Schema.Types.ObjectId, ref: "Urun", required: true }, adet: { type: Number, required: true, min: 1 } },
  { _id: false },
);

const TedarikSiparisSchema = new Schema(
  {
    tedarikciId: { type: Schema.Types.ObjectId, ref: "Tedarikci", required: true },
    siparisNo: { type: String, required: true },
    durum: { type: String, enum: ["beklemede", "yolda", "teslim_alindi"], default: "beklemede" },
    siparisTarihi: { type: Date, default: Date.now },
    urunler: { type: [TedarikSiparisUrunSchema], default: [] },
  },
  { timestamps: true, collection: "tedariksiparis" },
);

const SliderSchema = new Schema(
  { baslik: { type: String, default: "" }, resim: { type: String, default: "" }, butonYazisi: { type: String, default: "" }, butonLinki: { type: String, default: "" }, sira: { type: Number, default: 0 } },
  { timestamps: true },
);

const GaleriSchema = new Schema(
  { baslik: { type: String, default: "" }, resim: { type: String, default: "" }, tur: { type: String, default: "" }, sira: { type: Number, default: 0 } },
  { timestamps: true },
);

const SayfaSchema = new Schema(
  { baslik: { type: String, required: true }, slug: { type: String, required: true, unique: true }, icerik: { type: String, default: "" } },
  { timestamps: true },
);

const IletisimMesajiSchema = new Schema(
  { adSoyad: { type: String, required: true }, telefon: { type: String, default: "" }, eposta: { type: String, default: "" }, mesaj: { type: String, required: true }, tarih: { type: Date, default: Date.now }, okunduMu: { type: Boolean, default: false } },
  { timestamps: true },
);

const MagazaSchema = new Schema(
  {
    magazaAdi: { type: String, required: true },
    telefon: { type: String, default: "" },
    adres: { type: String, default: "" },
    logo: { type: String, default: "" },
    koordinat: { type: { lat: Number, lng: Number }, default: { lat: 0, lng: 0 } },
    disGorunusFotograflari: { type: [String], default: [] },
    defaultWarrantyPeriodMonths: { type: Number, default: 24, min: 1, max: 120 },
  },
  { timestamps: true },
);

export const Tedarikci = models.Tedarikci || model("Tedarikci", TedarikciSchema);
export const TedarikSiparis = models.TedarikSiparis || model("TedarikSiparis", TedarikSiparisSchema);
export const Slider = models.Slider || model("Slider", SliderSchema);
export const Galeri = models.Galeri || model("Galeri", GaleriSchema);
export const Sayfa = models.Sayfa || model("Sayfa", SayfaSchema);
export const IletisimMesaji = models.IletisimMesaji || model("IletisimMesaji", IletisimMesajiSchema);
export const Magaza = models.Magaza || model("Magaza", MagazaSchema);
