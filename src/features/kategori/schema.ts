import { z } from "zod";

export const kategoriSchema = z.object({
  kategoriAdi: z.string().min(1, "Kategori adı zorunludur"),
  resim: z.string(),
  sira: z.number().int().min(0),
});

export type KategoriInput = z.infer<typeof kategoriSchema>;
