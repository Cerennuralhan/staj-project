export const dynamic = "force-dynamic";
import { getSayfaBySlug, getMagaza } from "@/features/magaza/public-actions";
import { getSabitAction } from "@/features/sabitler/actions";
import { Truck, Undo2, ShieldCheck, CreditCard, Headphones } from "lucide-react";

const trustItems = [
  { icon: Truck, label: "Ücretsiz Kargo", desc: "2500 TL ve üzeri alışverişlerde kargo ücretsizdir. Teslimat süresi 3-7 iş günüdür.", detail: "Türkiye'nin her yerine ücretsiz gönderim imkanı sunuyoruz. Siparişleriniz özenle paketlenir ve sigortalı olarak gönderilir." },
  { icon: Undo2, label: "Kolay İade", desc: "30 gün içinde koşulsuz iade garantisi.", detail: "Ürünü teslim aldığınız tarihten itibaren 30 gün içinde, herhangi bir sebep göstermeksizin iade edebilirsiniz. İade süreciniz 3 iş günü içinde tamamlanır." },
  { icon: ShieldCheck, label: "Kalite Garantisi", desc: "2 yıl garantili ürünler.", detail: "Tüm ürünlerimiz 2 yıl garantilidir. Üretimden kaynaklanan hatalara karşı tam koruma sağlıyoruz. Garanti süresi boyunca ücretsiz servis hizmeti." },
  { icon: CreditCard, label: "Güvenli Ödeme", desc: "256-bit SSL sertifikası.", detail: "Ödeme sayfanız 256-bit SSL sertifikası ile korunur. Kredi kartı bilgileriniz asla sistemimizde saklanmaz, PCI DSS uyumlu alt yapı ile işlenir." },
  { icon: Headphones, label: "7/24 Destek", desc: "Canlı destek hattı.", detail: "Haftanın 7 günü 09:00-22:00 saatleri arasında canlı destek ekibimize ulaşabilirsiniz. Telefon, e-posta ve canlı sohbet kanallarıyla hizmetinizdeyiz." },
];

export default async function HakkimizdaPage() {
  const [sayfa, magaza] = await Promise.all([
    getSayfaBySlug("hakkimizda"),
    getMagaza(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Başlık */}
      <h1 className="text-3xl font-bold text-foreground mb-10">Hakkımızda</h1>

      {/* İçerik — sayfalar koleksiyonundan (varsa) */}
      {sayfa?.icerik && (
        <section className="mb-16">
          <div className="prose prose-invert max-w-none text-foreground-secondary leading-relaxed whitespace-pre-line">
            {sayfa.icerik}
          </div>
        </section>
      )}

      {/* Mağaza Fotoğrafları Galerisi */}
      {magaza?.disGorunusFotograflari?.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">Mağazamız</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {magaza.disGorunusFotograflari.map((url: string, i: number) => (
              <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-surface-alt">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Neden Biz? */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-8">Neden Biz?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="rounded-xl border border-border bg-card p-6">
                <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center mb-4">
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.label}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mağaza Bilgisi */}
      {magaza && (
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">{magaza.magazaAdi}</h2>
          <div className="space-y-2 text-sm text-muted">
            <p><strong className="text-foreground-secondary">Adres:</strong> {magaza.adres}</p>
            <p><strong className="text-foreground-secondary">Telefon:</strong> {magaza.telefon}</p>
          </div>
        </section>
      )}
    </div>
  );
}
