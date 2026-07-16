import type { ObjectId } from "mongoose";

export interface Kullanici {
  _id: string;
  adSoyad: string;
  eposta: string;
  sifre: string;
  rol: "admin" | "satis" | "montaj";
  aktifMi: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IslemKaydi {
  _id: string;
  kullaniciId: string | ObjectId;
  islem: string;
  koleksiyon: string;
  tarih: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bildirim {
  _id: string;
  kullaniciId: string | ObjectId;
  baslik: string;
  mesaj: string;
  tur: "stok_tukendi" | "siparis" | "garanti" | "kurulum" | "mesaj" | "diger";
  ilgiliUrunId?: string | null;
  linkUrl?: string;
  okunduMu: boolean;
  tarih: string;
  createdAt: string;
  updatedAt: string;
}
