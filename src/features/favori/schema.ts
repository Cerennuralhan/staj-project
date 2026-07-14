import { z } from "zod";
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const favoriSchema = z.object({
  uyeId: z.string().regex(objectIdPattern, "Geçerli bir üye ID'si girin"),
  urunId: z.string().regex(objectIdPattern, "Geçerli bir ürün ID'si girin"),
});

export type FavoriInput = z.infer<typeof favoriSchema>;
