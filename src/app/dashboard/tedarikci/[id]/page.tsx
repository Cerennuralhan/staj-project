import { notFound } from "next/navigation";
import Link from "next/link";
import { getTedarikciByIdAction, getTedarikSiparisByTedarikciAction, getTedarikSiparisUrunlerByTedarikciAction } from "@/features/tedarikci/actions";
import { getIslemKayitlariByHedef } from "@/lib/audit";
import { BelgeUploadForm } from "./belge-upload";
import { TedarikciPageActions } from "./page-actions";
import {
  ArrowLeft, Building2, Phone, Mail, MapPin, UserCheck, Clock,
  Package, Truck, CheckCircle2, FileText, Activity, Banknote,
  Landmark, BadgeInfo, ChevronRight,
} from "lucide-react";

const durumLabels: Record<string, string> = {
  beklemede: "Beklemede", yolda: "Yolda", teslim_alindi: "Teslim Alındı",
};
const durumRenk: Record<string, string> = {
  beklemede: "bg-yellow-900/30 text-yellow-400 border-yellow-700/50",
  yolda: "bg-blue-900/30 text-blue-400 border-blue-700/50",
  teslim_alindi: "bg-green-900/30 text-green-400 border-green-700/50",
};
const durumIcons: Record<string, typeof Clock> = {
  beklemede: Clock, yolda: Truck, teslim_alindi: CheckCircle2,
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("tr-TR");
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("tr-TR");
}

const tabs = [
  { key: "genel", label: "Genel Bilgiler", icon: Building2 },
  { key: "urunler", label: "Ürünler", icon: Package },
  { key: "siparisler", label: "Sipariş Geçmişi", icon: Truck },
  { key: "belgeler", label: "Belgeler", icon: FileText },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default async function TedarikciDetayPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, { tab }] = await Promise.all([props.params, props.searchParams]);
  const activeTab: TabKey = tabs.some((t) => t.key === tab) ? (tab as TabKey) : "genel";

  const [tedarikci, siparisler, urunler, aktiviteler] = await Promise.all([
    getTedarikciByIdAction(id),
    getTedarikSiparisByTedarikciAction(id),
    getTedarikSiparisUrunlerByTedarikciAction(id),
    getIslemKayitlariByHedef(id),
  ]);
  if (!tedarikci) notFound();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tedarikci" className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
          {tedarikci.logo ? (
            <img src={tedarikci.logo} alt="" className="w-full h-full object-cover" />
          ) : (
            <Building2 size={28} className="text-zinc-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white truncate">{tedarikci.firmaAdi}</h1>
          <p className="text-sm text-zinc-400 truncate">
            {tedarikci.yetkiliKisi && `${tedarikci.yetkiliKisi} · `}
            {tedarikci.telefon || "—"} · {tedarikci.eposta || "—"}
          </p>
        </div>

        <TedarikciPageActions tedarikci={tedarikci} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800 pb-px overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <Link
              key={t.key}
              href={`/dashboard/tedarikci/${id}?tab=${t.key}`}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                isActive
                  ? "border-blue-500 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "genel" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Firma Bilgileri */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Building2 size={16} className="text-blue-400" />
              Firma Bilgileri
            </h2>
            <InfoRow label="Firma Adı" value={tedarikci.firmaAdi} />
            <InfoRow label="Vergi Dairesi" value={tedarikci.vergiDairesi} />
            <InfoRow label="Vergi No" value={tedarikci.vergiNo} />
            <InfoRow label="Mersis No" value={tedarikci.mersisNo} />
            <InfoRow label="Kuruluş Yılı" value={tedarikci.kurulusYili} />
          </div>

          {/* İletişim Bilgileri */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Phone size={16} className="text-blue-400" />
              İletişim Bilgileri
            </h2>
            <InfoRow icon={<Phone size={14} />} label="Telefon" value={tedarikci.telefon} />
            <InfoRow icon={<Mail size={14} />} label="E-posta" value={tedarikci.eposta} />
            <InfoRow icon={<MapPin size={14} />} label="Adres" value={tedarikci.adres} />
            <InfoRow icon={<UserCheck size={14} />} label="Yetkili Kişi" value={tedarikci.yetkiliKisi} />
            <InfoRow icon={<Clock size={14} />} label="Çalışma Saatleri" value={tedarikci.calismaSaatleri} />
          </div>

          {/* Banka Bilgileri */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Landmark size={16} className="text-blue-400" />
              Banka Bilgileri
            </h2>
            <InfoRow icon={<Landmark size={14} />} label="Banka" value={tedarikci.bankaBilgileri?.banka} />
            <InfoRow icon={<Banknote size={14} />} label="IBAN" value={tedarikci.bankaBilgileri?.iban} />
            <InfoRow label="Şube" value={tedarikci.bankaBilgileri?.sube} />
            <InfoRow label="Hesap No" value={tedarikci.bankaBilgileri?.hesapNo} />
            <InfoRow label="Para Birimi" value={tedarikci.bankaBilgileri?.paraBirimi} />
          </div>

          {/* Açıklama */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <BadgeInfo size={16} className="text-blue-400" />
              Açıklama
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {tedarikci.aciklama || "Açıklama bulunmuyor."}
            </p>
          </div>
        </div>
      )}

      {activeTab === "urunler" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">Bu tedarikçiden temin edilen ürünler ({urunler.length})</p>
          {urunler.length === 0 ? (
            <p className="text-sm text-zinc-500">Henüz ürün temin edilmemiş.</p>
          ) : (
            <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 overflow-hidden">
              {urunler.map((u: any) => (
                <div key={u._id} className="flex items-center gap-4 px-4 py-3.5 bg-zinc-900">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {u.gorsel?.url ? (
                      <img src={u.gorsel.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package size={18} className="text-zinc-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{u.urunAdi}</p>
                    <p className="text-xs text-zinc-500">{u.birim || "—"}</p>
                  </div>
                  <span className="text-xs text-zinc-400">{u.stok || 0} stok</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "siparisler" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">Toplam {siparisler.length} sipariş</p>
          {siparisler.length === 0 ? (
            <p className="text-sm text-zinc-500">Henüz sipariş bulunmuyor.</p>
          ) : (
            <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 overflow-hidden">
              {siparisler.map((s: any) => {
                const DurumIcon = durumIcons[s.durum];
                return (
                  <Link
                    key={s._id}
                    href={`/dashboard/tedarikci/siparis/${s._id}`}
                    className="flex items-center gap-4 px-4 py-3.5 bg-zinc-900 hover:bg-zinc-800/60 transition-colors group"
                  >
                    <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">#{s.siparisNo}</p>
                      <p className="text-xs text-zinc-400 self-center">{s.urunler.length} ürün</p>
                      <p className="text-xs text-zinc-400 self-center">{formatDate(s.siparisTarihi)}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium self-center justify-end ${durumRenk[s.durum]}`}>
                        <DurumIcon size={10} />
                        {durumLabels[s.durum]}
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600 shrink-0 group-hover:text-zinc-400 transition-colors" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "belgeler" && (
        <BelgeUploadForm tedarikciId={id} belgeler={tedarikci.tedarikciBelgeleri || []} />
      )}

      {/* Son Aktiviteler */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Activity size={18} className="text-blue-400" />
          Son Aktiviteler
        </h2>
        {aktiviteler.length === 0 ? (
          <p className="text-sm text-zinc-500">Henüz aktivite kaydı bulunmuyor.</p>
        ) : (
          <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 overflow-hidden">
            {aktiviteler.map((a: any) => (
              <div key={a._id} className="flex items-center gap-3 px-4 py-3 bg-zinc-900">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                  <Activity size={14} className="text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300">
                    <span className="text-white font-medium">{a.kullaniciId?.adSoyad || "Bilinmeyen"}</span>
                    {" "}{islemAciklama(a.islem, a.koleksiyon)}
                  </p>
                  <p className="text-xs text-zinc-500">{formatDateTime(a.tarih)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      {icon && <span className="text-zinc-500 shrink-0 mt-0.5">{icon}</span>}
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-sm text-white">{value || "—"}</p>
      </div>
    </div>
  );
}

function islemAciklama(islem: string, koleksiyon: string): string {
  if (koleksiyon === "tedarikciler") {
    if (islem === "ekle") return "tedarikçi oluşturdu";
    if (islem === "guncelle") return "tedarikçiyi güncelledi";
    if (islem === "sil") return "tedarikçiyi sildi";
  }
  if (koleksiyon === "tedarik_siparisleri") {
    if (islem === "ekle") return "sipariş oluşturdu";
    if (islem === "guncelle") return "sipariş durumunu güncelledi";
  }
  return `${islem} (${koleksiyon})`;
}
