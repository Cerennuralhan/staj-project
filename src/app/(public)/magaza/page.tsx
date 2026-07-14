export const dynamic = "force-dynamic";
import { getMagaza } from "@/features/magaza/public-actions";
import { notFound } from "next/navigation";

export default async function MagazaPage() {
  const magaza = await getMagaza();
  if (!magaza) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">{magaza.magazaAdi}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Harita + Adres */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Adres</h2>
            <p className="text-foreground-secondary">{magaza.adres}</p>
            <p className="text-foreground-secondary">{magaza.telefon}</p>
          </div>

          {magaza.koordinat?.lat && magaza.koordinat?.lng && (
            <div className="rounded-xl border border-border bg-card overflow-hidden h-64">
              <iframe
                title="Mağaza Konumu"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.google.com/maps?q=${magaza.koordinat.lat},${magaza.koordinat.lng}&output=embed`}
              />
            </div>
          )}
        </div>

        {/* Dış Görünüş Fotoğrafları */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Dış Görünüş</h2>
          {magaza.disGorunusFotograflari?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {magaza.disGorunusFotograflari.map((url: string, i: number) => (
                <div key={i} className="aspect-[4/3] bg-surface-alt rounded-xl overflow-hidden">
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-darker">Fotoğraf bulunmuyor.</p>
          )}
        </div>
      </div>
    </div>
  );
}
