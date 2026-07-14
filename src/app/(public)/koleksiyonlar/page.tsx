export const dynamic = "force-dynamic";

import { getKategorilerAction } from "@/features/kategori/actions";
import Link from "next/link";

export default async function KoleksiyonlarPage() {
  const kategoriler = await getKategorilerAction();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground mb-4">Koleksiyonlar</h1>
      <p className="text-muted mb-10 max-w-xl">
        Her koleksiyon, farklı bir tarzı ve hikâyeyi temsil ediyor. Size en uygun olanı keşfedin.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {kategoriler.map((k: any) => (
          <Link
            key={k._id}
            href={`/urunler?kategori=${k._id}`}
            className="group rounded-xl border border-border bg-card overflow-hidden hover:border-border-strong transition"
          >
            <div className="aspect-[16/9] bg-surface-alt overflow-hidden">
              {k.resim ? (
                <img src={k.resim} alt={k.kategoriAdi} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl text-muted-darker">{k.kategoriAdi.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <h2 className="text-xl font-semibold text-foreground">{k.kategoriAdi}</h2>
              <span className="text-sm text-primary group-hover:text-primary transition-colors mt-2 inline-block">
                Koleksiyonu İncele →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
