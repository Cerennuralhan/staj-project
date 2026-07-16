export interface FaturaKalem {
  urunAdi: string;
  adet: number;
  birimFiyat: number;
  kdvOrani: number;
  araToplam: number;
  kdvTutari: number;
}

export interface AliciBilgi {
  firmaAdi: string;
  adres: string;
  telefon: string;
  eposta: string;
  vergiDairesi: string;
  vergiNo: string;
}

export interface TedarikciBilgi {
  firmaAdi: string;
  adres: string;
  telefon: string;
  eposta: string;
  vergiDairesi: string;
  vergiNo: string;
}

export interface Fatura {
  _id: string;
  faturaNo: string;
  tedarikciId: string;
  tedarikciBilgi: TedarikciBilgi;
  aliciBilgi: AliciBilgi;
  kalemler: FaturaKalem[];
  odemeSekli: string;
  vadeTarihi?: string;
  teslimatNotu: string;
  araToplam: number;
  kdvTutari: number;
  genelToplam: number;
  dosyaUrl: string;
  createdAt: string;
  updatedAt: string;
}
