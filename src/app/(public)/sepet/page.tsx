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
import { ShoppingBag, Trash2, Loader2, Plus, Minus } from "lucide-react";

export default function SepetPage() {
  const { uye } = useUyeAuth();
  const queryClient = useQueryClient();
  const [misafirId, setMisafirId] = useState<string>("");

  useEffect(() => {
    setMisafirId(getOrCreateMisafirSepetId());
  }, []);

  const { data: sepet, isFetching, refetch } = useQuery({
    queryKey: ["sepet", uye?.id, misafirId],
    queryFn: () => sepetDetayliGetirAction(uye?.id, uye ? undefined : misafirId || undefined),
    enabled: !!uye || misafirId.length > 0,
  });

  const updateAdet = async (urunId: string, yeniAdet: number) => {
    await sepetUrunAdetGuncelleAction(urunId, yeniAdet, uye?.id, uye ? undefined : misafirId || undefined);
    refetch();
  };

  const removeUrun = async (urunId: string) => {
    await sepetUrunSilAction(urunId, uye?.id, uye ? undefined : misafirId || undefined);
    refetch();
  };

  const urunler = sepet?.urunler || [];
  const toplamTutar = sepet?.toplamTutar || 0;

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
            {urunler.map((u: any) => (
              <div key={u.urunId} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3">
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
                </div>

                {/* Adet kontrol */}
                <div className="flex items-center gap-1 border border-border rounded-lg">
                  <button
                    onClick={() => updateAdet(u.urunId, u.adet - 1)}
                    className="p-1.5 text-muted hover:text-foreground transition"
                  ><Minus size={14} /></button>
                  <span className="w-8 text-center text-sm text-foreground">{u.adet}</span>
                  <button
                    onClick={() => updateAdet(u.urunId, u.adet + 1)}
                    className="p-1.5 text-muted hover:text-foreground transition"
                  ><Plus size={14} /></button>
                </div>

                <p className="text-sm font-semibold text-foreground w-20 text-right">
                  {u.fiyat * u.adet} TL
                </p>

                <button
                  onClick={() => removeUrun(u.urunId)}
                  className="text-muted-darker hover:text-danger transition p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Alt toplam */}
          <div className="mt-8 border-t border-border pt-6">
            <div className="flex items-center justify-between text-lg">
              <span className="text-foreground-secondary">Genel Toplam</span>
              <span className="font-bold text-foreground">{toplamTutar.toLocaleString("tr-TR")} TL</span>
            </div>
            <Link
              href="/sepet/odeme"
              className="mt-4 block w-full rounded-lg bg-primary py-3 text-center text-sm font-semibold text-foreground hover:bg-primary-hover transition"
            >
              Siparişi Tamamla
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
