import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const tedarikciSchema = z.object({
  firmaAdi: z.string().min(1, "Firma adı zorunludur"),
  telefon: z.string(),
  eposta: z.string().email("Geçerli bir e-posta girin"),
});

export const tedarikSiparisUrunSchema = z.object({
  urunId: z.string().regex(objectIdPattern),
  adet: z.number().int().min(1),
});

export const tedarikSiparisSchema = z.object({
  tedarikciId: z.string().regex(objectIdPattern, "Geçerli bir tedarikçi ID'si girin"),
  siparisNo: z.string(),
  durum: z.enum(["beklemede", "yolda", "teslim_alindi"]),
  siparisTarihi: z.date().or(z.string()),
  urunler: z.array(tedarikSiparisUrunSchema),
});

export const sliderSchema = z.object({
  baslik: z.string(),
  resim: z.string(),
  butonYazisi: z.string(),
  butonLinki: z.string(),
  sira: z.number().int().min(0),
});

export const galeriSchema = z.object({
  baslik: z.string(),
  resim: z.string(),
  tur: z.string(),
  sira: z.number().int().min(0),
});

export const sayfaSchema = z.object({
  baslik: z.string().min(1, "Başlık zorunludur"),
  slug: z.string().min(1, "Slug zorunludur"),
  icerik: z.string(),
});

export const iletisimMesajiSchema = z.object({
  adSoyad: z.string().min(1, "Ad soyad zorunludur"),
  telefon: z.string(),
  eposta: z.string().email("Geçerli bir e-posta girin"),
  mesaj: z.string().min(1, "Mesaj zorunludur"),
  tarih: z.date().or(z.string()),
});

export const magazaSchema = z.object({
  magazaAdi: z.string().min(1, "Mağaza adı zorunludur"),
  telefon: z.string(),
  adres: z.string(),
  logo: z.string(),
  koordinat: z.object({ lat: z.number(), lng: z.number() }),
  disGorunusFotograflari: z.array(z.string()),
  defaultWarrantyPeriodMonths: z.number().int().min(1, "En az 1 ay").max(120, "En fazla 120 ay").default(24),
});

export type TedarikciInput = z.infer<typeof tedarikciSchema>;
export type TedarikSiparisInput = z.infer<typeof tedarikSiparisSchema>;
export type SliderInput = z.infer<typeof sliderSchema>;
export type GaleriInput = z.infer<typeof galeriSchema>;
export type SayfaInput = z.infer<typeof sayfaSchema>;
export type IletisimMesajiInput = z.infer<typeof iletisimMesajiSchema>;
export type MagazaInput = z.infer<typeof magazaSchema>;
