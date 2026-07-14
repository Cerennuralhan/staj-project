import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const bankaBilgileriSchema = z.object({
  banka: z.string().optional().default(""),
  iban: z.string().optional().default(""),
  sube: z.string().optional().default(""),
  hesapNo: z.string().optional().default(""),
  paraBirimi: z.string().optional().default(""),
});

export const tedarikciBelgeSchema = z.object({
  url: z.string(),
  aciklama: z.string().optional().default(""),
  tur: z.string().optional().default(""),
  yuklemeTarihi: z.string().optional(),
});

export const tedarikciSchema = z.object({
  firmaAdi: z.string().min(1, "Firma adı zorunludur"),
  telefon: z.string().optional().default(""),
  eposta: z.string().email("Geçerli bir e-posta girin").optional().or(z.literal("")),
  logo: z.string().optional().default(""),
  aktifMi: z.boolean().optional().default(true),
  adres: z.string().optional().default(""),
  vergiNo: z.string().optional().default(""),
  vergiDairesi: z.string().optional().default(""),
  mersisNo: z.string().optional().default(""),
  kurulusYili: z.string().optional().default(""),
  yetkiliKisi: z.string().optional().default(""),
  calismaSaatleri: z.string().optional().default(""),
  aciklama: z.string().optional().default(""),
  bankaBilgileri: bankaBilgileriSchema.partial().default(() => ({})),
  tedarikciBelgeleri: z.array(tedarikciBelgeSchema).optional().default(() => []),
});

export const tedarikSiparisUrunSchema = z.object({
  urunId: z.string().regex(objectIdPattern),
  urunAdi: z.string(),
  adet: z.number().int().min(1),
  birimFiyat: z.number().optional().default(0),
  toplamTutar: z.number().optional().default(0),
});

export const durumGecisiSchema = z.object({
  durum: z.string(),
  tarih: z.date().or(z.string()),
});

export const teslimatBilgileriSchema = z.object({
  adres: z.string().optional().default(""),
  yontem: z.string().optional().default(""),
  kargoPlaka: z.string().optional().default(""),
  aciklama: z.string().optional().default(""),
});

export const odemeBilgileriSchema = z.object({
  odemeYontemi: z.string().optional().default(""),
  odemeTarihi: z.date().or(z.string()).optional(),
  odemeTutari: z.number().optional().default(0),
  paraBirimi: z.string().optional().default("TRY"),
  odemeDurumu: z.string().optional().default("beklemede"),
  bankaAdi: z.string().optional().default(""),
  referansNo: z.string().optional().default(""),
});

export const tedarikSiparisSchema = z.object({
  tedarikciId: z.string().regex(objectIdPattern),
  siparisNo: z.string(),
  durum: z.enum(["beklemede", "yolda", "teslim_alindi"]),
  siparisTarihi: z.date().or(z.string()),
  tahminiTeslimatTarihi: z.date().or(z.string()).optional(),
  teslimAlmaTarihi: z.date().or(z.string()).optional(),
  urunler: z.array(tedarikSiparisUrunSchema),
  durumGecmisi: z.array(durumGecisiSchema).optional().default(() => []),
  teslimatBilgileri: teslimatBilgileriSchema.partial().optional().default(() => ({})),
  odemeBilgileri: odemeBilgileriSchema.partial().optional().default(() => ({})),
});

export type TedarikciInput = z.infer<typeof tedarikciSchema>;
export type TedarikSiparisInput = z.infer<typeof tedarikSiparisSchema>;
export type BankaBilgileri = z.infer<typeof bankaBilgileriSchema>;
export type TedarikciBelge = z.infer<typeof tedarikciBelgeSchema>;
