"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUyeAuth } from "@/contexts/uye-auth-context";
import { getUyeSiparislerimAction } from "@/features/siparis/public-actions";
import Link from "next/link";
import {
  Package,
  Loader2,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Calendar,
  MapPin,
  Wrench,
  ShieldCheck,
} from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  beklemede: "Beklemede",
  onaylandi: "Onaylandı",
  hazirlaniyor: "Hazırlanıyor",
  kargoda: "Kargoda",
  teslim_edildi: "Teslim Edildi",
  iptal: "İptal",
};

const STATUS_COLOR: Record<string, string> = {
  beklemede: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  onaylandi: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  hazirlaniyor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  kargoda: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  teslim_edildi: "bg-green-500/20 text-green-400 border-green-500/30",
  iptal: "bg-red-500/20 text-red-400 border-red-500/30",
};

const KURULUM_LABEL: Record<string, string> = {
  planlandi: "Planlandı",
  tamamlandi: "Tamamlandı",
  iptal: "İptal",
};

const KURULUM_COLOR: Record<string, string> = {
  planlandi: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  tamamlandi: "bg-green-500/20 text-green-400 border-green-500/30",
  iptal: "bg-red-500/20 text-red-400 border-red-500/30",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function GarantiBadge({ bitis }: { bitis: string }) {
  const now = Date.now();
  const bitisMs = new Date(bitis).getTime();
  const aktif = bitisMs >= now;
  const kalanGun = Math.ceil((bitisMs - now) / 86400000);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        aktif
          ? "bg-green-500/20 text-green-400 border-green-500/30"
          : "bg-red-500/20 text-red-400 border-red-500/30"
      }`}
    >
      <ShieldCheck size={12} />
      {aktif ? `Aktif (${Math.max(kalanGun, 0)} gün)` : "Süresi Doldu"}
    </span>
  );
}

function SiparisCard({ siparis }: { siparis: any }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Özet */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-alt transition"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="hidden sm:flex -space-x-2">
            {siparis.urunler.slice(0, 3).map((u: any, i: number) => (
              <div
                key={i}
                className="w-10 h-10 rounded-lg border border-border bg-surface-alt overflow-hidden shrink-0"
              >
                {u.kapakResmi ? (
                  <img
                    src={u.kapakResmi}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-darker text-[10px]">
                    ?
                  </div>
                )}
              </div>
            ))}
            {siparis.urunler.length > 3 && (
              <div className="w-10 h-10 rounded-lg border border-border bg-surface-alt flex items-center justify-center text-xs text-muted-darker shrink-0">
                +{siparis.urunler.length - 3}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {siparis.siparisNo}
            </p>
            <p className="text-xs text-muted-darker mt-0.5">
              {formatDate(siparis.siparisTarihi)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-primary">
              {siparis.toplamTutar.toLocaleString("tr-TR")} TL
            </p>
            <p className="text-xs text-muted-darker">
              {siparis.urunler.reduce((t: number, u: any) => t + u.adet, 0)} ürün
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              STATUS_COLOR[siparis.durum] || ""
            }`}
          >
            {STATUS_LABEL[siparis.durum] || siparis.durum}
          </span>
          {open ? <ChevronUp size={18} className="text-muted-darker" /> : <ChevronDown size={18} className="text-muted-darker" />}
        </div>
      </button>

      {/* Detay */}
      {open && (
        <div className="border-t border-border px-4 py-4 space-y-5">
          {/* Ürün Listesi */}
          <div>
            <h4 className="text-xs font-semibold text-muted-darker uppercase tracking-wider mb-3">
              Ürünler
            </h4>
            <div className="space-y-2">
              {siparis.urunler.map((u: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg bg-surface-alt p-2"
                >
                  <div className="w-12 h-12 rounded-lg bg-zinc-700 overflow-hidden shrink-0">
                    {u.kapakResmi ? (
                      <img
                        src={u.kapakResmi}
                        alt={u.urunAdi}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-darker text-[10px]">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">{u.urunAdi}</p>
                    <p className="text-xs text-muted-darker">
                      {u.adet} adet x {u.fiyat.toLocaleString("tr-TR")} TL
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-primary shrink-0">
                    {(u.fiyat * u.adet).toLocaleString("tr-TR")} TL
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Adresler */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-muted-darker uppercase tracking-wider mb-2 flex items-center gap-1">
                <MapPin size={12} /> Teslimat Adresi
              </h4>
              <p className="text-sm text-foreground-secondary">
                {siparis.dinamikTeslimatAdresi || "—"}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-muted-darker uppercase tracking-wider mb-2 flex items-center gap-1">
                <MapPin size={12} /> Fatura Adresi
              </h4>
              <p className="text-sm text-foreground-secondary">
                {siparis.dinamikFaturaAdresi || "—"}
              </p>
            </div>
          </div>

          {/* Kurulum */}
          {siparis.kurulumlar?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-darker uppercase tracking-wider mb-3 flex items-center gap-1">
                <Wrench size={12} /> Kurulum Durumu
              </h4>
              <div className="space-y-2">
                {siparis.kurulumlar.map((k: any) => (
                  <div
                    key={k._id}
                    className="flex items-center justify-between rounded-lg bg-surface-alt p-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">
                        {formatDate(k.kurulumTarihi)}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        KURULUM_COLOR[k.durum] || ""
                      }`}
                    >
                      {KURULUM_LABEL[k.durum] || k.durum}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Garanti */}
          {siparis.garantiler?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-darker uppercase tracking-wider mb-3 flex items-center gap-1">
                <ShieldCheck size={12} /> Garanti Bilgisi
              </h4>
              <div className="space-y-2">
                {siparis.garantiler.map((g: any) => (
                  <div
                    key={g._id}
                    className="flex items-center justify-between rounded-lg bg-surface-alt p-2"
                  >
                    <div>
                      <p className="text-xs text-foreground-secondary">
                        Başlangıç: {formatDate(g.garantiBaslangic)}
                      </p>
                      <p className="text-xs text-muted-darker">
                        Bitiş: {formatDate(g.garantiBitis)}
                      </p>
                    </div>
                    <GarantiBadge bitis={g.garantiBitis} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Özet satırı */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <p className="text-sm text-muted-darker">
              Toplam ({siparis.urunler.reduce((t: number, u: any) => t + u.adet, 0)} ürün)
            </p>
            <p className="text-lg font-bold text-primary">
              {siparis.toplamTutar.toLocaleString("tr-TR")} TL
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SiparislerimPage() {
  const { uye, loading } = useUyeAuth();

  const { data: siparisler = [], isFetching } = useQuery({
    queryKey: ["siparislerim", uye?.id],
    queryFn: () => getUyeSiparislerimAction(uye!.id),
    enabled: !!uye,
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-muted-darker" size={32} />
      </div>
    );
  }

  if (!uye) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <Package size={48} className="text-muted-darker mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">Siparişlerim</h1>
        <p className="text-muted mb-6">
          Siparişlerinizi görmek için giriş yapın.
        </p>
        <Link
          href="/hesap"
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-primary-hover transition"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground mb-8">Siparişlerim</h1>

      {isFetching ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-muted-darker" size={32} />
        </div>
      ) : siparisler.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={48} className="text-muted-darker mx-auto mb-4" />
          <p className="text-muted">Henüz siparişiniz bulunmuyor.</p>
          <Link
            href="/urunler"
            className="inline-block mt-4 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-primary-hover transition"
          >
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {siparisler.map((s: any) => (
            <SiparisCard key={s._id} siparis={s} />
          ))}
        </div>
      )}
    </div>
  );
}
