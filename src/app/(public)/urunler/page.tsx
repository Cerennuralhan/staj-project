export const dynamic = "force-dynamic";
import { getPublicProducts } from "@/features/urun/public-actions";
import { getKategorilerAction } from "@/features/kategori/actions";
import Link from "next/link";
import { FavoriButton } from "@/components/FavoriButton";
import { FilterBar } from "@/components/FilterBar";

export default async function UrunlerPage({
  searchParams,
}: {
  searchParams: Promise<{
    kategori?: string;
    minFiyat?: string;
    maxFiyat?: string;
    renkler?: string;
    materyaller?: string;
    sirala?: string;
  }>;
}) {
  const sp = await searchParams;
  const [products, kategoriler] = await Promise.all([
    getPublicProducts({
      kategoriId: sp.kategori || undefined,
      minFiyat: sp.minFiyat ? Number(sp.minFiyat) : undefined,
      maxFiyat: sp.maxFiyat ? Number(sp.maxFiyat) : undefined,
      renkler: sp.renkler?.split(",").filter(Boolean),
      materyaller: sp.materyaller?.split(",").filter(Boolean),
      sirala: sp.sirala || undefined,
    }),
    getKategorilerAction(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">Ürünler</h1>

      <FilterBar />

      {products.length === 0 ? (
        <p className="text-muted-darker">Bu kategoride ürün bulunamadı.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p: any) => (
            <div key={p._id} className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-border-strong transition">
              <Link href={`/urunler/${p._id}`}>
                {p.kapakResmi && (
                  <div className="aspect-[4/3] bg-surface-alt overflow-hidden">
                    <img
                      src={p.kapakResmi}
                      alt={p.urunAdi}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                )}
              </Link>

              {/* Favori butonu — üst-sağ köşede */}
              <div className="absolute top-2 right-2 z-10">
                <FavoriButton
                  urunId={p._id}
                  className="bg-black/50 backdrop-blur-sm"
                />
              </div>

              {/* Tükendi etiketi */}
              {p.stok <= 0 && (
                <div className="absolute top-2 left-2 z-10 rounded bg-red-600/90 px-2 py-0.5 text-[11px] font-semibold text-white tracking-wider">
                  Tükendi
                </div>
              )}

              <Link href={`/urunler/${p._id}`}>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground">{p.urunAdi}</h3>
                  <p className="text-sm text-muted mt-1 line-clamp-2">{p.aciklama}</p>
                  <p className="text-lg font-bold text-primary mt-2">{p.fiyat} TL</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
