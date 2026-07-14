import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const urunResimSchema = z.object({
  resim: z.string(),
  sira: z.number().int().min(0),
});

export const urunSchema = z.object({
  kategoriId: z.string().regex(objectIdPattern, "Geçerli bir kategori ID'si girin"),
  urunAdi: z.string().min(1, "Ürün adı zorunludur"),
  aciklama: z.string().default(""),
  fiyat: z.number().min(0, "Fiyat 0'dan küçük olamaz"),
  stok: z.number().int().min(0).default(0),
  kapakResmi: z.string().default(""),
  warrantyPeriodMonths: z.number().int().min(1, "Garanti süresi en az 1 ay olmalıdır").max(120, "Garanti süresi en fazla 120 ay olabilir"),
  yayinlandiMi: z.boolean().default(true),
  resimler: z.array(urunResimSchema).default([]),
  renk: z.array(z.string()).default([]),
  materyal: z.array(z.string()).default([]),
  satisSayisi: z.number().int().min(0).default(0),
  oneCikan: z.boolean().default(false),
});

export type UrunInput = z.infer<typeof urunSchema>;
