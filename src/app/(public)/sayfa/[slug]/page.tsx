export const dynamic = "force-dynamic";
import { getSayfaBySlug } from "@/features/magaza/public-actions";
import { notFound } from "next/navigation";

export default async function SayfaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sayfa = await getSayfaBySlug(slug);
  if (!sayfa) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-6">{sayfa.baslik}</h1>
      <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed whitespace-pre-line">
        {sayfa.icerik}
      </div>
    </div>
  );
}
