import { notFound } from "next/navigation";
import Link from "next/link";
import { getMusteriDetayAction } from "@/features/musteri/detail-actions";
import { OdemelerPanel } from "./odemeler-panel";
import { MusteriDeleteButton } from "./page-actions";
import { NotlarEditor } from "./notlar-editor";
import { ProfilTab } from "./profil-tab";
import {
  ArrowLeft, Users, ShoppingCart, Wallet, Calendar,
  User, Package, CreditCard, Wrench, Shield, FileText,
  PlusCircle,
  Clock, CheckCircle2, Truck, AlertTriangle, XCircle,
  ChevronRight,
} from "lucide-react";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("tr-TR");
}
function formatDateTime(d: string) {
  return new Date(d).toLocaleString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function formatCurrency(n: number) {
  return n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

const siparisDurumRenk: Record<string, string> = {
  beklemede: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  onaylandi: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  hazirlaniyor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  kargoda: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  teslim_edildi: "text-green-400 bg-green-400/10 border-green-400/20",
  iptal: "text-red-400 bg-red-400/10 border-red-400/20",
};
const siparisDurumIcons: Record<string, typeof Clock> = {
  beklemede: Clock, onaylandi: CheckCircle2, hazirlaniyor: Wrench,
  kargoda: Truck, teslim_edildi: CheckCircle2, iptal: XCircle,
};

const kurulumDurumRenk: Record<string, string> = {
  planlandi: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  tamamlandi: "text-green-400 bg-green-400/10 border-green-400/20",
  iptal: "text-red-400 bg-red-400/10 border-red-400/20",
};

const garantiDurumRenk: Record<string, string> = {
  aktif: "text-green-400 bg-green-400/10 border-green-400/20",
  suresi_doldu: "text-zinc-500 bg-zinc-800 border-zinc-700",
};
const talepDurumRenk: Record<string, string> = {
  acik: "text-red-400 bg-red-400/10 border-red-400/20",
  inceleniyor: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  cozuldu: "text-green-400 bg-green-400/10 border-green-400/20",
};

/* Tabs */
const tabs = [
  { key: "profil", label: "Profil", icon: User },
  { key: "siparisler", label: "Siparişler", icon: ShoppingCart },
  { key: "odemeler", label: "Ödemeler", icon: CreditCard },
  { key: "kurulumlar", label: "Kurulumlar", icon: Wrench },
  { key: "garanti", label: "Garanti", icon: Shield },
  { key: "notlar", label: "Notlar", icon: FileText },
] as const;
type TabKey = (typeof tabs)[number]["key"];

export default async function MusteriDetayPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, { tab }] = await Promise.all([props.params, props.searchParams]);
  const activeTab: TabKey = tabs.some((t) => t.key === tab) ? (tab as TabKey) : "profil";

  const data = await getMusteriDetayAction(id);
  if (!data) notFound();

  const { musteri, siparisler, kurulumlar, garantiler, garantiTalepleri } = data;

  const toplamHarcama = siparisler.reduce((sum: number, s: any) => sum + (s.toplamTutar || 0), 0);
  const bekleyenBakiye = siparisler.reduce((sum: number, s: any) => {
    const plan = s.odemePlani;
    if (!plan || !plan.taksitler) return sum + (s.toplamTutar || 0);
    const kalan = plan.taksitler.filter((t: any) => !t.odendiMi).reduce((a: number, t: any) => a + t.tutar, 0);
    return sum + kalan;
  }, 0);
  const sonSiparis = siparisler.length > 0 ? siparisler[0].siparisTarihi : null;
  const aktifGarantiler = garantiler.filter((g: any) => g.durum === "aktif");
  const yaklasanGarantiler = aktifGarantiler.filter((g: any) => g.kalanGun <= 30);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/musteri" className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
            <Users size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              {musteri.adSoyad}
              <span className="text-xs font-semibold rounded-full px-2.5 py-0.5 border bg-green-900/30 text-green-400 border-green-700/50">
                Aktif
              </span>
            </h1>
            <p className="text-sm text-zinc-400">
              {musteri.telefon && <span className="mr-3"><a href={`tel:${musteri.telefon}`} className="text-blue-400 hover:underline">{musteri.telefon}</a></span>}
              {musteri.eposta && <a href={`mailto:${musteri.eposta}`} className="text-blue-400 hover:underline">{musteri.eposta}</a>}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <MusteriDeleteButton musteriId={musteri._id} />
          <Link href={`/dashboard/siparis/yeni?musteri=${id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-green-500 transition">
            <PlusCircle size={15} />
            Yeni Sipariş
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard icon={<ShoppingCart size={20} />} label="Toplam Sipariş" value={siparisler.length} color="blue" />
        <SummaryCard icon={<Wallet size={20} />} label="Toplam Harcama" value={formatCurrency(toplamHarcama)} color="green" />
        <SummaryCard icon={<CreditCard size={20} />} label="Bekleyen Bakiye" value={bekleyenBakiye > 0 ? formatCurrency(bekleyenBakiye) : "—"} color="purple" />
        <SummaryCard icon={<Calendar size={20} />} label="Son Sipariş" value={sonSiparis ? formatDate(sonSiparis) : "—"} color="amber" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800 pb-px overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <Link
              key={t.key}
              href={`/dashboard/musteri/${id}?tab=${t.key}`}
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

      {/* Tab: Profil */}
      {activeTab === "profil" && <ProfilTab musteri={musteri} />}

      {/* Tab: Siparişler */}
      {activeTab === "siparisler" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">{siparisler.length} sipariş bulunuyor.</p>
          {siparisler.length === 0 ? (
            <p className="text-sm text-zinc-500">Henüz sipariş bulunmuyor.</p>
          ) : (
            <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 overflow-hidden">
              {siparisler.map((s: any) => {
                const DurumIcon = siparisDurumIcons[s.durum] || Clock;
                return (
                  <Link key={s._id} href={`/dashboard/siparis/${s._id}`}
                    className="flex items-center gap-4 px-4 py-3.5 bg-zinc-900 hover:bg-zinc-800/60 transition-colors group">
                    <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-blue-400">#{s.siparisNo}</p>
                      <p className="text-xs text-zinc-400 self-center">{formatDate(s.siparisTarihi)}</p>
                      <p className="text-xs text-zinc-400 self-center">{formatCurrency(s.toplamTutar)}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium self-center justify-end ${siparisDurumRenk[s.durum] || ""}`}>
                        <DurumIcon size={10} />
                        {s.durum}
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600 shrink-0 group-hover:text-zinc-400" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Ödemeler */}
      {activeTab === "odemeler" && (
        <OdemelerPanel musteriId={id} />
      )}

      {/* Tab: Kurulumlar */}
      {activeTab === "kurulumlar" && (
        <div className="space-y-3">
          {kurulumlar.length === 0 ? (
            <p className="text-sm text-zinc-500">Henüz kurulum kaydı bulunmuyor.</p>
          ) : (
            <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 overflow-hidden">
              {kurulumlar.map((k: any) => (
                <div key={k._id} className="flex items-center gap-4 px-4 py-3.5 bg-zinc-900">
                  <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1">
                    <p className="text-sm text-white font-medium truncate">{k.urunId?.urunAdi || "—"}</p>
                    <p className="text-xs text-zinc-400 self-center">{formatDate(k.kurulumTarihi)}</p>
                    <p className="text-xs text-zinc-400 self-center">{k.montajKullaniciId?.adSoyad || "Atanmamış"}</p>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium self-center justify-end ${kurulumDurumRenk[k.durum] || ""}`}>
                      {k.durum === "planlandi" ? "Planlandı" : k.durum === "tamamlandi" ? "Tamamlandı" : "İptal"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Garanti */}
      {activeTab === "garanti" && (
        <div className="space-y-3">
          {/* Yaklaşan uyarı */}
          {yaklasanGarantiler.length > 0 && (
            <div className="p-3 rounded-lg border border-yellow-800 bg-yellow-900/10 flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-400 shrink-0" />
              <p className="text-sm text-yellow-400">{yaklasanGarantiler.length} garantinin süresi yakında doluyor</p>
            </div>
          )}

          {garantiler.length === 0 ? (
            <p className="text-sm text-zinc-500">Henüz garanti kaydı bulunmuyor.</p>
          ) : (
            <div className="space-y-3">
              {garantiler.map((g: any) => {
                const durumEtiketi = g.durum === "aktif" && g.kalanGun <= 30 ? "yaklasan" : g.durum;
                const durumRenkMap: Record<string, string> = {
                  aktif: "text-green-400 bg-green-400/10 border-green-400/20",
                  yaklasan: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
                  suresi_doldu: "text-zinc-500 bg-zinc-800 border-zinc-700",
                };
                const durumYazi: Record<string, string> = {
                  aktif: "Aktif",
                  yaklasan: "Yaklaşan",
                  suresi_doldu: "Süresi Doldu",
                };
                return (
                <div key={g._id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {/* Ürün görseli */}
                    {g.urunId?.kapakResmi && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={g.urunId.kapakResmi} alt={g.urunId.urunAdi || ""} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white truncate">{g.urunId?.urunAdi || "—"}</p>
                        {g.seriNo && <span className="text-[10px] text-zinc-500">SN: {g.seriNo}</span>}
                      </div>
                      {g.siparisId?.siparisNo && (
                        <Link href={"/dashboard/siparis/" + g.siparisId._id} className="text-[11px] text-blue-400 hover:underline inline-block mt-0.5">
                          Sipariş #{g.siparisId.siparisNo}
                        </Link>
                      )}
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {formatDate(g.garantiBaslangic)} → {formatDate(g.garantiBitis)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${durumRenkMap[durumEtiketi] || ""}`}>
                        {durumYazi[durumEtiketi] || ""}
                      </span>
                      {g.durum === "aktif" && (
                        <p className={`text-xs mt-1 ${g.kalanGun <= 30 ? "text-yellow-400" : "text-zinc-500"}`}>
                          {g.kalanGun} gün kaldı
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Garanti Talepleri */}
                  {garantiTalepleri.filter((t: any) => String(t.garantiId) === String(g._id)).length > 0 && (
                    <div className="pt-3 border-t border-zinc-800 space-y-2">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Talepler</p>
                      {garantiTalepleri.filter((t: any) => String(t.garantiId) === String(g._id)).map((t: any) => (
                        <div key={t._id} className="flex items-center justify-between bg-zinc-800/40 rounded-lg px-3 py-2">
                          <p className="text-xs text-zinc-300 flex-1">{t.aciklama}</p>
                          <span className={`text-[10px] font-medium rounded-full border px-2 py-0.5 shrink-0 ml-2 ${talepDurumRenk[t.durum] || ""}`}>
                            {t.durum === "acik" ? "Açık" : t.durum === "inceleniyor" ? "İnceleniyor" : "Çözüldü"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Notlar */}
      {activeTab === "notlar" && (
        <NotlarEditor musteriId={id} notlar={musteri.notlar || ""} />
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number; color: "blue" | "green" | "purple" | "amber";
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-white">{value}</p>
        <p className="text-[11px] text-zinc-500">{label}</p>
      </div>
    </div>
  );
}
