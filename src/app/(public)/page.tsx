export const dynamic = "force-dynamic";

import { getSliders } from "@/features/magaza/public-actions";
import { getKategorilerAction } from "@/features/kategori/actions";
import { getBannerListAction } from "@/features/banner/actions";
import { getSabitAction } from "@/features/sabitler/actions";
import { getPublicProducts } from "@/features/urun/public-actions";
import { FavoriButton } from "@/components/FavoriButton";
import Link from "next/link";
import { Truck, Undo2, ShieldCheck, CreditCard, HeadphonesIcon } from "lucide-react";
import { HeroCarousel } from "./hero-carousel";
import { BannerCard } from "./banner-card";

/* ---------- Kategori Diamond Menü ---------- */

async function KategoriMenu() {
  const kategoriler = await getKategorilerAction();
  if (kategoriler.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <h2 className="text-2xl font-bold text-foreground text-center mb-10">Koleksiyonlar</h2>
      <div className="mx-auto max-w-5xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {kategoriler.map((k: any) => (
          <Link
            key={k._id}
            href={`/urunler?kategori=${k._id}`}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-24 h-24 rounded-full bg-surface-alt border border-border flex items-center justify-center overflow-hidden group-hover:border-primary transition-all group-hover:shadow-lg group-hover:shadow-primary/20">
              {k.resim ? (
                <img src={k.resim} alt={k.kategoriAdi} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-muted-darker">{k.kategoriAdi.charAt(0)}</span>
              )}
            </div>
            <span className="text-sm text-foreground-secondary group-hover:text-foreground transition-colors text-center">
              {k.kategoriAdi}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------- Öne Çıkan Ürünler ---------- */

async function OneCikanUrunler() {
  const urunler = await getPublicProducts();
  const oneCikan = urunler.filter((u: any) => u.oneCikan).slice(0, 4);
  if (oneCikan.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-card">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">Öne Çıkanlar</h2>
          <Link href="/urunler" className="text-sm text-primary hover:text-primary transition-colors">
            Tümünü Gör
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {oneCikan.map((p: any) => (
            <div key={p._id} className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-border-strong transition">
              <Link href={`/urunler/${p._id}`}>
                {p.kapakResmi && (
                  <div className="aspect-[4/3] bg-surface-alt overflow-hidden">
                    <img src={p.kapakResmi} alt={p.urunAdi} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                )}
              </Link>

              <div className="absolute top-2 right-2 z-10">
                <FavoriButton urunId={p._id} className="bg-black/50 backdrop-blur-sm" />
              </div>

              {p.stok <= 0 && (
                <div className="absolute top-2 left-2 z-10 rounded bg-red-600/90 px-2 py-0.5 text-[11px] font-semibold text-white tracking-wider">
                  Tükendi
                </div>
              )}

              <Link href={`/urunler/${p._id}`}>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground">{p.urunAdi}</h3>
                  <p className="text-sm text-muted mt-1 line-clamp-1">{p.aciklama}</p>
                  <p className="text-lg font-bold text-primary mt-2">{p.fiyat} TL</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Banner Alanı ---------- */

async function BannerGrid() {
  const banners = await getBannerListAction();
  if (banners.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {banners.slice(0, 3).map((b: any) => (
          <BannerCard
            key={b._id}
            baslik={b.baslik}
            aciklama={b.aciklama}
            butonYazisi={b.butonYazisi}
            butonLinki={b.butonLinki}
            resim={b.resim}
          />
        ))}
      </div>
    </section>
  );
}

/* ---------- Güven Şeridi ---------- */

async function TrustBar() {
  const trustData = await getSabitAction("guven_seridi");
  const items = trustData ?? [
    { icon: "truck", label: "Ücretsiz Kargo", desc: "2500 TL üzeri ücretsiz" },
    { icon: "undo", label: "Kolay İade", desc: "30 gün içinde iade" },
    { icon: "shield", label: "Garanti", desc: "2 yıl garantili ürünler" },
    { icon: "card", label: "Güvenli Ödeme", desc: "256-bit SSL sertifikası" },
    { icon: "headphones", label: "7/24 Destek", desc: "Canlı destek hattı" },
  ];

  const iconMap: Record<string, any> = {
    truck: Truck, undo: Undo2, shield: ShieldCheck, card: CreditCard, headphones: HeadphonesIcon,
  };

  return (
    <section className="border-t border-border bg-card py-10 px-4">
      <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-5 gap-6">
        {items.map((item: any, i: number) => {
          const Icon = iconMap[item.icon];
          return (
            <div key={i} className="flex flex-col items-center text-center gap-2">
              {Icon && <Icon size={28} className="text-primary" />}
              <div>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted mt-0.5">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Sayfa ---------- */

export default async function HomePage() {
  const sliders = await getSliders();

  return (
    <>
      <HeroCarousel slides={sliders} />
      <KategoriMenu />
      <OneCikanUrunler />
      <BannerGrid />
      <TrustBar />
    </>
  );
}
