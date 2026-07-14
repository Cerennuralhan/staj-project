import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const siparisUrunSchema = z.object({
  urunId: z.string().regex(objectIdPattern),
  urunAdi: z.string(),
  kapakResmi: z.string(),
  adet: z.number().int().min(1),
  fiyat: z.number().min(0),
});

export const taksitSchema = z.object({
  taksitNo: z.number().int().min(1),
  tutar: z.number().min(0),
  vadeTarihi: z.string(),
  odendiMi: z.boolean(),
  odemeTarihi: z.string().nullable(),
});

export const odemePlaniSchema = z.object({
  yontem: z.enum(["pesin", "taksit", "senet"]),
  taksitSayisi: z.number().int().min(1).max(12),
  taksitTutari: z.number().min(0),
  odenenTaksitSayisi: z.number().int().min(0),
  taksitler: z.array(taksitSchema),
});

export const siparisSchema = z.object({
  musteriId: z.string().regex(objectIdPattern, "Geçerli bir müşteri ID'si girin"),
  durum: z.enum(["beklemede", "onaylandi", "hazirlaniyor", "kargoda", "teslim_edildi", "iptal"]),
  toplamTutar: z.number().min(0),
  siparisTarihi: z.date().or(z.string()),
  dinamikTeslimatAdresi: z.string(),
  dinamikFaturaAdresi: z.string(),
  urunler: z.array(siparisUrunSchema),
  odemePlani: odemePlaniSchema.optional().nullable(),
});

export type SiparisInput = z.infer<typeof siparisSchema>;
