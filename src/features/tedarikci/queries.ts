import { Schema, model, models } from "mongoose";

const BankaBilgileriSchema = new Schema(
  { banka: { type: String, default: "" }, iban: { type: String, default: "" }, sube: { type: String, default: "" }, hesapNo: { type: String, default: "" }, paraBirimi: { type: String, default: "" } },
  { _id: false },
);

const TedarikciBelgeSchema = new Schema(
  { url: { type: String, default: "" }, aciklama: { type: String, default: "" }, tur: { type: String, default: "" }, yuklemeTarihi: { type: Date } },
  { _id: false },
);

const TedarikciSchema = new Schema(
  {
    firmaAdi: { type: String, required: true },
    telefon: { type: String, default: "" },
    eposta: { type: String, default: "" },
    logo: { type: String, default: "" },
    aktifMi: { type: Boolean, default: true },
    adres: { type: String, default: "" },
    vergiNo: { type: String, default: "" },
    vergiDairesi: { type: String, default: "" },
    mersisNo: { type: String, default: "" },
    kurulusYili: { type: String, default: "" },
    yetkiliKisi: { type: String, default: "" },
    calismaSaatleri: { type: String, default: "" },
    aciklama: { type: String, default: "" },
    bankaBilgileri: { type: BankaBilgileriSchema, default: {} },
    tedarikciBelgeleri: { type: [TedarikciBelgeSchema], default: [] },
  },
  { timestamps: true },
);

const TedarikSiparisUrunSchema = new Schema(
  { urunId: { type: Schema.Types.ObjectId, ref: "Urun", required: true }, urunAdi: { type: String, default: "" }, adet: { type: Number, required: true, min: 1 }, birimFiyat: { type: Number, default: 0 }, toplamTutar: { type: Number, default: 0 } },
  { _id: false },
);

const DurumGecisiSchema = new Schema(
  { durum: { type: String, required: true }, tarih: { type: Date, default: Date.now } },
  { _id: false },
);

const TeslimatBilgileriSchema = new Schema(
  { adres: { type: String, default: "" }, yontem: { type: String, default: "" }, kargoPlaka: { type: String, default: "" }, aciklama: { type: String, default: "" } },
  { _id: false },
);

const OdemeBilgileriSchema = new Schema(
  { odemeYontemi: { type: String, default: "" }, odemeTarihi: { type: Date }, odemeTutari: { type: Number, default: 0 }, paraBirimi: { type: String, default: "TRY" }, odemeDurumu: { type: String, default: "beklemede" }, bankaAdi: { type: String, default: "" }, referansNo: { type: String, default: "" } },
  { _id: false },
);

const TedarikSiparisSchema = new Schema(
  {
    tedarikciId: { type: Schema.Types.ObjectId, ref: "Tedarikci", required: true },
    siparisNo: { type: String, required: true },
    durum: { type: String, enum: ["beklemede", "yolda", "teslim_alindi"], default: "beklemede" },
    siparisTarihi: { type: Date, default: Date.now },
    tahminiTeslimatTarihi: { type: Date },
    teslimAlmaTarihi: { type: Date },
    urunler: { type: [TedarikSiparisUrunSchema], default: [] },
    durumGecmisi: { type: [DurumGecisiSchema], default: [] },
    teslimatBilgileri: { type: TeslimatBilgileriSchema, default: {} },
    odemeBilgileri: { type: OdemeBilgileriSchema, default: {} },
  },
  { timestamps: true, collection: "tedariksiparis" },
);

export const Tedarikci = models.Tedarikci || model("Tedarikci", TedarikciSchema);
export const TedarikSiparis = models.TedarikSiparis || model("TedarikSiparis", TedarikSiparisSchema);
