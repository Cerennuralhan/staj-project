import { z } from "zod";

export const kisiselBilgilerSchema = z.object({
  adSoyad: z.string().min(1, "Ad soyad zorunludur"),
  telefon: z.string(),
  alternatifTelefon: z.string(),
  eposta: z.string().email("Geçerli bir e-posta girin"),
  dogumTarihi: z.string().nullable(),
  cinsiyet: z.enum(["erkek", "kadin", "belirtilmemis"]),
  uyruk: z.string(),
  tcVergiNo: z.string(),
  musteriDurumu: z.enum(["aktif", "pasif", "askida"]),
});

export const faturaAdresiSchema = z.object({
  faturaSokak: z.string(),
  faturaMahalleIlce: z.string(),
  faturaSehir: z.string(),
  faturaPostaKodu: z.string(),
  faturaUlke: z.string(),
  faturaTeslimatAyni: z.boolean(),
});

export const odemeBilgileriSchema = z.object({
  odemeYontemi: z.string(),
  iban: z.string(),
  bankaAdi: z.string(),
  hesapSahibi: z.string(),
});

export const musteriSchema = z.object({
  adSoyad: z.string().min(1, "Ad soyad zorunludur"),
  telefon: z.string(),
  alternatifTelefon: z.string(),
  eposta: z.string().email("Geçerli bir e-posta girin"),
  dogumTarihi: z.string().nullable(),
  cinsiyet: z.enum(["erkek", "kadin", "belirtilmemis"]),
  uyruk: z.string(),
  tcVergiNo: z.string(),
  musteriDurumu: z.enum(["aktif", "pasif", "askida"]),
  adres: z.string(),
  faturaSokak: z.string(),
  faturaMahalleIlce: z.string(),
  faturaSehir: z.string(),
  faturaPostaKodu: z.string(),
  faturaUlke: z.string(),
  faturaTeslimatAyni: z.boolean(),
  odemeYontemi: z.string(),
  iban: z.string(),
  bankaAdi: z.string(),
  hesapSahibi: z.string(),
  notlar: z.string().optional().default(""),
  bultenOnay: z.boolean().optional().default(false),
});

export type MusteriInput = z.infer<typeof musteriSchema>;
export type KisiselBilgilerInput = z.infer<typeof kisiselBilgilerSchema>;
export type FaturaAdresiInput = z.infer<typeof faturaAdresiSchema>;
export type OdemeBilgileriInput = z.infer<typeof odemeBilgileriSchema>;
