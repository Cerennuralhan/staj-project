export const dynamic = "force-dynamic";
import { getGaleri } from "@/features/magaza/public-actions";

interface GaleriItem {
  _id: string;
  tur: string;
  resim: string;
  baslik: string;
  sira: number;
}

export default async function GaleriPage() {
  const items: GaleriItem[] = await getGaleri();

  const grouped: Record<string, GaleriItem[]> = {};
  for (const item of items) {
    const key = item.tur || "Diğer";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">Galeri</h1>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-muted-darker">Henüz görsel eklenmemiş.</p>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([tur, images]) => (
            <section key={tur}>
              <h2 className="text-xl font-semibold text-foreground mb-4 capitalize">{tur}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div
                    key={img._id}
                    className="aspect-square bg-surface-alt rounded-xl overflow-hidden group"
                  >
                    <img
                      src={img.resim}
                      alt={img.baslik}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {img.baslik && (
                      <div className="p-2 bg-card/80 text-xs text-foreground-secondary truncate">
                        {img.baslik}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
