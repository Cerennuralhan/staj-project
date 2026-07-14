"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createSiparisAction } from "@/features/siparis/actions";
import { getMusteriListAction } from "@/features/musteri/actions";
import { getPublicProducts } from "@/features/urun/public-actions";
import { Trash2, Plus } from "lucide-react";

interface SiparisUrunRow {
  urunId: string;
  urunAdi: string;
  kapakResmi: string;
  adet: number;
  fiyat: number;
}

interface ManuelTaksitRow {
  tutar: number;
  vadeTarihi: string;
}

export default function YeniSiparisPage() {
  const router = useRouter();
  const [musteriId, setMusteriId] = useState("");
  const [musteriAdi, setMusteriAdi] = useState("");
  const [musteriAdres, setMusteriAdres] = useState("");
  const [musteriSearch, setMusteriSearch] = useState("");
  const [urunRows, setUrunRows] = useState<SiparisUrunRow[]>([]);
  const [teslimat, setTeslimat] = useState("");
  const [fatura, setFatura] = useState("");
  const [odemeYontemi, setOdemeYontemi] = useState<"pesin" | "taksit" | "senet">("pesin");
  const [taksitSayisi, setTaksitSayisi] = useState(2);
  const [manuelTaksitler, setManuelTaksitler] = useState<ManuelTaksitRow[]>([]);
  const [showMusteriDropdown, setShowMusteriDropdown] = useState(false);

  const { data: musteriArama } = useQuery({
    queryKey: ["musteri-ara", musteriSearch],
    queryFn: () => getMusteriListAction({ search: musteriSearch, limit: 10 }),
    enabled: musteriSearch.length > 0,
  });

  const { data: urunler = [] } = useQuery({
    queryKey: ["urunler-public"],
    queryFn: () => getPublicProducts(),
  });

  const createMut = useMutation({
    mutationFn: () =>
      createSiparisAction({
        musteriId,
        urunler: urunRows,
        dinamikTeslimatAdresi: teslimat,
        dinamikFaturaAdresi: fatura,
        odemeYontemi,
        taksitSayisi: odemeYontemi === "taksit" ? taksitSayisi : undefined,
        manuelTaksitler: odemeYontemi === "senet" ? manuelTaksitler : undefined,
      }),
    onSuccess: (res) => {
      if (res.success) router.push("/dashboard/siparis");
    },
  });

  function manuelEkle() {
    const bugun = new Date().toISOString().slice(0, 10);
    setManuelTaksitler((prev) => [...prev, { tutar: 0, vadeTarihi: bugun }]);
  }

  function manuelSil(idx: number) {
    setManuelTaksitler((prev) => prev.filter((_, i) => i !== idx));
  }

  function manuelGuncelle(idx: number, field: "tutar" | "vadeTarihi", value: string | number) {
    setManuelTaksitler((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  }

  const toplam = urunRows.reduce((t, r) => t + r.fiyat * r.adet, 0);

  function musteriSec(m: any) {
    setMusteriId(m._id);
    setMusteriAdi(m.adSoyad);
    setMusteriAdres(m.adres);
    setTeslimat(m.adres);
    setFatura(m.adres);
    setShowMusteriDropdown(false);
  }

  function urunEkle(urunId: string) {
    const urun = urunler.find((u: any) => u._id === urunId);
    if (!urun || urunRows.some((r) => r.urunId === urunId)) return;
    setUrunRows((prev) => [
      ...prev,
      { urunId: urun._id, urunAdi: urun.urunAdi, kapakResmi: urun.kapakResmi ?? "", adet: 1, fiyat: urun.fiyat },
    ]);
  }

  function urunSil(idx: number) {
    setUrunRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function adetGuncelle(idx: number, adet: number) {
    setUrunRows((prev) => prev.map((r, i) => (i === idx ? { ...r, adet } : r)));
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Yeni Sipariş</h1>

      {/* Müşteri seçimi */}
      <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3">
        <h2 className="text-lg font-semibold text-white">Müşteri</h2>
        {musteriId ? (
          <div className="flex items-center justify-between">
            <p className="text-white">{musteriAdi}</p>
            <button onClick={() => { setMusteriId(""); setMusteriAdi(""); }} className="text-xs text-red-400">Değiştir</button>
          </div>
        ) : (
          <div className="relative">
            <input value={musteriSearch} onChange={(e) => { setMusteriSearch(e.target.value); setShowMusteriDropdown(true); }}
              placeholder="İsim veya telefon ile ara..."
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm outline-none" />
            {showMusteriDropdown && musteriArama?.data && musteriArama.data.length > 0 && (
              <div className="absolute z-10 top-full mt-1 w-full bg-zinc-800 border border-zinc-700 rounded max-h-48 overflow-auto">
                {musteriArama.data.map((m: any) => (
                  <button key={m._id} onClick={() => musteriSec(m)} className="w-full text-left p-2 text-sm text-white hover:bg-zinc-700">{m.adSoyad} — {m.telefon}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ürünler */}
      <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Ürünler</h2>
          <select onChange={(e) => { if (e.target.value) { urunEkle(e.target.value); e.target.value = ""; } }}
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm">
            <option value="">+ Ürün Ekle</option>
            {urunler.map((u: any) => (
              <option key={u._id} value={u._id} disabled={urunRows.some((r) => r.urunId === u._id)}>{u.urunAdi} — {u.fiyat} TL</option>
            ))}
          </select>
        </div>

        {urunRows.length === 0 ? (
          <p className="text-zinc-500 text-sm">Henüz ürün eklenmemiş.</p>
        ) : (
          <div className="space-y-2">
            {urunRows.map((row, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded bg-zinc-800/50">
                {row.kapakResmi && <img src={row.kapakResmi} alt="" className="w-10 h-10 rounded object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{row.urunAdi}</p>
                  <p className="text-xs text-zinc-400">{row.fiyat} TL</p>
                </div>
                <input type="number" value={row.adet} min={1} onChange={(e) => adetGuncelle(i, Number(e.target.value))}
                  className="w-16 p-1 rounded bg-zinc-700 border border-zinc-600 text-white text-sm text-center" />
                <p className="text-sm text-blue-400 w-20 text-right">{row.fiyat * row.adet} TL</p>
                <button onClick={() => urunSil(i)} className="text-red-400 text-xs">×</button>
              </div>
            ))}
            <p className="text-right text-lg font-bold text-blue-400">Toplam: {toplam} TL</p>
          </div>
        )}
      </div>

      {/* Adresler */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-2">
          <h2 className="text-lg font-semibold text-white">Teslimat Adresi</h2>
          <textarea value={teslimat} onChange={(e) => setTeslimat(e.target.value)} rows={3}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm outline-none" />
        </div>
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-2">
          <h2 className="text-lg font-semibold text-white">Fatura Adresi</h2>
          <textarea value={fatura} onChange={(e) => setFatura(e.target.value)} rows={3}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm outline-none" />
        </div>
      </div>

      {/* Ödeme Yöntemi */}
      <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3">
        <h2 className="text-lg font-semibold text-white">Ödeme Yöntemi</h2>
        <div className="flex gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="odeme" value="pesin" checked={odemeYontemi === "pesin"}
              onChange={() => setOdemeYontemi("pesin")} className="accent-blue-500" />
            <span className="text-sm text-white">Peşin</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="odeme" value="taksit" checked={odemeYontemi === "taksit"}
              onChange={() => setOdemeYontemi("taksit")} className="accent-blue-500" />
            <span className="text-sm text-white">Taksitli</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="odeme" value="senet" checked={odemeYontemi === "senet"}
              onChange={() => {
                setOdemeYontemi("senet");
                if (manuelTaksitler.length === 0) {
                  const bugun = new Date().toISOString().slice(0, 10);
                  setManuelTaksitler([{ tutar: toplam, vadeTarihi: bugun }]);
                }
              }} className="accent-blue-500" />
            <span className="text-sm text-white">Senet / Diğer</span>
          </label>
        </div>

        {/* Taksit — otomatik */}
        {odemeYontemi === "taksit" && (
          <div className="flex items-center gap-3">
            <label className="text-xs text-zinc-400">Taksit Sayısı</label>
            <select value={taksitSayisi} onChange={(e) => setTaksitSayisi(Number(e.target.value))}
              className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm">
              {[2, 3, 6, 9, 12].map((n) => (
                <option key={n} value={n}>{n} Ay</option>
              ))}
            </select>
            <span className="text-xs text-zinc-500">
              Aylık {(toplam / taksitSayisi).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} TL
            </span>
          </div>
        )}

        {/* Senet / Manuel — elle girilen taksitler */}
        {odemeYontemi === "senet" && (
          <div className="border-t border-zinc-800 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Taksitler</span>
              <button onClick={manuelEkle} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition cursor-pointer">
                <Plus size={14} /> Satır Ekle
              </button>
            </div>
            {manuelTaksitler.length === 0 ? (
              <p className="text-xs text-zinc-500">Henüz taksit eklenmemiş.</p>
            ) : (
              <div className="space-y-2">
                {manuelTaksitler.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded bg-zinc-800/50">
                    <span className="text-xs text-zinc-500 w-5 shrink-0">{i + 1}</span>
                    <input type="number" value={r.tutar}
                      onChange={(e) => manuelGuncelle(i, "tutar", Number(e.target.value))}
                      placeholder="Tutar"
                      className="w-28 p-1.5 rounded bg-zinc-700 border border-zinc-600 text-white text-xs" />
                    <input type="date" value={r.vadeTarihi}
                      onChange={(e) => manuelGuncelle(i, "vadeTarihi", e.target.value)}
                      className="w-36 p-1.5 rounded bg-zinc-700 border border-zinc-600 text-white text-xs" />
                    <button onClick={() => manuelSil(i)} className="text-red-400 hover:text-red-300 transition cursor-pointer ml-auto">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-zinc-500 text-right">
                  Toplam: {manuelTaksitler.reduce((s, r) => s + r.tutar, 0).toLocaleString("tr-TR")} TL
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <button onClick={() => createMut.mutate()} disabled={!musteriId || urunRows.length === 0 || createMut.isPending}
        className="w-full p-3 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium transition">
        {createMut.isPending ? "Oluşturuluyor..." : "Siparişi Oluştur"}
      </button>
    </div>
  );
}
