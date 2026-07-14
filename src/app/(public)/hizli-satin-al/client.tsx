"use client";

import { useUyeAuth } from "@/contexts/uye-auth-context";
import { useCheckout } from "@/hooks/useCheckout";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  urunId: string;
  urunAdi: string;
  kapakResmi: string;
  fiyat: number;
  adet: number;
}

export function HizliSatinAlClient({ urunId, urunAdi, kapakResmi, fiyat, adet }: Props) {
  const { uye } = useUyeAuth();

  const checkout = useCheckout({
    items: [{ urunId, adet, urunAdi, kapakResmi, fiyat }],
    isCartCheckout: false,
  });

  if (checkout.step === "loading") {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-darker" size={32} /></div>;
  }

  if (checkout.step === "gate") {
    return checkout.renderAuthGate(
      "Hızlı satın almak için giriş yapın veya misafir olarak devam edin."
    );
  }

  return (
    <div>
      <Link
        href={`/urunler/${urunId}`}
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition mb-6"
      >
        <ArrowLeft size={16} /> Ürüne Dön
      </Link>

      <h2 className="text-xl font-bold text-foreground mb-6">Hızlı Satın Al</h2>

      {checkout.error && (
        <div className="mb-4 rounded-lg bg-danger-light border border-danger px-4 py-2 text-sm text-red-300 text-center">
          {checkout.error}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); checkout.handleSubmit(); }} className="space-y-5">
        <fieldset className="rounded-xl border border-border bg-card p-4 space-y-4">
          <legend className="text-sm font-semibold text-foreground px-2">Teslimat Bilgileri</legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted mb-1 block">Ad Soyad</label>
              <input type="text" required value={checkout.adSoyad}
                onChange={(e) => checkout.setAdSoyad(e.target.value)}
                className="w-full rounded-lg bg-card border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Cep Telefonu</label>
              <input type="tel" required value={checkout.telefon}
                onChange={(e) => checkout.setTelefon(e.target.value)}
                className="w-full rounded-lg bg-card border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="05XX XXX XX XX"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">E-posta</label>
            <input type="email" required value={checkout.eposta}
              onChange={(e) => checkout.setEposta(e.target.value)}
              className="w-full rounded-lg bg-card border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Teslimat Adresi</label>
            <textarea required value={checkout.teslimatAdresi}
              onChange={(e) => checkout.setTeslimatAdresi(e.target.value)} rows={3}
              className="w-full rounded-lg bg-card border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
              placeholder="Mahalle, Sokak, No, Daire, İlçe/İl"
            />
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-border bg-card p-4 space-y-4">
          <legend className="text-sm font-semibold text-foreground px-2">Fatura Adresi</legend>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={checkout.faturaAyni}
              onChange={(e) => checkout.setFaturaAyni(e.target.checked)}
              className="accent-primary"
            />
            <span className="text-xs text-muted">Teslimat adresimle aynı</span>
          </label>
          {!checkout.faturaAyni && (
            <div>
              <label className="text-xs text-muted mb-1 block">Fatura Adresi</label>
              <textarea required value={checkout.faturaAdresi}
                onChange={(e) => checkout.setFaturaAdresi(e.target.value)} rows={3}
                className="w-full rounded-lg bg-card border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
                placeholder="Fatura adresini girin"
              />
            </div>
          )}
        </fieldset>

        {/* Ödeme Yöntemi */}
        <fieldset className="rounded-xl border border-border bg-card p-4 space-y-4">
          <legend className="text-sm font-semibold text-foreground px-2">Ödeme Yöntemi</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="odeme" value="pesin" checked={checkout.odemeYontemi === "pesin"}
                onChange={() => checkout.setOdemeYontemi("pesin")} className="accent-primary" />
              <span className="text-sm text-foreground">Peşin</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="odeme" value="taksit" checked={checkout.odemeYontemi === "taksit"}
                onChange={() => checkout.setOdemeYontemi("taksit")} className="accent-primary" />
              <span className="text-sm text-foreground">Taksitli</span>
            </label>
          </div>
          {checkout.odemeYontemi === "taksit" && (
            <div className="flex items-center gap-3">
              <label className="text-xs text-muted">Taksit Sayısı</label>
              <select value={checkout.taksitSayisi} onChange={(e) => checkout.setTaksitSayisi(Number(e.target.value))}
                className="rounded-lg bg-card border border-border px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none">
                {[2, 3, 6, 9, 12].map((n) => (
                  <option key={n} value={n}>{n} Ay</option>
                ))}
              </select>
              <span className="text-xs text-muted-darker">
                Aylık {(checkout.toplamTutar / checkout.taksitSayisi).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} TL
              </span>
            </div>
          )}
        </fieldset>

        {/* Adresi kaydet (sadece üye) */}
        {uye && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox" checked={checkout.kaydetAdres}
              onChange={(e) => checkout.setKaydetAdres(e.target.checked)}
              className="accent-primary"
            />
            <span className="text-xs text-muted">
              Bu adresi gelecekteki siparişlerim için kaydet
            </span>
          </label>
        )}

        {/* Sipariş özeti */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Sipariş Özeti</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground-secondary truncate">{urunAdi} <span className="text-muted-darker">x{adet}</span></span>
              <span className="text-foreground shrink-0 ml-4">{fiyat * adet} TL</span>
            </div>
          </div>
          <div className="border-t border-border mt-3 pt-3 flex justify-between text-sm font-semibold">
            <span className="text-foreground-secondary">Genel Toplam</span>
            <span className="text-foreground">{(fiyat * adet).toLocaleString("tr-TR")} TL</span>
          </div>
        </div>

        <button type="submit" disabled={checkout.submitting}
          className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-foreground hover:bg-primary-hover transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {checkout.submitting && <Loader2 size={18} className="animate-spin" />}
          {checkout.submitting ? "Sipariş oluşturuluyor..." : "SİPARİŞİ TAMAMLA"}
        </button>
      </form>
    </div>
  );
}

