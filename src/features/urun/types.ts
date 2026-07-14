import type { ObjectId } from "mongoose";

export interface UrunResim {
  resim: string;
  sira: number;
}

export interface Urun {
  _id: string;
  kategoriId: string | ObjectId;
  urunAdi: string;
  aciklama: string;
  fiyat: number;
  stok: number;
  kapakResmi: string;
  warrantyPeriodMonths: number;
  yayinlandiMi: boolean;
  resimler: UrunResim[];
  renk: string[];
  materyal: string[];
  satisSayisi: number;
  oneCikan: boolean;
  createdAt: string;
  updatedAt: string;
}
