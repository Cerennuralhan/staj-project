export const dynamic = "force-dynamic";
import { getMagaza } from "@/features/magaza/public-actions";
import { IletisimFormu } from "./form";

export default async function IletisimPage() {
  const magaza = await getMagaza();

  const haritaUrl = magaza?.koordinat?.lat && magaza?.koordinat?.lng
    ? `https://www.google.com/maps?q=${magaza.koordinat.lat},${magaza.koordinat.lng}&output=embed`
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">İletişim</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Harita + Bilgiler */}
        <div className="space-y-4">
          {haritaUrl && (
            <div className="rounded-xl overflow-hidden border border-border">
              <iframe
                src={haritaUrl}
                width="100%"
                height="320"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mağaza Konumu"
              />
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Mağaza Bilgileri</h2>
            {magaza && (
              <>
                <p className="text-sm text-foreground-secondary">
                  <span className="text-muted-darker block text-xs uppercase tracking-wider mb-0.5">Adres</span>
                  {magaza.adres}
                </p>
                <p className="text-sm text-foreground-secondary">
                  <span className="text-muted-darker block text-xs uppercase tracking-wider mb-0.5">Telefon</span>
                  {magaza.telefon}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Mesaj Gönder</h2>
          <IletisimFormu />
        </div>
      </div>
    </div>
  );
}
