import type { ObjectId } from "mongoose";

export interface Kurulum {
  _id: string;
  siparisId: string | ObjectId;
  urunId: string | ObjectId;
  montajKullaniciId?: string | ObjectId;
  kurulumTarihi: string;
  durum: "planlandi" | "tamamlandi" | "iptal";
  createdAt: string;
  updatedAt: string;
}

export interface KurulumFotografi {
  _id: string;
  kurulumId: string | ObjectId;
  resim: string;
  aciklama: string;
  createdAt: string;
  updatedAt: string;
}
