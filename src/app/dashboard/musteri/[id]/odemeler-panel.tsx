"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMusteriOdemelerAction } from "@/features/musteri/actions";
import { updateOdemePlaniAction } from "@/features/siparis/actions";
import { toggleTaksitAction } from "@/features/siparis/public-actions";
import Link from "next/link";
import {
  Loader2, CreditCard, CheckCircle2,
  ChevronDown, ChevronRight, Pencil, Plus, Trash2,
} from "lucide-react";
import type { Siparis, Taksit, OdemePlani } from "@/features/siparis/types";

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("tr-TR");
}

function formatCurrency(n: number) {
  return n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

function formatMonth(d: string | Date) {
  return new Date(d).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}

/* ---------------------------------------------------------- */
/*  TaksitToggle — tek taksidin ödendi/bekliyor durumunu değiştirir */
/* ---------------------------------------------------------- */
function TaksitToggle({
  siparisId,
  taksit,
  disabled,
}: {
  siparisId: string;
  taksit: Taksit;
  disabled: boolean;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => toggleTaksitAction(siparisId, taksit.taksitNo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["musteri-odemeler"] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={disabled || mutation.isPending}
      className={`text-xs px-2.5 py-1 rounded font-medium transition cursor-pointer ${
        taksit.odendiMi
          ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
          : "bg-blue-600 hover:bg-blue-500 text-white"
      } disabled:opacity-50`}
    >
      {mutation.isPending ? "..." : taksit.odendiMi ? "Geri Al" : "Ödendi"}
    </button>
  );
}

/* ---------------------------------------------------------- */
/*  OdemePlaniEditModal — modal pencere: taksitleri düzenle   */
/* ---------------------------------------------------------- */
function OdemePlaniEditModal({
  siparis,
  open,
  onClose,
}: {
  siparis: Siparis;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const plan = siparis.odemePlani;
  const [yontem, setYontem] = useState<string>(plan?.yontem || "taksit");
  const [taksitler, setTaksitler] = useState<
    { taksitNo: number; tutar: number; vadeTarihi: string; odendiMi: boolean; odemeTarihi: string | null }[]
  >(
    plan?.taksitler?.map((t) => ({
      ...t,
      vadeTarihi: new Date(t.vadeTarihi).toISOString().slice(0, 10),
    })) || [{ taksitNo: 1, tutar: siparis.toplamTutar, vadeTarihi: new Date().toISOString().slice(0, 10), odendiMi: false, odemeTarihi: null }],
  );

  const updateMut = useMutation({
    mutationFn: () =>
      updateOdemePlaniAction(siparis._id, {
        yontem: yontem as "pesin" | "taksit" | "senet",
        taksitSayisi: taksitler.length,
        taksitTutari: taksitler.length > 0 ? taksitler[0].tutar : 0,
        taksitler,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["musteri-odemeler"] });
      onClose();
    },
  });

  function rowEkle() {
    const maxNo = taksitler.reduce((m, t) => Math.max(m, t.taksitNo), 0);
    setTaksitler((prev) => [
      ...prev,
      { taksitNo: maxNo + 1, tutar: 0, vadeTarihi: new Date().toISOString().slice(0, 10), odendiMi: false, odemeTarihi: null },
    ]);
  }

  function rowSil(idx: number) {
    setTaksitler((prev) => prev.filter((_, i) => i !== idx).map((t, i) => ({ ...t, taksitNo: i + 1 })));
  }

  function rowGuncelle(idx: number, field: string, value: string | boolean | number) {
    setTaksitler((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white">Ödeme Planını Düzenle — #{siparis.siparisNo}</h3>

        {/* Ödeme Türü */}
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Ödeme Türü</label>
          <select value={yontem} onChange={(e) => setYontem(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm">
            <option value="pesin">Peşin</option>
            <option value="taksit">Taksit</option>
            <option value="senet">Senet / Diğer</option>
          </select>
        </div>

        {/* Taksit Tablosu */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Taksitler</span>
            <button onClick={rowEkle} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition cursor-pointer">
              <Plus size={14} /> Taksit Ekle
            </button>
          </div>

          {taksitler.length === 0 ? (
            <p className="text-xs text-zinc-500">Henüz taksit eklenmemiş.</p>
          ) : (
            <div className="space-y-2">
              {taksitler.map((t, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded bg-zinc-800/50">
                  <span className="text-xs text-zinc-500 w-5 shrink-0">{t.taksitNo}</span>
                  <input
                    type="number"
                    value={t.tutar}
                    onChange={(e) => rowGuncelle(i, "tutar", Number(e.target.value))}
                    className="w-28 p-1.5 rounded bg-zinc-700 border border-zinc-600 text-white text-xs"
                    placeholder="Tutar"
                  />
                  <input
                    type="date"
                    value={t.vadeTarihi}
                    onChange={(e) => rowGuncelle(i, "vadeTarihi", e.target.value)}
                    className="w-36 p-1.5 rounded bg-zinc-700 border border-zinc-600 text-white text-xs"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={t.odendiMi}
                      onChange={(e) => rowGuncelle(i, "odendiMi", e.target.checked)}
                      className="accent-blue-500"
                    />
                    Ödendi
                  </label>
                  <button onClick={() => rowSil(i)} className="text-red-400 hover:text-red-300 transition cursor-pointer ml-auto">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Butonlar */}
        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition cursor-pointer">
            İptal
          </button>
          <button
            onClick={() => updateMut.mutate()}
            disabled={updateMut.isPending || taksitler.length === 0}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium transition cursor-pointer"
          >
            {updateMut.isPending ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- */
/*  SiparisSatiri — tek siparişin özet satırı + accordion     */
/* ---------------------------------------------------------- */
function SiparisSatiri({
  siparis,
  onToggleTaksit,
  toggling,
}: {
  siparis: Siparis;
  onToggleTaksit: (siparisId: string, taksitNo: number) => void;
  toggling: boolean;
}) {
  const [acik, setAcik] = useState(false);
  const [editModalAcik, setEditModalAcik] = useState(false);
  const plan = siparis.odemePlani;
  const simdi = Date.now();

  const yontemRenk: Record<string, string> = {
    pesin: "text-green-400 border-green-700/50 bg-green-900/20",
    taksit: "text-purple-400 border-purple-700/50 bg-purple-900/20",
    senet: "text-amber-400 border-amber-700/50 bg-amber-900/20",
  };
  const yontemEtiket: Record<string, string> = {
    pesin: "Peşin",
    taksit: `${plan?.taksitSayisi ?? 0} Taksit`,
    senet: "Senet",
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Özet satırı — tıklanabilir */}
      <button
        onClick={() => setAcik(!acik)}
        className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-zinc-800/40 transition"
      >
        <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 items-center">
          <Link
            href={"/dashboard/siparis/" + siparis._id}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-semibold text-blue-400 hover:underline truncate"
          >
            #{siparis.siparisNo}
          </Link>
          <p className="text-xs text-zinc-500">{formatDate(siparis.siparisTarihi)}</p>
          <p className="text-sm font-semibold text-white">{formatCurrency(siparis.toplamTutar)}</p>
          {plan ? (
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium self-center justify-end ${yontemRenk[plan.yontem] || ""}`}>
              {yontemEtiket[plan.yontem] || plan.yontem}
            </span>
          ) : (
            <span className="text-xs text-zinc-500 text-right self-center">—</span>
          )}
        </div>
        {acik ? <ChevronDown size={16} className="text-zinc-500 shrink-0" /> : <ChevronRight size={16} className="text-zinc-500 shrink-0" />}
      </button>

      {/* Genişletilmiş panel */}
      {acik && (
        <div className="border-t border-zinc-800 px-4 py-4 space-y-4">
          {/* Peşin */}
          {plan && plan.yontem === "pesin" && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle2 size={16} />
              Peşin Ödendi — {formatDate(siparis.siparisTarihi)}
            </div>
          )}

          {/* Taksit / Senet tablosu */}
          {plan && plan.yontem !== "pesin" && plan.taksitler.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="text-left py-1.5 pr-2">#</th>
                    <th className="text-left py-1.5 px-2">Vade</th>
                    <th className="text-right py-1.5 px-2">Tutar</th>
                    <th className="text-center py-1.5 px-2">Durum</th>
                    <th className="text-right py-1.5 pl-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {plan.taksitler.map((t) => {
                    const vadeGecti = !t.odendiMi && new Date(t.vadeTarihi).getTime() < simdi;
                    return (
                      <tr key={t.taksitNo} className={`border-b border-zinc-800/50 ${vadeGecti ? "bg-red-900/15" : ""}`}>
                        <td className="py-2 pr-2 text-zinc-400">{t.taksitNo}</td>
                        <td className="py-2 px-2 text-zinc-300">{formatMonth(t.vadeTarihi)}</td>
                        <td className="py-2 px-2 text-right text-white">{formatCurrency(t.tutar)}</td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {vadeGecti && (
                              <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">Gecikmiş</span>
                            )}
                            {t.odendiMi ? (
                              <span className="text-green-400 font-medium text-xs">
                                Ödendi
                                {t.odemeTarihi && (
                                  <span className="text-zinc-500 ml-1 font-normal">({formatDate(t.odemeTarihi)})</span>
                                )}
                              </span>
                            ) : (
                              <span className="text-yellow-400 font-medium text-xs">Bekliyor</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 pl-2 text-right">
                          <TaksitToggle
                            siparisId={siparis._id}
                            taksit={t}
                            disabled={toggling}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Ödeme planını düzenle butonu */}
          <div className="flex justify-end pt-1">
            <button
              onClick={() => setEditModalAcik(true)}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-blue-400 transition cursor-pointer"
            >
              <Pencil size={13} />
              Ödeme Planını Düzenle
            </button>
          </div>
        </div>
      )}

      {editModalAcik && (
        <OdemePlaniEditModal
          siparis={siparis}
          open={editModalAcik}
          onClose={() => setEditModalAcik(false)}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------- */
/*  OdemelerPanel — ana bileşen                                */
/* ---------------------------------------------------------- */
export function OdemelerPanel({ musteriId }: { musteriId: string }) {
  const queryClient = useQueryClient();

  const { data: siparisler = [], isLoading } = useQuery<Siparis[]>({
    queryKey: ["musteri-odemeler", musteriId],
    queryFn: () => getMusteriOdemelerAction(musteriId),
    enabled: !!musteriId,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ siparisId, taksitNo }: { siparisId: string; taksitNo: number }) =>
      toggleTaksitAction(siparisId, taksitNo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["musteri-odemeler", musteriId] });
    },
  });

  /* Özet hesaplamaları — iptal edilen siparişler hariç */
  const gecerliSiparisler = siparisler.filter((s) => s.durum !== "iptal");
  const toplamBorc = gecerliSiparisler.reduce((sum, s) => sum + (s.toplamTutar || 0), 0);
  const toplamOdenen = gecerliSiparisler.reduce((sum, s) => {
    if (!s.odemePlani?.taksitler) return sum;
    return sum + s.odemePlani.taksitler.filter((t) => t.odendiMi).reduce((a, t) => a + t.tutar, 0);
  }, 0);
  const kalanBakiye = toplamBorc - toplamOdenen;
  const gecikmisSayisi = gecerliSiparisler.reduce((sum, s) => {
    if (!s.odemePlani?.taksitler) return sum;
    return sum + s.odemePlani.taksitler.filter(
      (t) => !t.odendiMi && new Date(t.vadeTarihi).getTime() < Date.now(),
    ).length;
  }, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-zinc-500" size={28} />
      </div>
    );
  }

  if (gecerliSiparisler.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CreditCard size={40} className="text-zinc-600 mb-3" />
        <p className="text-sm text-zinc-500">Henüz ödeme kaydı bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Özet Şeridi */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3.5">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Toplam Borç</p>
          <p className="text-lg font-bold text-white mt-1">{formatCurrency(toplamBorc)}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3.5">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Ödenen Toplam</p>
          <p className="text-lg font-bold text-green-400 mt-1">{formatCurrency(toplamOdenen)}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3.5">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Kalan Bakiye</p>
          <p className={`text-lg font-bold mt-1 ${kalanBakiye > 0 ? "text-yellow-400" : "text-green-400"}`}>
            {kalanBakiye > 0 ? formatCurrency(kalanBakiye) : "—"}
          </p>
        </div>
        <div className={`rounded-xl border p-3.5 ${
          gecikmisSayisi > 0 ? "border-red-800 bg-red-900/20" : "border-zinc-800 bg-zinc-900"
        }`}>
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Gecikmiş Taksit</p>
          <p className={`text-lg font-bold mt-1 ${gecikmisSayisi > 0 ? "text-red-400" : "text-zinc-500"}`}>
            {gecikmisSayisi > 0 ? `${gecikmisSayisi} adet` : "—"}
          </p>
        </div>
      </div>

      {/* Sipariş Satırları */}
      <div className="space-y-2">
        {gecerliSiparisler.map((s) => (
          <SiparisSatiri
            key={s._id}
            siparis={s}
            onToggleTaksit={(siparisId, taksitNo) =>
              toggleMutation.mutate({ siparisId, taksitNo })
            }
            toggling={toggleMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
}
