import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const garantiSchema = z.object({
  siparisId: z.string().regex(objectIdPattern, "Geçerli bir sipariş ID'si girin"),
  musteriId: z.string().regex(objectIdPattern, "Geçerli bir müşteri ID'si girin"),
  urunId: z.string().regex(objectIdPattern, "Geçerli bir ürün ID'si girin"),
  seriNo: z.string().optional(),
  garantiBaslangic: z.date().or(z.string()),
  garantiBitis: z.date().or(z.string()),
});

export const garantiTalebiSchema = z.object({
  garantiId: z.string().regex(objectIdPattern, "Geçerli bir garanti ID'si girin"),
  aciklama: z.string().min(1, "Açıklama zorunludur"),
  durum: z.enum(["acik", "inceleniyor", "cozuldu"]),
  cozumTuru: z.enum(["urun_incelendi", "kullanici_hatasi"]).optional(),
});

export type GarantiInput = z.infer<typeof garantiSchema>;
export type GarantiTalebiInput = z.infer<typeof garantiTalebiSchema>;
