"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  getTedarikciListAction, getTedarikciByIdAction, createTedarikciAction,
  deleteTedarikciAction,
  getTedarikSiparisListAction, createTedarikSiparisAction,
  updateTedarikSiparisDurumAction,
} from "@/features/tedarikci/actions";
import { getPublicProducts } from "@/features/urun/public-actions";
import type { Tedarikci, TedarikSiparis } from "@/features/tedarikci/types";
import {
  Plus, Building2, ChevronRight, Package, Truck, CheckCircle2, Clock,
  ChevronDown, ChevronUp, Landmark,
} from "lucide-react";

const durumRenk: Record<string, string> = {
  beklemede: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  yolda: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  teslim_alindi: "text-green-400 bg-green-400/10 border-green-400/20",
};
const durumLabels: Record<string, string> = {
  beklemede: "Beklemede", yolda: "Yolda", teslim_alindi: "Teslim Alındı",
};
const durumIcons: Record<string, typeof Clock> = {
  beklemede: Clock, yolda: Truck, teslim_alindi: CheckCircle2,
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("tr-TR");
}

/* ---------- Tedarik Siparişi Oluşturma Modalı ---------- */
function TedarikSiparisForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: tedarikciler = [] } = useQuery({
    queryKey: ["tedarikciler"],
    queryFn: () => getTedarikciListAction(),
  });
  const { data: urunler = [] } = useQuery({
    queryKey: ["urunler-public"],
    queryFn: () => getPublicProducts(),
  });

  const [tedarikciId, setTedarikciId] = useState("");
  const [siparisNo, setSiparisNo] = useState("");
  const [tahminTarih, setTahminTarih] = useState("");
  const [urunRows, setUrunRows] = useState<{ urunId: string; urunAdi: string; adet: number }[]>([]);

  const createMut = useMutation({
    mutationFn: () =>
      createTedarikSiparisAction({
        tedarikciId,
        siparisNo,
        durum: "beklemede",
        siparisTarihi: new Date().toISOString(),
        tahminiTeslimatTarihi: tahminTarih || undefined,
        urunler: urunRows,
      }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["tedarik-siparis"] });
        onClose();
      }
    },
  });

  function urunEkle(urunId: string) {
    const u = urunler.find((x: any) => x._id === urunId);
    if (!u || urunRows.some((r) => r.urunId === urunId)) return;
    setUrunRows((prev) => [...prev, { urunId: u._id, urunAdi: u.urunAdi, adet: 1 }]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/60 overflow-auto">
      <div className="w-full max-w-xl p-6 rounded-xl border border-zinc-800 bg-zinc-900 space-y-4 m-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Tedarik Siparişi</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">&times;</button>
        </div>

        <select value={tedarikciId} onChange={(e) => setTedarikciId(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none">
          <option value="">Tedarikçi Seç</option>
          {tedarikciler.map((t: Tedarikci) => (
            <option key={t._id} value={t._id}>{t.firmaAdi}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <input value={siparisNo} onChange={(e) => setSiparisNo(e.target.value)}
            placeholder="Sipariş No"
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
          <input type="date" value={tahminTarih} onChange={(e) => setTahminTarih(e.target.value)}
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
        </div>

        <select onChange={(e) => { if (e.target.value) { urunEkle(e.target.value); e.target.value = ""; } }}
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none">
          <option value="">+ Ürün Ekle</option>
          {urunler.map((u: any) => (
            <option key={u._id} value={u._id}>{u.urunAdi}</option>
          ))}
        </select>

        {urunRows.map((r, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
            <span className="flex-1 truncate">{r.urunAdi}</span>
            <input type="number" value={r.adet} min={1}
              onChange={(e) => setUrunRows((prev) => prev.map((x, j) => j === i ? { ...x, adet: Number(e.target.value) } : x))}
              className="w-16 p-1 rounded bg-zinc-700 text-white text-center" />
            <button onClick={() => setUrunRows((prev) => prev.filter((_, j) => j !== i))}
              className="text-red-400 text-xs hover:text-red-300">×</button>
          </div>
        ))}

        <button onClick={() => createMut.mutate()}
          disabled={!tedarikciId || urunRows.length === 0 || createMut.isPending}
          className="w-full p-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50">
          {createMut.isPending ? "Oluşturuluyor..." : "Oluştur"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Ana Sayfa ---------- */
export default function TedarikciPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showBanka, setShowBanka] = useState(false);
  const defaultForm = {
    firmaAdi: "", telefon: "", eposta: "", logo: "",
    adres: "", vergiNo: "", vergiDairesi: "", mersisNo: "", kurulusYili: "",
    yetkiliKisi: "", calismaSaatleri: "", aciklama: "",
    bankaBilgileri: { banka: "", iban: "", sube: "", hesapNo: "", paraBirimi: "" },
  };
  const [form, setForm] = useState(defaultForm);
  const [showSipForm, setShowSipForm] = useState(false);
  const [sipFilter, setSipFilter] = useState("");

  const { data: tedarikciler = [] } = useQuery({
    queryKey: ["tedarikciler"],
    queryFn: () => getTedarikciListAction(),
  });
  const { data: siparisler = [] } = useQuery({
    queryKey: ["tedarik-siparis"],
    queryFn: () => getTedarikSiparisListAction(),
  });

  const createMut = useMutation({
    mutationFn: () => createTedarikciAction(form),
    onSuccess: (res) => {
      if (res.success) {
        setForm(defaultForm);
        setShowForm(false);
        queryClient.invalidateQueries({ queryKey: ["tedarikciler"] });
      }
    },
  });

  function setBanka(k: string, v: string) {
    setForm((p) => ({ ...p, bankaBilgileri: { ...p.bankaBilgileri, [k]: v } }));
  }

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTedarikciAction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tedarikciler"] }),
  });

  const teslimAlMut = useMutation({
    mutationFn: (id: string) => updateTedarikSiparisDurumAction(id, "teslim_alindi"),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tedarik-siparis"] });
      const prev = queryClient.getQueryData<TedarikSiparis[]>(["tedarik-siparis"]);
      queryClient.setQueryData<TedarikSiparis[]>(["tedarik-siparis"], (old) =>
        old?.map((s) => s._id === id ? { ...s, durum: "teslim_alindi" as const } : s)
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(["tedarik-siparis"], context.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tedarik-siparis"] });
      queryClient.invalidateQueries({ queryKey: ["urunler"] });
    },
  });

  const filteredSip = sipFilter
    ? siparisler.filter((s: TedarikSiparis) => s.durum === sipFilter)
    : siparisler;

  const tedarikciMap = new Map(tedarikciler.map((t: Tedarikci) => [t._id, t]));

  return (
    <div className="space-y-10">
      {/* ÜST BÖLÜM — Tedarikçiler */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 size={22} className="text-blue-400" />
            Tedarikçiler
          </h1>
          <button onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition">
            <Plus size={16} />
            Yeni Tedarikçi
          </button>
        </div>

        {showForm && (
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3">
            <input value={form.firmaAdi}
              onChange={(e) => setForm((p) => ({ ...p, firmaAdi: e.target.value }))}
              placeholder="Firma Adı *"
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.telefon}
                onChange={(e) => setForm((p) => ({ ...p, telefon: e.target.value }))}
                placeholder="Telefon *"
                className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
              <input value={form.eposta}
                onChange={(e) => setForm((p) => ({ ...p, eposta: e.target.value }))}
                placeholder="E-posta *"
                className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
            </div>

            {/* Logo URL */}
            <input value={form.logo}
              onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))}
              placeholder="Logo URL (opsiyonel)"
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />

            {/* Yetkili + Çalışma Saatleri */}
            <div className="grid grid-cols-2 gap-3">
              <input value={form.yetkiliKisi}
                onChange={(e) => setForm((p) => ({ ...p, yetkiliKisi: e.target.value }))}
                placeholder="Yetkili Kişi"
                className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
              <input value={form.calismaSaatleri}
                onChange={(e) => setForm((p) => ({ ...p, calismaSaatleri: e.target.value }))}
                placeholder="Çalışma Saatleri (örn: 09:00-18:00)"
                className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
            </div>

            {/* Adres */}
            <textarea value={form.adres}
              onChange={(e) => setForm((p) => ({ ...p, adres: e.target.value }))}
              placeholder="Adres"
              rows={2}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none resize-none" />

            {/* Vergi / Mersis */}
            <div className="grid grid-cols-2 gap-3">
              <input value={form.vergiNo}
                onChange={(e) => setForm((p) => ({ ...p, vergiNo: e.target.value }))}
                placeholder="Vergi No"
                className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
              <input value={form.vergiDairesi}
                onChange={(e) => setForm((p) => ({ ...p, vergiDairesi: e.target.value }))}
                placeholder="Vergi Dairesi"
                className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.mersisNo}
                onChange={(e) => setForm((p) => ({ ...p, mersisNo: e.target.value }))}
                placeholder="Mersis No"
                className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
              <input value={form.kurulusYili}
                onChange={(e) => setForm((p) => ({ ...p, kurulusYili: e.target.value }))}
                placeholder="Kuruluş Yılı"
                className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
            </div>

            {/* Banka Bilgileri (accordion) */}
            <button type="button" onClick={() => setShowBanka(!showBanka)}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition pt-1">
              <Landmark size={15} />
              Banka Bilgileri
              {showBanka ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {showBanka && (
              <div className="space-y-3 pl-2 border-l-2 border-zinc-800">
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.bankaBilgileri.banka}
                    onChange={(e) => setBanka("banka", e.target.value)}
                    placeholder="Banka Adı"
                    className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
                  <input value={form.bankaBilgileri.paraBirimi}
                    onChange={(e) => setBanka("paraBirimi", e.target.value)}
                    placeholder="Para Birimi (TRY)"
                    className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
                </div>
                <input value={form.bankaBilgileri.iban}
                  onChange={(e) => setBanka("iban", e.target.value)}
                  placeholder="IBAN"
                  className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.bankaBilgileri.sube}
                    onChange={(e) => setBanka("sube", e.target.value)}
                    placeholder="Şube"
                    className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
                  <input value={form.bankaBilgileri.hesapNo}
                    onChange={(e) => setBanka("hesapNo", e.target.value)}
                    placeholder="Hesap No"
                    className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
                </div>
              </div>
            )}

            {/* Açıklama */}
            <textarea value={form.aciklama}
              onChange={(e) => setForm((p) => ({ ...p, aciklama: e.target.value }))}
              placeholder="Açıklama (opsiyonel)"
              rows={3}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none resize-none" />

            <button onClick={() => createMut.mutate()}
              disabled={!form.firmaAdi || createMut.isPending}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:opacity-50">
              {createMut.isPending ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        )}

        <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 overflow-hidden">
          {tedarikciler.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500">Henüz tedarikçi eklenmemiş.</div>
          ) : (
            tedarikciler.map((t: Tedarikci) => (
              <Link
                key={t._id}
                href={`/dashboard/tedarikci/${t._id}`}
                className="flex items-center gap-4 px-4 py-3.5 bg-zinc-900 hover:bg-zinc-800/60 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                  {t.logo ? (
                    <img src={t.logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={18} className="text-zinc-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                    {t.firmaAdi}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">
                    {t.telefon || "—"} · {t.eposta || "—"}
                  </p>
                </div>
                <ChevronRight size={16} className="text-zinc-600 shrink-0 group-hover:text-zinc-400 transition-colors" />
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ALT BÖLÜM — Tedarik Siparişleri */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package size={20} className="text-blue-400" />
            Tedarik Siparişleri
          </h2>
          <button onClick={() => setShowSipForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition">
            <Plus size={16} />
            Yeni Sipariş
          </button>
        </div>

        {/* Filtre sekmeleri */}
        <div className="flex gap-2 flex-wrap">
          {["", "beklemede", "yolda", "teslim_alindi"].map((d) => {
            const Icon = d ? durumIcons[d] : Package;
            return (
              <button
                key={d}
                onClick={() => setSipFilter(d)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition ${
                  sipFilter === d
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                }`}
              >
                <Icon size={12} />
                {d ? durumLabels[d] : "Tümü"}
              </button>
            );
          })}
        </div>

        <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 overflow-hidden">
          {filteredSip.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500">
              {sipFilter ? "Bu durumda sipariş bulunamadı." : "Henüz sipariş bulunmuyor."}
            </div>
          ) : (
            filteredSip.map((s: TedarikSiparis) => {
              const t = tedarikciMap.get(s.tedarikciId.toString());
              const DurumIcon = durumIcons[s.durum];
              return (
                <Link
                  key={s._id}
                  href={`/dashboard/tedarikci/siparis/${s._id}`}
                  className="flex items-center gap-4 px-4 py-3.5 bg-zinc-900 hover:bg-zinc-800/60 transition-colors group"
                >
                  {/* Tedarikçi logosu */}
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {t?.logo ? (
                      <img src={t.logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 size={18} className="text-zinc-500" />
                    )}
                  </div>

                  {/* Sipariş bilgileri */}
                  <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1">
                    <div>
                      <p className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                        #{s.siparisNo}
                      </p>
                      <p className="text-xs text-zinc-500">{s.urunler.length} ürün</p>
                    </div>
                    <p className="text-xs text-zinc-400 self-center">
                      Sipariş: {formatDate(s.siparisTarihi)}
                    </p>
                    <p className="text-xs text-zinc-400 self-center">
                      {s.tahminiTeslimatTarihi
                        ? `Teslim: ${formatDate(s.tahminiTeslimatTarihi)}`
                        : "Teslim tarihi yok"}
                    </p>
                    <div className="flex items-center justify-end gap-2 self-center">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${durumRenk[s.durum]}`}>
                        <DurumIcon size={10} />
                        {durumLabels[s.durum]}
                      </span>
                    </div>
                  </div>

                  {/* Teslim Alındı butonu */}
                  {s.durum !== "teslim_alindi" && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirm("Bu siparişi teslim alındı olarak işaretlemek istediğinize emin misiniz?\nStoklar otomatik artırılacak.")) {
                          teslimAlMut.mutate(s._id);
                        }
                      }}
                      disabled={teslimAlMut.isPending}
                      className="shrink-0 rounded-lg bg-green-700 hover:bg-green-600 px-3 py-1.5 text-[11px] font-semibold text-white transition disabled:opacity-50"
                    >
                      Teslim Alındı
                    </button>
                  )}
                  <ChevronRight size={16} className="text-zinc-600 shrink-0 group-hover:text-zinc-400 transition-colors" />
                </Link>
              );
            })
          )}
        </div>
      </section>

      {showSipForm && <TedarikSiparisForm onClose={() => setShowSipForm(false)} />}
    </div>
  );
}
