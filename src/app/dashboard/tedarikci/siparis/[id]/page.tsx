import { notFound } from "next/navigation";
import Link from "next/link";
import { getTedarikSiparisByIdAction, getTedarikciByIdAction } from "@/features/tedarikci/actions";
import { YazdirButton } from "./print-button";
import {
  ArrowLeft, CheckCircle2, Circle, Clock, Truck, Package,
  Building2, Hash, Calendar, MapPin, CreditCard, FileText, Download,
  ChevronRight, Banknote, Send,
} from "lucide-react";

const durumLabels: Record<string, string> = {
  beklemede: "Beklemede", yolda: "Yolda", teslim_alindi: "Teslim Alındı",
};
const durumRenkBadge: Record<string, string> = {
  beklemede: "bg-yellow-900/30 text-yellow-400 border-yellow-700/50",
  yolda: "bg-blue-900/30 text-blue-400 border-blue-700/50",
  teslim_alindi: "bg-green-900/30 text-green-400 border-green-700/50",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("tr-TR");
}
function formatDateTime(d: string) {
  return new Date(d).toLocaleString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* Timeline step definitions */
const timelineSteps = [
  { key: "beklemede", label: "Sipariş Onaylandı", icon: CheckCircle2 },
  { key: "yolda", label: "Kargoya Verildi", icon: Send },
  { key: "teslim_alindi", label: "Teslim Edildi", icon: Truck },
];

function getStepStatus(key: string, durumGecmisi: any[], currentDurum: string): "completed" | "active" | "pending" {
  const history = durumGecmisi || [];
  if (history.some((h: any) => h.durum === key)) return "completed";
  if (key === currentDurum) return "active";
  return "pending";
}

function getStepDate(key: string, durumGecmisi: any[]): string | null {
  const entry = (durumGecmisi || []).find((h: any) => h.durum === key);
  return entry ? entry.tarih : null;
}

/* Tabs */
const tabs = [
  { key: "urunler", label: "Ürünler", icon: Package },
  { key: "siparis", label: "Sipariş Bilgileri", icon: FileText },
  { key: "odeme", label: "Ödeme Bilgileri", icon: CreditCard },
] as const;
type TabKey = (typeof tabs)[number]["key"];

export default async function TedarikSiparisDetayPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, { tab }] = await Promise.all([props.params, props.searchParams]);
  const activeTab: TabKey = tabs.some((t) => t.key === tab) ? (tab as TabKey) : "urunler";

  const siparis = await getTedarikSiparisByIdAction(id);
  if (!siparis) notFound();

  const tedarikci = await getTedarikciByIdAction(siparis.tedarikciId.toString());
  const durumGecmisi: any[] = siparis.durumGecmisi || [];

  const araToplam = (siparis.urunler || []).reduce((sum: number, u: any) => sum + (u.toplamTutar || u.adet * (u.birimFiyat || 0)), 0);
  const kdv = araToplam * 0.20;
  const genelToplam = araToplam + kdv;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/tedarikci" className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-white">SİPARİŞ DETAYI</h1>
        </div>
        <YazdirButton />
      </div>

      {/* Info Strip */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-zinc-500 flex items-center gap-1"><Hash size={12} /> Sipariş No</p>
            <p className="text-white font-semibold mt-0.5">#{siparis.siparisNo}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 flex items-center gap-1"><Building2 size={12} /> Tedarikçi</p>
            <p className="text-white font-semibold mt-0.5 truncate">{tedarikci?.firmaAdi || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 flex items-center gap-1"><Calendar size={12} /> Sipariş Tarihi</p>
            <p className="text-white mt-0.5">{formatDate(siparis.siparisTarihi)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 flex items-center gap-1"><Calendar size={12} /> Tahmini Teslimat</p>
            <p className="text-white mt-0.5">{siparis.tahminiTeslimatTarihi ? formatDate(siparis.tahminiTeslimatTarihi) : "—"}</p>
          </div>
        </div>
        {siparis.teslimAlmaTarihi && (
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 flex items-center gap-1"><CheckCircle2 size={12} className="text-green-400" /> Teslim Alınma Tarihi</p>
            <p className="text-green-400 font-semibold mt-0.5">{formatDateTime(siparis.teslimAlmaTarihi)}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center justify-between gap-2">
          {timelineSteps.map((step, idx) => {
            const status = getStepStatus(step.key, durumGecmisi, siparis.durum);
            const tarih = getStepDate(step.key, durumGecmisi);
            const isCompleted = status === "completed";
            const isActive = status === "active";
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex-1 relative">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? "bg-green-500/20 text-green-400 ring-2 ring-green-500/40"
                      : isActive
                        ? "bg-blue-500/20 text-blue-400 ring-2 ring-blue-500/40"
                        : "bg-zinc-800 text-zinc-600"
                  }`}>
                    {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${isCompleted ? "text-green-400" : isActive ? "text-blue-400" : "text-zinc-600"}`}>
                      {step.label}
                    </p>
                    {tarih && (
                      <p className="text-[10px] text-zinc-500 mt-0.5">{formatDateTime(tarih)}</p>
                    )}
                  </div>
                </div>
                {idx < timelineSteps.length - 1 && (
                  <div className={`absolute top-5 left-[60%] right-0 h-[2px] -translate-y-1/2 z-0 ${
                    timelineSteps.slice(0, idx + 1).every((s) => getStepStatus(s.key, durumGecmisi, siparis.durum) === "completed")
                      ? "bg-green-500/50"
                      : "bg-zinc-800"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800 pb-px overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <Link
              key={t.key}
              href={`/dashboard/tedarikci/siparis/${id}?tab=${t.key}`}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                isActive ? "border-blue-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Tab: Ürünler */}
      {activeTab === "urunler" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Ürün</th>
                  <th className="text-right px-4 py-3 font-medium">Miktar</th>
                  <th className="text-right px-4 py-3 font-medium">Birim Fiyat</th>
                  <th className="text-right px-4 py-3 font-medium">Toplam Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {(siparis.urunler || []).map((u: any, idx: number) => (
                  <tr key={idx} className="bg-zinc-900 hover:bg-zinc-800/60 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{u.urunAdi}</p>
                      <p className="text-xs text-zinc-500">ID: {u.urunId?.toString().slice(-6).toUpperCase()}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-white">{u.adet}</td>
                    <td className="px-4 py-3 text-right text-white">{(u.birimFiyat || 0).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</td>
                    <td className="px-4 py-3 text-right text-white font-semibold">{(u.toplamTutar || u.adet * (u.birimFiyat || 0)).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-zinc-800/30">
                <tr className="text-sm">
                  <td colSpan={3} className="px-4 py-2.5 text-right text-zinc-400">Ara Toplam</td>
                  <td className="px-4 py-2.5 text-right text-white">{araToplam.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</td>
                </tr>
                <tr className="text-sm">
                  <td colSpan={3} className="px-4 py-2.5 text-right text-zinc-400">KDV (%20)</td>
                  <td className="px-4 py-2.5 text-right text-white">{kdv.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</td>
                </tr>
                <tr className="text-sm font-bold">
                  <td colSpan={3} className="px-4 py-2.5 text-right text-zinc-200">Genel Toplam</td>
                  <td className="px-4 py-2.5 text-right text-blue-400">{genelToplam.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Sipariş Bilgileri */}
      {activeTab === "siparis" && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-blue-400" />
              Sipariş Bilgileri
            </h3>
            <InfoRow label="Sipariş No" value={`#${siparis.siparisNo}`} />
            <InfoRow label="Durum" value={durumLabels[siparis.durum]} />
            <InfoRow label="Sipariş Tarihi" value={formatDate(siparis.siparisTarihi)} />
            <InfoRow label="Tahmini Teslimat" value={siparis.tahminiTeslimatTarihi ? formatDate(siparis.tahminiTeslimatTarihi) : "—"} />
            <InfoRow label="Teslim Alınma" value={siparis.teslimAlmaTarihi ? formatDateTime(siparis.teslimAlmaTarihi) : "—"} />
            <InfoRow label="Ürün Sayısı" value={`${siparis.urunler?.length || 0}`} />
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Building2 size={16} className="text-blue-400" />
              Tedarikçi
            </h3>
            <InfoRow label="Firma" value={tedarikci?.firmaAdi || "—"} />
            <InfoRow label="Telefon" value={tedarikci?.telefon || "—"} />
            <InfoRow label="E-posta" value={tedarikci?.eposta || "—"} />
            {tedarikci?.yetkiliKisi && <InfoRow label="Yetkili" value={tedarikci.yetkiliKisi} />}
          </div>
        </div>
      )}

      {/* Tab: Ödeme Bilgileri */}
      {activeTab === "odeme" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <CreditCard size={16} className="text-blue-400" />
            Ödeme Bilgileri
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoRow label="Ödeme Yöntemi" value={siparis.odemeBilgileri?.odemeYontemi || "—"} />
            <InfoRow label="Ödeme Tarihi" value={siparis.odemeBilgileri?.odemeTarihi ? formatDate(siparis.odemeBilgileri.odemeTarihi) : "—"} />
            <InfoRow label="Tutar" value={siparis.odemeBilgileri?.odemeTutari ? `${siparis.odemeBilgileri.odemeTutari.toLocaleString("tr-TR")} ${siparis.odemeBilgileri.paraBirimi || "TRY"}` : "—"} />
            <InfoRow label="Durum" value={(siparis.odemeBilgileri?.odemeDurumu === "odendi" ? "Ödendi" : siparis.odemeBilgileri?.odemeDurumu === "beklemede" ? "Beklemede" : siparis.odemeBilgileri?.odemeDurumu || "—")} />
            <InfoRow label="Banka" value={siparis.odemeBilgileri?.bankaAdi || "—"} />
            <InfoRow label="Referans No" value={siparis.odemeBilgileri?.referansNo || "—"} />
          </div>
        </div>
      )}

      {/* Bottom Boxes */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Teslimat Bilgileri */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <MapPin size={16} className="text-green-400" />
            Teslimat Bilgileri
          </h3>
          <InfoRow label="Teslimat Adresi" value={siparis.teslimatBilgileri?.adres || "—"} />
          <InfoRow label="Teslimat Yöntemi" value={siparis.teslimatBilgileri?.yontem || "—"} />
          <InfoRow label="Kargo/Araç Plakası" value={siparis.teslimatBilgileri?.kargoPlaka || "—"} />
          <InfoRow label="Açıklama" value={siparis.teslimatBilgileri?.aciklama || "—"} />
        </div>

        {/* Ek Bilgiler */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} className="text-blue-400" />
            Ek Bilgiler
          </h3>
          <p className="text-xs text-zinc-500">Bu siparişle ilgili belgeler</p>

          {/* Tedarikçinin cloudinary belgeleri */}
          {tedarikci?.tedarikciBelgeleri && tedarikci.tedarikciBelgeleri.length > 0 ? (
            <div className="space-y-2">
              {tedarikci.tedarikciBelgeleri.map((b: any, i: number) => (
                <a key={i} href={b.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3.5 py-2.5 text-sm text-zinc-300 transition group">
                  <Download size={14} className="text-blue-400 shrink-0" />
                  <span className="flex-1 truncate">{b.aciklama || `Belge ${i + 1}`}</span>
                  <span className="text-[10px] text-zinc-500 uppercase">{b.tur || "belge"}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 italic">Henüz belge yüklenmemiş.</p>
          )}

          {siparis.teslimAlmaTarihi && (
            <div className="flex items-center gap-2 rounded-lg bg-green-900/20 border border-green-700/30 px-3.5 py-2.5 text-sm text-green-400 mt-2">
              <CheckCircle2 size={16} />
              <span>Sipariş teslim alındı</span>
            </div>
          )}
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-sm text-white">{value}</p>
      </div>
    </div>
  );
}
