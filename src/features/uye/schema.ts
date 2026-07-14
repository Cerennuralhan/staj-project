import { z } from "zod";

export const uyeSchema = z.object({
  ad: z.string().min(1, "Ad zorunludur"),
  soyad: z.string().min(1, "Soyad zorunludur"),
  eposta: z.string().email("Geçerli bir e-posta girin"),
  cepTelefonu: z.string().min(1, "Telefon zorunludur"),
  sifre: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  adres: z.string().optional().default(""),
  kvkkOnay: z.boolean().refine((v) => v === true, "KVKK onayı zorunludur"),
  bultenOnay: z.boolean().optional().default(false),
});

export const uyeGirisSchema = z.object({
  eposta: z.string().email("Geçerli bir e-posta girin"),
  sifre: z.string().min(1, "Şifre zorunludur"),
});

export const sifreSifirlamaSchema = z.object({
  eposta: z.string().email("Geçerli bir e-posta girin"),
});

export type UyeInput = z.infer<typeof uyeSchema>;
export type UyeGirisInput = z.infer<typeof uyeGirisSchema>;
