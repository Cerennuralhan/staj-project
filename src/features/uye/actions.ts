"use server";

import { connectDB } from "@/lib/db";
import { Uye } from "./queries";
import { uyeSchema, uyeGirisSchema } from "./schema";
import bcrypt from "bcryptjs";
import { sifirlaTokeniOlustur, uyeTokenOlustur } from "@/lib/uye-auth";
import { Resend } from "resend";

/* ---------- Kayıt ---------- */

export async function uyeKayitAction(formData: FormData) {
  const raw = {
    ad: formData.get("ad") as string,
    soyad: formData.get("soyad") as string,
    eposta: formData.get("eposta") as string,
    cepTelefonu: formData.get("cepTelefonu") as string,
    sifre: formData.get("sifre") as string,
    adres: (formData.get("adres") as string) || "",
    kvkkOnay: formData.get("kvkkOnay") === "true",
    bultenOnay: formData.get("bultenOnay") === "true",
  };

  const parsed = uyeSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await connectDB();
  const existing = await Uye.findOne({ eposta: raw.eposta }).lean();
  if (existing) return { success: false, error: "Bu e-posta zaten kayıtlı" };

  const hashed = await bcrypt.hash(raw.sifre, 12);
  const uye = await Uye.create({ ...raw, sifre: hashed, olusturmaTarihi: new Date() });

  // Musteri kaydını da oluştur
  const { Musteri } = await import("@/features/musteri/queries");
  await Musteri.create({
    adSoyad: `${raw.ad} ${raw.soyad}`,
    telefon: raw.cepTelefonu,
    eposta: raw.eposta,
    adres: raw.adres || "",
    uyeId: uye._id,
    bultenOnay: raw.bultenOnay,
  });

  return { success: true };
}

/* ---------- Giriş ---------- */

export async function uyeGirisAction(formData: FormData) {
  const raw = {
    eposta: formData.get("eposta") as string,
    sifre: formData.get("sifre") as string,
  };

  const parsed = uyeGirisSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await connectDB();
  const uye = await Uye.findOne({ eposta: raw.eposta }).lean();
  if (!uye) return { success: false, error: "E-posta veya şifre hatalı" };

  const valid = await bcrypt.compare(raw.sifre, uye.sifre);
  if (!valid) return { success: false, error: "E-posta veya şifre hatalı" };

  const token = uyeTokenOlustur({ uyeId: uye._id.toString(), eposta: uye.eposta });

  return {
    success: true,
    token,
    uye: { id: uye._id.toString(), ad: uye.ad, soyad: uye.soyad, eposta: uye.eposta },
  };
}

/* ---------- Şifre Sıfırlama - Token Gönder ---------- */

export async function sifreSifirlamaIstekAction(formData: FormData) {
  const eposta = formData.get("eposta") as string;
  if (!eposta) return { success: false, error: "E-posta zorunludur" };

  await connectDB();
  const uye = await Uye.findOne({ eposta }).lean();
  if (!uye) return { success: true }; // güvenlik: e-posta var/yok belli olmasın

  const token = sifirlaTokeniOlustur();
  const sonTarih = new Date(Date.now() + 3600000); // 1 saat

  await Uye.findByIdAndUpdate(uye._id, {
    sifreSifirlamaTokeni: token,
    sifreSifirlamaSonTarih: sonTarih,
  });

  // Resend ile e-posta gönder
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const sifirlaLinki = `${process.env.AUTH_URL || "http://100.123.162.125:3000"}/hesap/sifre-sifirla?token=${token}&eposta=${eposta}`;
      await resend.emails.send({
        from: "Demiray Mobilya <noreply@demiray.com>",
        to: eposta,
        subject: "Şifre Sıfırlama",
        html: `<p>Şifrenizi sıfırlamak için <a href="${sifirlaLinki}">buraya tıklayın</a>.<br>Bu link 1 saat geçerlidir.</p>`,
      });
    } catch (e) {
      console.error("E-posta gönderilemedi:", e);
    }
  }

  return { success: true };
}

/* ---------- Şifre Sıfırlama - Yeni Şifre Belirle ---------- */

export async function sifreSifirlamaUygulaAction(formData: FormData) {
  const token = formData.get("token") as string;
  const eposta = formData.get("eposta") as string;
  const yeniSifre = formData.get("sifre") as string;

  if (!token || !eposta || !yeniSifre || yeniSifre.length < 6) {
    return { success: false, error: "Geçersiz istek veya şifre çok kısa" };
  }

  await connectDB();
  const uye = await Uye.findOne({ eposta }).lean();
  if (!uye) return { success: false, error: "Kullanıcı bulunamadı" };
  if (uye.sifreSifirlamaTokeni !== token) return { success: false, error: "Geçersiz token" };
  if (!uye.sifreSifirlamaSonTarih || new Date(uye.sifreSifirlamaSonTarih) < new Date()) {
    return { success: false, error: "Token süresi dolmuş" };
  }

  const hashed = await bcrypt.hash(yeniSifre, 12);
  await Uye.findByIdAndUpdate(uye._id, {
    sifre: hashed,
    sifreSifirlamaTokeni: null,
    sifreSifirlamaSonTarih: null,
  });

  return { success: true };
}

/* ---------- Profil bilgisi getir (adres dahil) ---------- */

export async function getUyeProfileAction(uyeId: string) {
  await connectDB();
  const uye = await Uye.findById(uyeId).select("ad soyad eposta cepTelefonu adres bultenOnay").lean();
  return uye
    ? { id: uye._id.toString(), ad: uye.ad, soyad: uye.soyad, eposta: uye.eposta, cepTelefonu: uye.cepTelefonu, adres: uye.adres || "", bultenOnay: uye.bultenOnay ?? false }
    : null;
}

/* ---------- Bülten tercihi güncelle (uye + musteri senkron) ---------- */

export async function updateUyeBultenTercihiAction(uyeId: string, bultenOnay: boolean) {
  await connectDB();

  const uye = await Uye.findByIdAndUpdate(uyeId, { bultenOnay }, { new: true }).lean();
  if (!uye) return { success: false, error: "Üye bulunamadı" };

  const { Musteri } = await import("@/features/musteri/queries");
  await Musteri.updateOne({ uyeId: uye._id }, { $set: { bultenOnay } });

  return { success: true };
}
