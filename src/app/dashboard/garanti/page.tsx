"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Popover from "@radix-ui/react-popover";
import { Search, X, ChevronDown, Calendar, Loader2, FileDown } from "lucide-react";
import {
  getGarantiListAction, getGarantiByIdAction, getYaklasanGarantiListAction,
  createGarantiTalebiAction, updateGarantiTalebiDurumAction, updateGarantiTalebiAction,
  getAcilTaleplerSayisiAction,
  getMusteriListMinAction,
  getUrunListMinAction,
  getKategoriListMinAction,
} from "@/features/garanti/actions";

async function downloadPdf(id: string) {
  try {
    const res = await fetch(`/api/warranty/${id}/pdf`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Bilinmeyen hata" }));
      alert(`PDF indirilemedi: ${err.error || res.statusText}`);
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `garanti-belgesi-${id.slice(-6)}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    alert("PDF indirilirken bir hata oluştu.");
  }
}

const talepRenk: Record<string, string> = { acik: "text-red-400", inceleniyor: "text-yellow-400", cozuldu: "text-green-400" };
const talepLabels: Record<string, string> = { acik: "Açık", inceleniyor: "İnceleniyor", cozuldu: "Çözüldü" };
const cozumLabels: Record<string, string> = { urun_incelendi: "Ürün İncelendi", kullanici_hatasi: "Kullanıcı Hatası" };

const steps = ["acik", "inceleniyor", "cozuldu"];

function ProgressBar({ durum }: { durum: string }) {
  const idx = steps.indexOf(durum);
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i <= idx;
        return (
          <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
            <div className={`w-2.5 h-2.5 rounded-full ${done ? "bg-blue-500" : "bg-zinc-700"}`} />
            <span className={`text-[10px] leading-tight ${done ? "text-blue-400" : "text-zinc-600"}`}>
              {talepLabels[s]}
            </span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${done && i < idx ? "bg-blue-500" : "bg-zinc-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function GarantiDurumEtiketi({ garantiBitis }: { garantiBitis: string }) {
  const now = new Date();
  const bitis = new Date(garantiBitis);
  const kalanGun = Math.ceil((bitis.getTime() - now.getTime()) / 86400000);

  if (kalanGun < 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
        Süresi Doldu · {Math.abs(kalanGun)} gün geçti
      </span>
    );
  }
  if (kalanGun <= 30) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/40 text-yellow-400 border border-yellow-700">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        Yaklaşan · {kalanGun} gün kaldı
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      Aktif · {kalanGun} gün kaldı
    </span>
  );
}

function TalepKarti({
  talep,
  garantiId,
  garantiAktif,
}: {
  talep: any;
  garantiId: string;
  garantiAktif: boolean;
}) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(talep.aciklama);
  const printRef = useRef<HTMLDivElement>(null);

  const durumMut = useMutation({
    mutationFn: (args: { durum: string; cozumTuru?: string }) =>
      updateGarantiTalebiDurumAction(talep._id, args.durum as any, args.cozumTuru as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["garanti", garantiId] });
      queryClient.invalidateQueries({ queryKey: ["garantiler"] });
      queryClient.invalidateQueries({ queryKey: ["acil-talepler"] });
    },
  });

  const editMut = useMutation({
    mutationFn: () => updateGarantiTalebiAction(talep._id, { aciklama: editText }),
    onSuccess: (r) => {
      if (r.success) {
        setEditing(false);
        queryClient.invalidateQueries({ queryKey: ["garanti", garantiId] });
        queryClient.invalidateQueries({ queryKey: ["garantiler"] });
      }
    },
  });

  return (
    <div className="p-3 rounded border border-zinc-700 text-sm space-y-2.5">
      <ProgressBar durum={talep.durum} />

      {editing ? (
        <div className="flex gap-2">
          <input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="flex-1 p-1.5 rounded bg-zinc-800 border border-zinc-600 text-white text-sm"
          />
          <button onClick={() => editMut.mutate()} className="px-2 py-1 rounded bg-blue-600 text-white text-xs">Kaydet</button>
          <button onClick={() => { setEditing(false); setEditText(talep.aciklama); }} className="px-2 py-1 rounded bg-zinc-700 text-white text-xs">İptal</button>
        </div>
      ) : (
        <p className="text-zinc-300">{talep.aciklama}</p>
      )}

      {expanded && (
        <div ref={printRef} className="space-y-1.5 p-2 rounded bg-zinc-800/50 text-xs text-zinc-400 print:block">
          <p><span className="text-zinc-500">Talep ID:</span> {talep._id}</p>
          <p><span className="text-zinc-500">Oluşturulma:</span> {new Date(talep.createdAt).toLocaleString("tr-TR")}</p>
          <p><span className="text-zinc-500">Son Güncelleme:</span> {new Date(talep.updatedAt).toLocaleString("tr-TR")}</p>
          {talep.durum === "cozuldu" && talep.cozumTuru && (
            <p><span className="text-zinc-500">Çözüm Türü:</span> {cozumLabels[talep.cozumTuru]}</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${talepRenk[talep.durum] ?? ""}`}>{talepLabels[talep.durum]}</span>
          {talep.durum === "cozuldu" && talep.cozumTuru && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {cozumLabels[talep.cozumTuru]}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={() => setExpanded(!expanded)} className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
            {expanded ? "Gizle" : "Detayları Görüntüle"}
          </button>
          {!editing && (
            <button onClick={() => setEditing(true)} className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
              Düzenle
            </button>
          )}
          <button
            onClick={() => downloadPdf(garantiId)}
            className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 hover:bg-zinc-700 print:hidden"
          >
            PDF İndir
          </button>
        </div>
      </div>

      {/* Çözüm butonları — "inceleniyor" ve "acik" durumlarında göster */}
      {talep.durum !== "cozuldu" && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => durumMut.mutate({ durum: "cozuldu", cozumTuru: "urun_incelendi" })}
            disabled={durumMut.isPending}
            className="flex-1 px-3 py-1.5 rounded text-xs font-medium bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white"
          >
            {durumMut.isPending ? "İşleniyor..." : "İncelendi"}
          </button>
          <button
            onClick={() => durumMut.mutate({ durum: "cozuldu", cozumTuru: "kullanici_hatasi" })}
            disabled={durumMut.isPending}
            className="flex-1 px-3 py-1.5 rounded text-xs font-medium bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white"
          >
            {durumMut.isPending ? "İşleniyor..." : "Kullanıcı Hatası"}
          </button>
        </div>
      )}
    </div>
  );
}

function GarantiDetay({ id, onClose }: { id: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: garanti } = useQuery({ queryKey: ["garanti", id], queryFn: () => getGarantiByIdAction(id) });
  const [aciklama, setAciklama] = useState("");

  const talepMut = useMutation({
    mutationFn: () => createGarantiTalebiAction(id, aciklama),
    onSuccess: (r) => {
      if (r.success) { setAciklama(""); queryClient.invalidateQueries({ queryKey: ["garanti", id] }); queryClient.invalidateQueries({ queryKey: ["garantiler"] }); queryClient.invalidateQueries({ queryKey: ["acil-talepler"] }); }
    },
  });

  if (!garanti) return null;

  const isAktif = garanti.durum === "aktif";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/60 overflow-auto">
      <div className="w-full max-w-2xl p-6 rounded-xl border border-zinc-800 bg-zinc-900 space-y-4 m-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Garanti Detay</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadPdf(id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              <FileDown size={14} />
              PDF İndir
            </button>
            <button onClick={onClose} className="text-zinc-400 hover:text-white text-lg">&times;</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <GarantiDurumEtiketi garantiBitis={garanti.garantiBitis} />
        </div>
        <div className="text-sm text-zinc-300 space-y-1">
          <p><span className="text-zinc-500">Ürün:</span> {garanti.urunId?.urunAdi ?? "—"}</p>
          <p><span className="text-zinc-500">Müşteri:</span>{" "}
            {garanti.musteriId?._id ? (
              <Link href={"/dashboard/musteri/" + garanti.musteriId._id} className="text-blue-400 hover:underline cursor-pointer">
                {garanti.musteriId.adSoyad}
              </Link>
            ) : (
              garanti.musteriId?.adSoyad ?? "—"
            )}
          </p>
          <p><span className="text-zinc-500">Seri No:</span> {garanti.seriNo || "—"}</p>
          <p><span className="text-zinc-500">Başlangıç:</span> {new Date(garanti.garantiBaslangic).toLocaleDateString("tr-TR")}</p>
          <p><span className="text-zinc-500">Bitiş:</span> {new Date(garanti.garantiBitis).toLocaleDateString("tr-TR")}</p>
        </div>

        <hr className="border-zinc-700" />
        <h3 className="font-semibold text-white">Garanti Talepleri</h3>

        {(garanti.talepler ?? []).map((t: any) => (
          <TalepKarti key={t._id} talep={t} garantiId={id} garantiAktif={isAktif} />
        ))}

        {isAktif && (
          <div className="flex gap-2">
            <input value={aciklama} onChange={(e) => setAciklama(e.target.value)} placeholder="Yeni talep açıklaması" className="flex-1 p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
            <button onClick={() => talepMut.mutate()} disabled={!aciklama} className="px-3 py-2 rounded bg-blue-600 text-white text-sm">Ekle</button>
          </div>
        )}
      </div>
    </div>
  );
}

function computeGarantiKategori(g: any): "aktif" | "yaklasan" | "suresi_doldu" {
  const bitis = new Date(g.garantiBitis);
  const kalanGun = Math.ceil((bitis.getTime() - Date.now()) / 86400000);
  if (kalanGun < 0) return "suresi_doldu";
  if (kalanGun <= 30) return "yaklasan";
  return "aktif";
}

export default function GarantiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // URL'den filtreleri oku
  const arama = searchParams.get("arama") || "";
  const musteriId = searchParams.get("musteriId") || "";
  const urunId = searchParams.get("urunId") || "";
  const kategoriId = searchParams.get("kategoriId") || "";
  const durumlar = searchParams.get("durum")?.split(",").filter(Boolean) || [];
  const talepler = searchParams.get("talep")?.split(",").filter(Boolean) || [];
  const tarihAraligi = searchParams.get("tarih") || "";

  // Debounce state
  const [aramaDraft, setAramaDraft] = useState(arama);

  useEffect(() => {
    if (aramaDraft === arama) return;
    const timer = setTimeout(() => {
      const sp = new URLSearchParams(searchParams.toString());
      if (aramaDraft) sp.set("arama", aramaDraft);
      else sp.delete("arama");
      router.push(`/dashboard/garanti?${sp.toString()}`);
    }, 400);
    return () => clearTimeout(timer);
  }, [aramaDraft, arama, router, searchParams]);

  const setParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const sp = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) sp.set(key, value);
        else sp.delete(key);
      });
      router.push(`/dashboard/garanti?${sp.toString()}`);
    },
    [router, searchParams],
  );

  const clearFilters = useCallback(() => {
    router.push("/dashboard/garanti");
  }, [router]);

  // Veri sorguları
  const { data: garantiler = [] } = useQuery({ queryKey: ["garantiler"], queryFn: getGarantiListAction });
  const { data: yaklasanGarantiler = [] } = useQuery({ queryKey: ["yaklasan-garantiler"], queryFn: getYaklasanGarantiListAction });
  const { data: acilTalepSayisi = 0 } = useQuery({ queryKey: ["acil-talepler"], queryFn: getAcilTaleplerSayisiAction });

  const { data: musteriList = [] } = useQuery({
    queryKey: ["musteri-list-min"],
    queryFn: getMusteriListMinAction,
  });

  const { data: urunList = [] } = useQuery({
    queryKey: ["urun-list-min"],
    queryFn: getUrunListMinAction,
  });

  const { data: kategoriList = [] } = useQuery({
    queryKey: ["kategori-list-min"],
    queryFn: getKategoriListMinAction,
  });

  const aktifSayisi = garantiler.filter((g: any) => g.durum === "aktif").length;
  const suresiDolanSayisi = garantiler.filter((g: any) => g.durum === "suresi_doldu").length;

  // Filtre uygula
  let filtrelenmis = garantiler;

  if (arama) {
    const q = arama.toLowerCase();
    filtrelenmis = filtrelenmis.filter((g: any) =>
      (g.musteriId?.adSoyad ?? "").toLowerCase().includes(q) ||
      (g.urunId?.urunAdi ?? "").toLowerCase().includes(q),
    );
  }

  if (musteriId) {
    filtrelenmis = filtrelenmis.filter((g: any) => String(g.musteriId?._id) === musteriId);
  }

  if (urunId) {
    filtrelenmis = filtrelenmis.filter((g: any) => String(g.urunId?._id) === urunId);
  }

  if (kategoriId) {
    filtrelenmis = filtrelenmis.filter((g: any) => String(g.urunId?.kategoriId) === kategoriId);
  }

  if (durumlar.length > 0) {
    filtrelenmis = filtrelenmis.filter((g: any) => {
      const kat = computeGarantiKategori(g);
      return durumlar.includes(kat);
    });
  }

  if (talepler.length > 0) {
    filtrelenmis = filtrelenmis.filter((g: any) => {
      const talepDurumlari = new Set((g.talepler ?? []).map((t: any) => t.durum));
      const hasNoTalep = (g.talepler ?? []).length === 0;
      const matches = talepler.some((t: string) => {
        if (t === "yok") return hasNoTalep;
        if (t === "acik") return talepDurumlari.has("acik");
        if (t === "inceleniyor") return talepDurumlari.has("inceleniyor");
        if (t === "cozuldu") return talepDurumlari.has("cozuldu");
        return false;
      });
      return matches;
    });
  }

  if (tarihAraligi) {
    const now = new Date();
    filtrelenmis = filtrelenmis.filter((g: any) => {
      const bitis = new Date(g.garantiBitis);
      const kalanGun = Math.ceil((bitis.getTime() - now.getTime()) / 86400000);
      switch (tarihAraligi) {
        case "30": return kalanGun >= 0 && kalanGun <= 30;
        case "90": return kalanGun >= 0 && kalanGun <= 90;
        case "gecmis": return kalanGun < 0;
        default: return true;
      }
    });
  }

  const aktifFiltreSayisi =
    (arama ? 1 : 0) +
    (musteriId ? 1 : 0) +
    (urunId ? 1 : 0) +
    (kategoriId ? 1 : 0) +
    durumlar.length +
    talepler.length +
    (tarihAraligi ? 1 : 0);

  // Popover panel class
  const panelClass = "min-w-[240px] max-w-[320px] rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-2xl";
  const popoverContent = "z-50";

  // Chip buton stilleri
  const baseChip =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition whitespace-nowrap cursor-pointer select-none";
  const activeChip = "bg-blue-600 border-blue-600 text-white";
  const inactiveChip = "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200";

  // Durum ve talep chip seçenekleri
  const durumOptions = [
    { key: "aktif", label: "Aktif" },
    { key: "yaklasan", label: "Yaklaşan" },
    { key: "suresi_doldu", label: "Süresi Doldu" },
  ];

  const talepOptions = [
    { key: "yok", label: "Talep Yok" },
    { key: "acik", label: "Açık" },
    { key: "inceleniyor", label: "İncelenen" },
    { key: "cozuldu", label: "Çözülen" },
  ];

  const tarihOptions = [
    { key: "", label: "Tümü" },
    { key: "30", label: "Önümüzdeki 30 Gün" },
    { key: "90", label: "Önümüzdeki 90 Gün" },
    { key: "gecmis", label: "Geçmiş Garantiler" },
  ];

  // Müşteri popover arama
  const [musteriArama, setMusteriArama] = useState("");
  const filtrelenmisMusteri = musteriList.filter((m: any) =>
    m.adSoyad.toLowerCase().includes(musteriArama.toLowerCase()),
  );

  // Ürün popover arama
  const [urunArama, setUrunArama] = useState("");
  const seciliKategori = urunId ? "" : kategoriId;
  const filtrelenmisUrun = urunList.filter((u: any) => {
    if (kategoriId && String(u.kategoriId?._id) !== kategoriId) return false;
    return u.urunAdi.toLowerCase().includes(urunArama.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Garantiler</h1>

      {/* Özet kartları */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900">
          <p className="text-2xl font-bold text-white">{garantiler.length}</p>
          <p className="text-xs text-zinc-400">Toplam</p>
        </div>
        <div className="p-4 rounded-xl border border-green-800 bg-green-900/20">
          <p className="text-2xl font-bold text-green-400">{aktifSayisi}</p>
          <p className="text-xs text-green-500">Aktif</p>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900">
          <p className="text-2xl font-bold text-zinc-400">{suresiDolanSayisi}</p>
          <p className="text-xs text-zinc-500">Süresi Doldu</p>
        </div>
        <div className="p-4 rounded-xl border border-red-800 bg-red-900/20">
          <p className="text-2xl font-bold text-red-400">{acilTalepSayisi}</p>
          <p className="text-xs text-red-500">Açık Talepler</p>
        </div>
      </div>

      {/* Yaklaşan Garantiler banner */}
      {yaklasanGarantiler.length > 0 && durumlar.length === 0 && !musteriId && !urunId && !kategoriId && !tarihAraligi && talepler.length === 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-yellow-400">
            ⚠ Yaklaşan Garantiler ({yaklasanGarantiler.length})
          </h2>
          {yaklasanGarantiler.map((g: any) => (
            <div
              key={g._id}
              onClick={() => setSelectedId(g._id)}
              className="p-4 rounded-lg border border-yellow-800 bg-yellow-900/10 cursor-pointer hover:border-yellow-600 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="font-semibold text-white">{g.urunId?.urunAdi ?? "—"}</p>
                  <p className="text-xs text-zinc-400">
                    {g.musteriId?.adSoyad ?? "—"} · Bitiş: {new Date(g.garantiBitis).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <span className="text-sm font-medium text-yellow-400">
                  {g.kalanGun} gün
                </span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Filtre Çubuğu */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide flex-wrap">
        {/* Arama */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            value={aramaDraft}
            onChange={(e) => setAramaDraft(e.target.value)}
            placeholder="Müşteri veya ürün ara..."
            className="w-full pl-8 pr-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-900 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
          />
          {aramaDraft && (
            <button onClick={() => { setAramaDraft(""); setParams({ arama: undefined }); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Müşteri filtresi */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className={`${baseChip} ${musteriId ? activeChip : inactiveChip}`}>
              {musteriId
                ? musteriList.find((m: any) => m._id === musteriId)?.adSoyad || "Müşteri"
                : "Müşteri"}
              <ChevronDown size={12} />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content sideOffset={6} align="start" className={`${panelClass} max-h-72 overflow-y-auto ${popoverContent}`}>
              <div className="relative mb-2">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  value={musteriArama}
                  onChange={(e) => setMusteriArama(e.target.value)}
                  placeholder="Müşteri ara..."
                  className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button onClick={() => { setParams({ musteriId: undefined }); setMusteriArama(""); }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition ${!musteriId ? "bg-blue-600/20 text-blue-400" : "text-zinc-400 hover:bg-zinc-800"}`}>
                Tümü
              </button>
              {filtrelenmisMusteri.map((m: any) => (
                <button key={m._id} onClick={() => { setParams({ musteriId: m._id }); setMusteriArama(""); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition ${musteriId === m._id ? "bg-blue-600/20 text-blue-400" : "text-zinc-300 hover:bg-zinc-800"}`}>
                  {m.adSoyad}
                </button>
              ))}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Ürün/Kategori filtresi */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className={`${baseChip} ${urunId || kategoriId ? activeChip : inactiveChip}`}>
              {urunId
                ? urunList.find((u: any) => u._id === urunId)?.urunAdi || "Ürün"
                : kategoriId
                  ? kategoriList.find((k: any) => k._id === kategoriId)?.kategoriAdi || "Kategori"
                  : "Ürün / Kategori"}
              {(urunId ? 1 : 0) + (kategoriId ? 1 : 0) > 0 && (
                <span className="ml-0.5">({(urunId ? 1 : 0) + (kategoriId ? 1 : 0)})</span>
              )}
              <ChevronDown size={12} />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content sideOffset={6} align="start" className={`${panelClass} max-h-80 overflow-y-auto ${popoverContent}`}>
              {/* Kategori sekmeleri */}
              <div className="flex gap-1 mb-2 flex-wrap">
                <button onClick={() => { setParams({ kategoriId: undefined, urunId: undefined }); }}
                  className={`text-[10px] px-2 py-1 rounded-full border transition ${!kategoriId && !urunId ? "bg-blue-600 border-blue-600 text-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                  Tümü
                </button>
                {kategoriList.map((k: any) => (
                  <button key={k._id} onClick={() => { setParams({ kategoriId: k._id === kategoriId ? undefined : k._id, urunId: undefined }); }}
                    className={`text-[10px] px-2 py-1 rounded-full border transition ${kategoriId === k._id ? "bg-blue-600 border-blue-600 text-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                    {k.kategoriAdi}
                  </button>
                ))}
              </div>
              <hr className="border-zinc-700 mb-2" />
              <div className="relative mb-2">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  value={urunArama}
                  onChange={(e) => setUrunArama(e.target.value)}
                  placeholder="Ürün ara..."
                  className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              {filtrelenmisUrun.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-2">Bu kategoride ürün bulunamadı</p>
              ) : (
                filtrelenmisUrun.map((u: any) => (
                  <button key={u._id} onClick={() => { setParams({ urunId: u._id, kategoriId: undefined }); setUrunArama(""); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition ${urunId === u._id ? "bg-blue-600/20 text-blue-400" : "text-zinc-300 hover:bg-zinc-800"}`}>
                    {u.urunAdi}
                  </button>
                ))
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Garanti Durumu chip'leri */}
        {durumOptions.map((opt) => {
          const aktif = durumlar.includes(opt.key);
          return (
            <button key={opt.key} onClick={() => {
              const yeni = aktif ? durumlar.filter((d) => d !== opt.key) : [...durumlar, opt.key];
              setParams({ durum: yeni.length ? yeni.join(",") : undefined });
            }}
              className={`${baseChip} ${aktif ? "bg-blue-600 border-blue-600 text-white" : inactiveChip}`}>
              {opt.label}
            </button>
          );
        })}

        {/* Talep Durumu chip'leri */}
        {talepOptions.map((opt) => {
          const aktif = talepler.includes(opt.key);
          return (
            <button key={opt.key} onClick={() => {
              const yeni = aktif ? talepler.filter((t) => t !== opt.key) : [...talepler, opt.key];
              setParams({ talep: yeni.length ? yeni.join(",") : undefined });
            }}
              className={`${baseChip} ${aktif ? "bg-blue-600 border-blue-600 text-white" : inactiveChip}`}>
              {opt.label}
            </button>
          );
        })}

        {/* Tarih Aralığı */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className={`${baseChip} ${tarihAraligi ? activeChip : inactiveChip}`}>
              <Calendar size={12} />
              {tarihOptions.find((o) => o.key === tarihAraligi)?.label || "Tarih"}
              <ChevronDown size={12} />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content sideOffset={6} align="start" className={`${panelClass} ${popoverContent}`}>
              {tarihOptions.map((opt) => (
                <button key={opt.key} onClick={() => setParams({ tarih: opt.key || undefined })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${tarihAraligi === opt.key ? "bg-blue-600/20 text-blue-400" : "text-zinc-300 hover:bg-zinc-800"}`}>
                  {opt.label}
                </button>
              ))}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Filtreleri Temizle */}
        {aktifFiltreSayisi > 0 && (
          <button onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-800 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/20 transition whitespace-nowrap shrink-0">
            <X size={14} />
            Temizle
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-800/50 text-[10px] text-red-300">
              {aktifFiltreSayisi}
            </span>
          </button>
        )}
      </div>

      {/* Liste */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {aktifFiltreSayisi > 0 ? `Filtrelenmiş Garantiler (${filtrelenmis.length})` : `Tüm Garantiler (${filtrelenmis.length})`}
          </h2>
        </div>

        <div className="grid gap-3">
          {filtrelenmis.map((g: any) => (
            <div key={g._id}
              className="p-4 rounded-lg border border-zinc-800 bg-zinc-900 transition-colors">
              <div
                onClick={() => setSelectedId(g._id)}
                className="flex justify-between items-center cursor-pointer"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-white">{g.urunId?.urunAdi ?? "—"}</p>
                  <p className="text-xs text-zinc-400">
                    {g.musteriId?.adSoyad ?? "—"} · Bitiş: {new Date(g.garantiBitis).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadPdf(g._id); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors print:hidden"
                  >
                    <FileDown size={14} />
                    PDF İndir
                  </button>
                  <div>
                    <p className={`text-sm font-medium ${g.durum === "aktif" ? "text-green-400" : "text-zinc-500"}`}>
                      {g.durum === "aktif" ? "Aktif" : "Süresi Doldu"}
                    </p>
                    {g.durum === "aktif" && g.kalanGun !== undefined && (
                      <p className={`text-xs ${g.kalanGun <= 30 ? "text-yellow-400" : "text-zinc-500"}`}>
                        {g.kalanGun} gün kaldı
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Talepler alt listesi */}
              {g.talepler && g.talepler.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-zinc-800 pt-3">
                  {g.talepler.map((t: any) => (
                    <TalepKarti key={t._id} talep={t} garantiId={g._id} garantiAktif={g.durum === "aktif"} />
                  ))}
                </div>
              )}
            </div>
          ))}
          {filtrelenmis.length === 0 && <p className="text-zinc-500 text-sm">Kayıt bulunamadı.</p>}
        </div>
      </section>

      {selectedId && <GarantiDetay id={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
