import { z } from "zod";
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const sepetUrunSchema = z.object({
  urunId: z.string().regex(objectIdPattern, "Geçerli bir ürün ID'si girin"),
  adet: z.number().int().min(1, "Adet en az 1 olmalıdır"),
});

export const sepetSchema = z.object({
  uyeId: z.string().regex(objectIdPattern).optional().nullable(),
  misafirSepetId: z.string().optional().nullable(),
  urunler: z.array(sepetUrunSchema),
});

export type SepetInput = z.infer<typeof sepetSchema>;
export type SepetUrunInput = z.infer<typeof sepetUrunSchema>;
