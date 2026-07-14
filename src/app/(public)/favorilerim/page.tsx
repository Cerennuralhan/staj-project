"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUyeAuth } from "@/contexts/uye-auth-context";
import { favoriListAction, favoriSilAction } from "@/features/favori/public-actions";
import Link from "next/link";
import { Heart, Trash2, Loader2 } from "lucide-react";

export default function FavorilerimPage() {
  const { uye, loading } = useUyeAuth();
  const queryClient = useQueryClient();
  const [removing, setRemoving] = useState<string | null>(null);

  const { data: favoriler = [], isFetching } = useQuery({
    queryKey: ["favorilerim", uye?.id],
    queryFn: () => favoriListAction(uye!.id),
    enabled: !!uye,
  });

  const handleRemove = async (urunId: string) => {
    if (!uye) return;
    setRemoving(urunId);
    await favoriSilAction(uye.id, urunId);
    queryClient.invalidateQueries({ queryKey: ["favorilerim"] });
    setRemoving(null);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-darker" size={32} /></div>;
  }

  if (!uye) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <Heart size={48} className="text-muted-darker mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">Favorilerim</h1>
        <p className="text-muted mb-6">Favorilerinizi görmek için giriş yapın.</p>
        <Link href="/hesap"
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-primary-hover transition"
        >Giriş Yap</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground mb-8">Favorilerim</h1>

      {isFetching ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-darker" size={32} /></div>
      ) : favoriler.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} className="text-muted-darker mx-auto mb-4" />
          <p className="text-muted">Favorinizde ürün bulunmamaktadır.</p>
          <Link href="/urunler"
            className="inline-block mt-4 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-primary-hover transition"
          >Alışverişe Başla</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriler.map((fav: any) => {
            const urun = fav.urunId;
            if (!urun) return null;
            return (
              <div key={fav._id} className="group relative rounded-xl border border-border bg-card overflow-hidden">
                <Link href={`/urunler/${urun._id}`}>
                  <div className="aspect-square bg-surface-alt">
                    {urun.kapakResmi ? (
                      <img src={urun.kapakResmi} alt={urun.urunAdi} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-darker text-sm">Görsel Yok</div>
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  <Link href={`/urunler/${urun._id}`}>
                    <h3 className="text-sm font-medium text-foreground truncate">{urun.urunAdi}</h3>
                  </Link>
                  <p className="text-sm text-primary mt-1">{urun.fiyat} TL</p>
                </div>
                <button
                  onClick={() => handleRemove(urun._id)}
                  disabled={removing === urun._id}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5 text-danger hover:text-red-300 transition disabled:opacity-50"
                >
                  {removing === urun._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
