"use client";

import { Suspense, useState } from "react";
import { useUyeAuth } from "@/contexts/uye-auth-context";
import { uyeGirisAction, uyeKayitAction, sifreSifirlamaIstekAction } from "@/features/uye/actions";
import { sepetBirlestirAction } from "@/features/sepet/public-actions";
import { getMisafirSepetIdFromCookie, clearMisafirSepetIdCookie } from "@/lib/sepet-cookie";
import { useRouter, useSearchParams } from "next/navigation";

type Tab = "giris" | "kayit" | "sifre-unuttum";

function HesapFormu() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "kayit" ? "kayit" : "giris";
  const [tab, setTab] = useState<Tab>(defaultTab);
  const { setAuth } = useUyeAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [ad, setAd] = useState("");
  const [soyad, setSoyad] = useState("");
  const [cepTelefonu, setCepTelefonu] = useState("");
  const [adres, setAdres] = useState("");
  const [kvkkOnay, setKvkkOnay] = useState(false);
  const [bultenOnay, setBultenOnay] = useState(false);
  const [sifirlamaEposta, setSifirlamaEposta] = useState("");

  const resetError = () => { setError(""); setSuccessMsg(""); };

  const handleGiris = async (e: React.FormEvent) => {
    e.preventDefault();
    resetError();
    setLoading(true);
    const fd = new FormData();
    fd.set("eposta", eposta);
    fd.set("sifre", sifre);
    const res = await uyeGirisAction(fd);
    setLoading(false);
    if (!res.success) return setError(res.error || "Bir hata oluştu");
    setAuth(res.token!, res.uye!);
    const misafirId = getMisafirSepetIdFromCookie();
    if (misafirId) {
      await sepetBirlestirAction(misafirId, res.uye!.id);
      clearMisafirSepetIdCookie();
    }
    router.push("/");
  };

  const handleKayit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetError();
    if (!kvkkOnay) return setError("KVKK onayı zorunludur");
    setLoading(true);
    const fd = new FormData();
    fd.set("ad", ad);
    fd.set("soyad", soyad);
    fd.set("eposta", eposta);
    fd.set("cepTelefonu", cepTelefonu);
    fd.set("sifre", sifre);
    fd.set("adres", adres);
    fd.set("kvkkOnay", "true");
    fd.set("bultenOnay", bultenOnay ? "true" : "false");
    const res = await uyeKayitAction(fd);
    setLoading(false);
    if (!res.success) return setError(res.error || "Bir hata oluştu");
    setSuccessMsg("Kaydınız oluşturuldu! Giriş yapabilirsiniz.");
    setTab("giris");
  };

  const handleSifreUnuttum = async (e: React.FormEvent) => {
    e.preventDefault();
    resetError();
    setLoading(true);
    const fd = new FormData();
    fd.set("eposta", sifirlamaEposta);
    const res = await sifreSifirlamaIstekAction(fd);
    setLoading(false);
    setSuccessMsg("E-posta adresinize şifre sıfırlama linki gönderildi.");
    setTab("giris");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      {error && (
        <div className="mb-4 rounded-lg bg-danger-light border border-danger px-4 py-2 text-sm text-red-300 text-center">{error}</div>
      )}
      {successMsg && (
        <div className="mb-4 rounded-lg bg-accent-light border border-accent px-4 py-2 text-sm text-green-300 text-center">{successMsg}</div>
      )}

      {tab !== "sifre-unuttum" && (
        <div className="flex border-b border-border mb-8">
          <button onClick={() => { setTab("giris"); resetError(); }}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
              tab === "giris" ? "text-foreground border-b-2 border-primary" : "text-muted-darker hover:text-foreground-secondary"
            }`}>Giriş Yap</button>
          <button onClick={() => { setTab("kayit"); resetError(); }}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
              tab === "kayit" ? "text-foreground border-b-2 border-primary" : "text-muted-darker hover:text-foreground-secondary"
            }`}>Üye Ol</button>
        </div>
      )}

      {tab === "giris" && (
        <form onSubmit={handleGiris} className="space-y-4">
          <div>
            <label className="text-xs text-muted mb-1 block">E-posta</label>
            <input type="email" required value={eposta} onChange={(e) => setEposta(e.target.value)}
              className="w-full rounded-lg bg-surface-alt border border-border px-3 py-2.5 text-sm text-foreground placeholder-zinc-500 focus:border-primary focus:outline-none"
              placeholder="ornek@mail.com" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Şifre</label>
            <input type="password" required value={sifre} onChange={(e) => setSifre(e.target.value)}
              className="w-full rounded-lg bg-surface-alt border border-border px-3 py-2.5 text-sm text-foreground placeholder-zinc-500 focus:border-primary focus:outline-none"
              placeholder="••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-foreground hover:bg-primary-hover transition disabled:opacity-50">
            {loading ? "Giriş yapılıyor..." : "GİRİŞ YAP"}
          </button>
          <p className="text-center">
            <button type="button" onClick={() => setTab("sifre-unuttum")}
              className="text-xs text-muted-darker hover:text-foreground-secondary underline">Şifremi Unuttum</button>
          </p>
        </form>
      )}

      {tab === "kayit" && (
        <form onSubmit={handleKayit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted mb-1 block">Ad</label>
              <input type="text" required value={ad} onChange={(e) => setAd(e.target.value)}
                className="w-full rounded-lg bg-surface-alt border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="Ad" />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Soyad</label>
              <input type="text" required value={soyad} onChange={(e) => setSoyad(e.target.value)}
                className="w-full rounded-lg bg-surface-alt border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="Soyad" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">E-posta</label>
            <input type="email" required value={eposta} onChange={(e) => setEposta(e.target.value)}
              className="w-full rounded-lg bg-surface-alt border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="ornek@mail.com" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Cep Telefonu</label>
            <input type="tel" required value={cepTelefonu} onChange={(e) => setCepTelefonu(e.target.value)}
              className="w-full rounded-lg bg-surface-alt border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="05XX XXX XX XX" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Şifre</label>
            <input type="password" required value={sifre} onChange={(e) => setSifre(e.target.value)}
              className="w-full rounded-lg bg-surface-alt border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="En az 6 karakter" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Teslimat Adresi <span className="text-muted-darker">(opsiyonel)</span></label>
            <textarea value={adres} onChange={(e) => setAdres(e.target.value)} rows={3}
              className="w-full rounded-lg bg-surface-alt border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
              placeholder="Mahalle, Sokak, No, Daire, İlçe/İl" />
          </div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={kvkkOnay} onChange={(e) => setKvkkOnay(e.target.checked)} className="mt-0.5 accent-primary" />
            <span className="text-xs text-muted"><strong className="text-foreground-secondary">KVKK</strong> aydınlatma metnini okudum, kabul ediyorum.</span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={bultenOnay} onChange={(e) => setBultenOnay(e.target.checked)} className="mt-0.5 accent-primary" />
            <span className="text-xs text-muted">Kampanya ve bülten e-postalarını almak istiyorum.</span>
          </label>
          <button type="submit" disabled={loading || !kvkkOnay}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-foreground hover:bg-primary-hover transition disabled:opacity-50">
            {loading ? "Oluşturuluyor..." : "ÜYELİK OLUŞTUR"}
          </button>
        </form>
      )}

      {tab === "sifre-unuttum" && (
        <form onSubmit={handleSifreUnuttum} className="space-y-4">
          <p className="text-sm text-muted">E-posta adresinizi girin, size sıfırlama linki gönderelim.</p>
          <div>
            <label className="text-xs text-muted mb-1 block">E-posta</label>
            <input type="email" required value={sifirlamaEposta} onChange={(e) => setSifirlamaEposta(e.target.value)}
              className="w-full rounded-lg bg-surface-alt border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="ornek@mail.com" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-foreground hover:bg-primary-hover transition disabled:opacity-50">
            {loading ? "Gönderiliyor..." : "LİNK GÖNDER"}
          </button>
          <p className="text-center">
            <button type="button" onClick={() => setTab("giris")}
              className="text-xs text-muted-darker hover:text-foreground-secondary underline">Giriş sayfasına dön</button>
          </p>
        </form>
      )}
    </div>
  );
}

export default function HesapPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-muted-darker">Yükleniyor...</div>}>
      <HesapFormu />
    </Suspense>
  );
}
