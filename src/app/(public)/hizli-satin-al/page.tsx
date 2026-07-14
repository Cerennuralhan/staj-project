export const dynamic = "force-dynamic";

import { getPublicProductById } from "@/features/urun/public-actions";
import { notFound, redirect } from "next/navigation";
import { HizliSatinAlClient } from "./client";

export default async function HizliSatinAlPage({
  searchParams,
}: {
  searchParams: Promise<{ urunId?: string; adet?: string }>;
}) {
  const sp = await searchParams;
  if (!sp.urunId) redirect("/urunler");

  const adet = Math.max(1, parseInt(sp.adet || "1", 10));
  const urun = await getPublicProductById(sp.urunId);
  if (!urun) notFound();
  if ((urun.stok ?? 0) <= 0) redirect(`/urunler/${sp.urunId}`);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Ürün özeti (sol) */}
        <div>
          <div className="rounded-xl overflow-hidden bg-surface-alt mb-4">
            {urun.kapakResmi ? (
              <img src={urun.kapakResmi} alt={urun.urunAdi} className="w-full aspect-square object-cover" />
            ) : (
              <div className="aspect-square flex items-center justify-center text-muted-darker">Görsel yok</div>
            )}
          </div>
          <h1 className="text-xl font-bold text-foreground">{urun.urunAdi}</h1>
          <p className="text-2xl font-bold text-primary mt-1">{urun.fiyat} TL</p>
        </div>

        {/* Checkout formu (sağ) */}
        <HizliSatinAlClient
          urunId={urun._id}
          urunAdi={urun.urunAdi}
          kapakResmi={urun.kapakResmi || ""}
          fiyat={urun.fiyat}
          adet={adet}
        />
      </div>
    </div>
  );
}
