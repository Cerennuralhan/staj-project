import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const kurulumSchema = z.object({
  siparisId: z.string().regex(objectIdPattern, "Geçerli bir sipariş ID'si girin"),
  urunId: z.string().regex(objectIdPattern, "Geçerli bir ürün ID'si girin"),
  montajKullaniciId: z.string().regex(objectIdPattern).optional(),
  kurulumTarihi: z.date().or(z.string()),
  durum: z.enum(["planlandi", "tamamlandi", "iptal"]),
});

export const kurulumFotografiSchema = z.object({
  kurulumId: z.string().regex(objectIdPattern, "Geçerli bir kurulum ID'si girin"),
  resim: z.string(),
  aciklama: z.string(),
});

export type KurulumInput = z.infer<typeof kurulumSchema>;
export type KurulumFotografiInput = z.infer<typeof kurulumFotografiSchema>;
