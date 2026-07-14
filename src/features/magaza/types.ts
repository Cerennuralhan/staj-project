import type { ObjectId } from "mongoose";

export interface Tedarikci {
  _id: string;
  firmaAdi: string;
  telefon: string;
  eposta: string;
  createdAt: string;
  updatedAt: string;
}

export interface TedarikSiparisUrun {
  urunId: string | ObjectId;
  adet: number;
}

export interface TedarikSiparis {
  _id: string;
  tedarikciId: string | ObjectId;
  siparisNo: string;
  durum: "beklemede" | "yolda" | "teslim_alindi";
  siparisTarihi: string;
  urunler: TedarikSiparisUrun[];
  createdAt: string;
  updatedAt: string;
}

export interface Slider {
  _id: string;
  baslik: string;
  resim: string;
  butonYazisi: string;
  butonLinki: string;
  sira: number;
}

export interface Galeri {
  _id: string;
  baslik: string;
  resim: string;
  tur: string;
  sira: number;
}

export interface Sayfa {
  _id: string;
  baslik: string;
  slug: string;
  icerik: string;
  createdAt: string;
  updatedAt: string;
}

export interface IletisimMesaji {
  _id: string;
  adSoyad: string;
  telefon: string;
  eposta: string;
  mesaj: string;
  tarih: string;
  okunduMu?: boolean;
}

export interface Magaza {
  _id: string;
  magazaAdi: string;
  telefon: string;
  adres: string;
  logo: string;
  koordinat: { lat: number; lng: number };
  disGorunusFotograflari: string[];
  defaultWarrantyPeriodMonths: number;
}
