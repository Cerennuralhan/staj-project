export const dynamic = "force-dynamic";
import Image from "next/image";
import { getPublicProductById } from "@/features/urun/public-actions";
import { notFound } from "next/navigation";
import { FavoriButton } from "@/components/FavoriButton";
import { UrunDetayActions } from "@/components/UrunDetayActions";

export default async function UrunDetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const urun = await getPublicProductById(id);
  if (!urun) notFound();

  const images = [
    ...(urun.kapakResmi ? [{ resim: urun.kapakResmi, sira: -1 }] : []),
    ...(urun.resimler ?? []),
  ].sort((a: any, b: any) => a.sira - b.sira);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Galeri */}
        <div>
          {images.length > 0 ? (
            <div className={`grid ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
              {images.map((img: any, i: number) => (
                <div key={i} className="aspect-square bg-surface-alt rounded-xl overflow-hidden relative">
                  <Image
                    src={img.resim}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-square bg-surface-alt rounded-xl flex items-center justify-center text-muted-darker">
              Görsel yok
            </div>
          )}
        </div>

        {/* Bilgiler */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-foreground mb-4">{urun.urunAdi}</h1>
            <FavoriButton urunId={urun._id} className="shrink-0 mt-1 bg-surface-alt hover:bg-surface-alt" />
          </div>
          <p className="text-4xl font-bold text-primary mb-6">{urun.fiyat} TL</p>
          <p className="text-foreground-secondary leading-relaxed">{urun.aciklama}</p>

          {/* Özellikler */}
          <div className="mt-6 space-y-2">
            {urun.renk?.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-darker min-w-[80px]">Renk:</span>
                <span className="text-foreground-secondary">{urun.renk.join(", ")}</span>
              </div>
            )}
            {urun.materyal?.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-darker min-w-[80px]">Materyal:</span>
                <span className="text-foreground-secondary">{urun.materyal.join(", ")}</span>
              </div>
            )}
            {urun.warrantyPeriodMonths > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-darker min-w-[80px]">Garanti:</span>
                <span className="text-foreground-secondary">
                  {urun.warrantyPeriodMonths >= 12
                    ? `${Math.floor(urun.warrantyPeriodMonths / 12)} yıl${urun.warrantyPeriodMonths % 12 > 0 ? ` ${urun.warrantyPeriodMonths % 12} ay` : ""}`
                    : `${urun.warrantyPeriodMonths} ay`}
                </span>
              </div>
            )}
          </div>

          {/* Sepete Ekle / Satın Al */}
          <div className="mt-8">
            <UrunDetayActions
              urunId={urun._id}
              urunAdi={urun.urunAdi}
              kapakResmi={urun.kapakResmi || ""}
              fiyat={urun.fiyat}
              stok={urun.stok ?? 0}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
