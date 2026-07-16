import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const kdvOranlari = [0, 1, 10, 20] as const;

export const faturaKalemSchema = z.object({
  urunAdi: z.string().min(1, "Ürün adı zorunludur"),
  adet: z.number().int().min(1, "Adet en az 1 olmalıdır"),
  birimFiyat: z.number().min(0, "Birim fiyat negatif olamaz"),
  kdvOrani: z.number().refine((v) => (kdvOranlari as readonly number[]).includes(v), "Geçersiz KDV oranı"),
});

export const faturaSchema = z.object({
  tedarikciId: z.string().regex(objectIdPattern, "Geçerli bir tedarikçi ID'si girin"),
  kalemler: z.array(faturaKalemSchema).min(1, "En az bir kalem ekleyin"),
  odemeSekli: z.string().min(1, "Ödeme şekli zorunludur"),
  vadeTarihi: z.string().optional(),
  teslimatNotu: z.string().optional().default(""),
});

export type FaturaKalemInput = z.infer<typeof faturaKalemSchema>;
export type FaturaInput = z.infer<typeof faturaSchema>;
