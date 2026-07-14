import { Schema, model, models } from "mongoose";

const SiparisUrunSchema = new Schema(
  { urunId: { type: Schema.Types.ObjectId, ref: "Urun", required: true }, urunAdi: { type: String, required: true }, kapakResmi: { type: String, default: "" }, adet: { type: Number, required: true, min: 1 }, fiyat: { type: Number, required: true, min: 0 } },
  { _id: false },
);

const TaksitSchema = new Schema(
  { taksitNo: { type: Number, required: true }, tutar: { type: Number, required: true }, vadeTarihi: { type: Date, required: true }, odendiMi: { type: Boolean, default: false }, odemeTarihi: { type: Date, default: null } },
  { _id: false },
);

const OdemePlaniSchema = new Schema(
  { yontem: { type: String, enum: ["pesin", "taksit", "senet"], required: true }, taksitSayisi: { type: Number, required: true }, taksitTutari: { type: Number, required: true }, odenenTaksitSayisi: { type: Number, default: 0 }, taksitler: { type: [TaksitSchema], default: [] } },
  { _id: false },
);

const SiparisSchema = new Schema(
  {
    musteriId: { type: Schema.Types.ObjectId, ref: "Musteri", required: true },
    siparisNo: { type: String, required: true, unique: true },
    durum: { type: String, enum: ["beklemede", "onaylandi", "hazirlaniyor", "kargoda", "teslim_edildi", "iptal"], default: "beklemede" },
    toplamTutar: { type: Number, required: true, min: 0 },
    siparisTarihi: { type: Date, default: Date.now },
    dinamikTeslimatAdresi: { type: String, required: true },
    dinamikFaturaAdresi: { type: String, required: true },
    urunler: { type: [SiparisUrunSchema], default: [] },
    odemePlani: { type: OdemePlaniSchema, default: null },
  },
  { timestamps: true, collection: "siparis" },
);

export const Siparis = models.Siparis || model("Siparis", SiparisSchema);
