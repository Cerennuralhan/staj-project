import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const kullaniciSchema = z.object({
  adSoyad: z.string().min(1, "Ad soyad zorunludur"),
  eposta: z.string().email("Geçerli bir e-posta girin"),
  sifre: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  rol: z.enum(["admin", "satis", "montaj"]),
  aktifMi: z.boolean(),
});

export const islemKaydiSchema = z.object({
  kullaniciId: z.string().regex(objectIdPattern, "Geçerli bir kullanıcı ID'si girin"),
  islem: z.string(),
  koleksiyon: z.string(),
  tarih: z.date().or(z.string()),
});

export const bildirimSchema = z.object({
  kullaniciId: z.string().regex(objectIdPattern, "Geçerli bir kullanıcı ID'si girin"),
  baslik: z.string(),
  mesaj: z.string(),
  okunduMu: z.boolean(),
  tarih: z.date().or(z.string()),
});

export type KullaniciInput = z.infer<typeof kullaniciSchema>;
export type IslemKaydiInput = z.infer<typeof islemKaydiSchema>;
export type BildirimInput = z.infer<typeof bildirimSchema>;
