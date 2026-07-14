import type { ObjectId } from "mongoose";

export interface Taksit {
  taksitNo: number;
  tutar: number;
  vadeTarihi: string;
  odendiMi: boolean;
  odemeTarihi: string | null;
}

export interface OdemePlani {
  yontem: "pesin" | "taksit" | "senet";
  taksitSayisi: number;
  taksitTutari: number;
  odenenTaksitSayisi: number;
  taksitler: Taksit[];
}

export interface SiparisUrun {
  urunId: string | ObjectId;
  urunAdi: string;
  kapakResmi: string;
  adet: number;
  fiyat: number;
}

export interface Siparis {
  _id: string;
  musteriId: string | ObjectId;
  siparisNo: string;
  durum: "beklemede" | "onaylandi" | "hazirlaniyor" | "kargoda" | "teslim_edildi" | "iptal";
  toplamTutar: number;
  siparisTarihi: string;
  dinamikTeslimatAdresi: string;
  dinamikFaturaAdresi: string;
  urunler: SiparisUrun[];
  odemePlani: OdemePlani | null;
  createdAt: string;
  updatedAt: string;
}
