import { Schema, model, models } from "mongoose";

const KullaniciSchema = new Schema(
  { adSoyad: { type: String, required: true }, eposta: { type: String, required: true, unique: true }, sifre: { type: String, required: true }, rol: { type: String, enum: ["admin", "satis", "montaj"], default: "satis" }, aktifMi: { type: Boolean, default: true } },
  { timestamps: true },
);

const IslemKaydiSchema = new Schema(
  { kullaniciId: { type: Schema.Types.ObjectId, ref: "Kullanici", required: true }, islem: { type: String, required: true }, koleksiyon: { type: String, required: true }, tarih: { type: Date, default: Date.now }, hedefId: { type: Schema.Types.ObjectId } },
  { timestamps: true },
);

const BildirimSchema = new Schema(
  { kullaniciId: { type: Schema.Types.ObjectId, ref: "Kullanici", required: true }, baslik: { type: String, required: true }, mesaj: { type: String, required: true }, okunduMu: { type: Boolean, default: false }, tarih: { type: Date, default: Date.now } },
  { timestamps: true },
);

export const Kullanici = models.Kullanici || model("Kullanici", KullaniciSchema);
export const IslemKaydi = models.IslemKaydi || model("IslemKaydi", IslemKaydiSchema);
export const Bildirim = models.Bildirim || model("Bildirim", BildirimSchema);
