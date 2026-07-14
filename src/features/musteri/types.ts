export interface Musteri {
  _id: string;
  adSoyad: string;
  telefon: string;
  alternatifTelefon: string;
  eposta: string;
  dogumTarihi: string | null;
  cinsiyet: "erkek" | "kadin" | "belirtilmemis";
  uyruk: string;
  tcVergiNo: string;
  musteriDurumu: "aktif" | "pasif" | "askida";
  adres: string;
  faturaSokak: string;
  faturaMahalleIlce: string;
  faturaSehir: string;
  faturaPostaKodu: string;
  faturaUlke: string;
  faturaTeslimatAyni: boolean;
  odemeYontemi: string;
  iban: string;
  bankaAdi: string;
  hesapSahibi: string;
  uyeId?: string;
  notlar?: string;
  bultenOnay?: boolean;
  createdAt: string;
  updatedAt: string;
}
