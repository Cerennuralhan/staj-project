"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUyeAuth } from "@/contexts/uye-auth-context";
import {
  sepetDetayliGetirAction,
  sepetUrunAdetGuncelleAction,
  sepetUrunSilAction,
} from "@/features/sepet/public-actions";
import { getOrCreateMisafirSepetId } from "@/lib/sepet-cookie";
import Link from "next/link";
import { ShoppingBag, Trash2, Loader2, Plus, Minus, AlertTriangle } from "lucide-react";

function urunStokSorunlari(urunler: any[]) {
  let sorunVar = false;
  const sonuclar = urunler.map((u) => {
    if (u.stok <= 0) {
      sorunVar = true;
      return { tur: "bitti" as const, mesaj: "Stokta Yok" };
    }
    if (u.adet > u.stok) {
      sorunVar = true;
      return { tur: "kismi" as const, mesaj: `Stokta ${u.stok} adet kaldı` };
    }
    return { tur: "yeterli" as const, mesaj: "" };
  });
  return { sorunVar, sonuclar };
}

export default function SepetPage() {
  const { uye } = useUyeAuth();
  const queryClient = useQueryClient();
  const [misafirId, setMisafirId] = useState<string>("");

  useEffect(() => {
    setMisafirId(getOrCreateMisafirSepetId());
  }, []);

  const sepetQueryKey = ["sepet", uye?.id, misafirId];

  const { data: sepet, isFetching, refetch } = useQuery({
    queryKey: sepetQueryKey,
    queryFn: () => sepetDetayliGetirAction(uye?.id, uye ? undefined : misafirId || undefined),
    enabled: !!uye || misafirId.length > 0,
    refetchInterval: 30_000,
  });

  const updateAdet = useCallback(async (urunId: string, yeniAdet: number) => {
    await sepetUrunAdetGuncelleAction(urunId, yeniAdet, uye?.id, uye ? undefined : misafirId || undefined);
    refetch();
  }, [uye?.id, misafirId, refetch]);

  const removeUrun = useCallback(async (urunId: string) => {
    await sepetUrunSilAction(urunId, uye?.id, uye ? undefined : misafirId || undefined);
    refetch();
  }, [uye?.id, misafirId, refetch]);

  const urunler = sepet?.urunler || [];
  const toplamTutar = sepet?.toplamTutar || 0;
  const { sorunVar, sonuclar } = urunStokSorunlari(urunler);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
        <ShoppingBag size={24} /> Sepetim
      </h1>

      {isFetching ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-darker" size={32} /></div>
      ) : urunler.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={48} className="text-muted-darker mx-auto mb-4" />
          <p className="text-muted">Sepetinizde ürün bulunmamaktadır.</p>
          <Link href="/urunler"
            className="inline-block mt-4 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-primary-hover transition"
          >Alışverişe Başla</Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {urunler.map((u: any, i: number) => {
              const stokDurum = sonuclar[i];
              const stokSorunu = stokDurum.tur !== "yeterli";
              return (
                <div key={u.urunId} className={`flex items-center gap-4 rounded-xl border bg-card p-3 transition-opacity ${stokSorunu ? "border-danger/40 opacity-70" : "border-border"}`}>
                  <Link href={`/urunler/${u.urunId}`} className="shrink-0">
                    <div className="w-20 h-20 rounded-lg bg-surface-alt overflow-hidden">
                      {u.kapakResmi ? (
                        <img src={u.kapakResmi} alt={u.urunAdi} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-darker text-xs">Görsel</div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/urunler/${u.urunId}`}>
                      <h3 className="text-sm font-medium text-foreground truncate">{u.urunAdi}</h3>
                    </Link>
                    <p className="text-sm text-primary mt-0.5">{u.fiyat} TL</p>
                    {/* Stok uyarısı */}
                    {stokSorunu && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <AlertTriangle size={12} className="text-danger shrink-0" />
                        <span className="text-xs font-medium text-danger">{stokDurum.mesaj}</span>
                      </div>
                    )}
                    {stokDurum.tur === "kismi" && (
                      <button
                        onClick={() => updateAdet(u.urunId, u.stok)}
                        className="mt-1 text-xs text-primary hover:underline"
                      >
                        Adedi {u.stok} olarak güncelle
                      </button>
                    )}
                  </div>

                  {/* Adet kontrol */}
                  <div className={`flex items-center gap-1 border rounded-lg ${stokSorunu ? "border-danger/30 opacity-50" : "border-border"}`}>
                    <button
                      onClick={() => updateAdet(u.urunId, u.adet - 1)}
                      disabled={stokSorunu}
                      className="p-1.5 text-muted hover:text-foreground transition disabled:pointer-events-none"
                    ><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm text-foreground">{u.adet}</span>
                    <button
                      onClick={() => updateAdet(u.urunId, u.adet + 1)}
                      disabled={stokSorunu}
                      className="p-1.5 text-muted hover:text-foreground transition disabled:pointer-events-none"
                    ><Plus size={14} /></button>
                  </div>

                  <p className="text-sm font-semibold text-foreground w-20 text-right">
                    {u.fiyat * u.adet} TL
                  </p>

                  <button
                    onClick={() => removeUrun(u.urunId)}
                    className={`transition p-1 ${stokSorunu ? "text-danger hover:text-danger/80" : "text-muted-darker hover:text-danger"}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Alt toplam */}
          <div className="mt-8 border-t border-border pt-6">
            {/* Stok hatası mesajı */}
            {sorunVar && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/5 p-3">
                <AlertTriangle size={16} className="text-danger shrink-0 mt-0.5" />
                <p className="text-sm text-danger">
                  Sepetinizde stokta olmayan veya stok miktarını aşan ürünler bulunuyor.
                  Lütfen bu ürünlerin adedini güncelleyin veya sepetten kaldırın.
                </p>
              </div>
            )}
            <div className="flex items-center justify-between text-lg">
              <span className="text-foreground-secondary">Genel Toplam</span>
              <span className="font-bold text-foreground">{toplamTutar.toLocaleString("tr-TR")} TL</span>
            </div>
            {sorunVar ? (
              <button
                disabled
                className="mt-4 block w-full rounded-lg bg-muted py-3 text-center text-sm font-semibold text-muted-darker cursor-not-allowed"
              >
                Stok sorunları nedeniyle sipariş tamamlanamıyor
              </button>
            ) : (
              <Link
                href="/sepet/odeme"
                className="mt-4 block w-full rounded-lg bg-primary py-3 text-center text-sm font-semibold text-foreground hover:bg-primary-hover transition"
              >
                Siparişi Tamamla
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
