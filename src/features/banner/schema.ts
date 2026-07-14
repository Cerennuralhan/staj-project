import { z } from "zod";

export const bannerSchema = z.object({
  baslik: z.string(),
  aciklama: z.string(),
  butonYazisi: z.string(),
  butonLinki: z.string(),
  resim: z.string().default(""),
  sira: z.number().int().min(0).default(0),
});

export type BannerInput = z.infer<typeof bannerSchema>;
