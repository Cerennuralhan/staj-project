import type { ObjectId } from "mongoose";

export interface BankaBilgileri {
  banka: string;
  iban: string;
  sube: string;
  hesapNo: string;
  paraBirimi: string;
}

export interface TedarikciBelge {
  url: string;
  aciklama: string;
  tur: string;
  yuklemeTarihi: string;
}

export interface Tedarikci {
  _id: string;
  firmaAdi: string;
  telefon: string;
  eposta: string;
  logo: string;
  aktifMi: boolean;
  adres: string;
  vergiNo: string;
  vergiDairesi: string;
  mersisNo: string;
  kurulusYili: string;
  yetkiliKisi: string;
  calismaSaatleri: string;
  aciklama: string;
  bankaBilgileri: BankaBilgileri;
  tedarikciBelgeleri: TedarikciBelge[];
  createdAt: string;
  updatedAt: string;
}

export interface TedarikSiparisUrun {
  urunId: string | ObjectId;
  urunAdi: string;
  adet: number;
  birimFiyat: number;
  toplamTutar: number;
}

export interface DurumGecisi {
  durum: string;
  tarih: string;
}

export interface TeslimatBilgileri {
  adres: string;
  yontem: string;
  kargoPlaka: string;
  aciklama: string;
}

export interface OdemeBilgileri {
  odemeYontemi: string;
  odemeTarihi?: string;
  odemeTutari: number;
  paraBirimi: string;
  odemeDurumu: string;
  bankaAdi: string;
  referansNo: string;
}

export interface TedarikSiparis {
  _id: string;
  tedarikciId: string | ObjectId;
  siparisNo: string;
  durum: "beklemede" | "yolda" | "teslim_alindi";
  siparisTarihi: string;
  tahminiTeslimatTarihi?: string;
  teslimAlmaTarihi?: string;
  urunler: TedarikSiparisUrun[];
  durumGecmisi: DurumGecisi[];
  teslimatBilgileri: TeslimatBilgileri;
  odemeBilgileri: OdemeBilgileri;
  createdAt: string;
  updatedAt: string;
}
