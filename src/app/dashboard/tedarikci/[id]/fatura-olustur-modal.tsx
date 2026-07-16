"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFaturaAction } from "@/features/fatura/actions";
import { Plus, Trash2, X, Loader2 } from "lucide-react";

interface KalemSatir {
  urunAdi: string;
  adet: number;
  birimFiyat: number;
  kdvOrani: number;
}

const KDV_ORANLARI = [0, 1, 10, 20];
const ODEME_SECENEKLERI = ["Nakit", "Havale/EFT", "Çek", "Kredi Kartı", "Banka Kartı", "Açık Hesap"];

function toKurus(tl: number): number {
  return Math.round(tl * 100);
}

function tlFromKurus(k: number): number {
  return k / 100;
}

function calcKalem(adet: number, birimFiyat: number, kdvOrani: number) {
  const araToplamKurus = toKurus(birimFiyat) * adet;
  const kdvTutariKurus = Math.round(araToplamKurus * kdvOrani / 100);
  return {
    araToplam: tlFromKurus(araToplamKurus),
    kdvTutari: tlFromKurus(kdvTutariKurus),
  };
}

function formatCur(amount: number): string {
  return `₺${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface Props {
  tedarikciId: string;
  onClose: () => void;
}

export function FaturaOlusturModal({ tedarikciId, onClose }: Props) {
  const [kalemler, setKalemler] = useState<KalemSatir[]>([
    { urunAdi: "", adet: 1, birimFiyat: 0, kdvOrani: 20 },
  ]);
  const [odemeSekli, setOdemeSekli] = useState("Havale/EFT");
  const [vadeTarihi, setVadeTarihi] = useState("");
  const [teslimatNotu, setTeslimatNotu] = useState("");
  const [error, setError] = useState("");

  const queryClient = useQueryClient();

  const createMut = useMutation({
    mutationFn: () => createFaturaAction({
      tedarikciId,
      kalemler: kalemler.map((k) => ({
        urunAdi: k.urunAdi,
        adet: k.adet,
        birimFiyat: k.birimFiyat,
        kdvOrani: k.kdvOrani,
      })),
      odemeSekli,
      vadeTarihi: vadeTarihi || undefined,
      teslimatNotu,
    }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["tedarikci-faturalar"] });
        onClose();
      } else {
        setError(res.error || "Bir hata oluştu");
      }
    },
  });

  function kalemDegistir(idx: number, field: keyof KalemSatir, value: string | number) {
    setKalemler((prev) => {
      const yeni = [...prev];
      yeni[idx] = { ...yeni[idx], [field]: value };
      return yeni;
    });
  }

  function kalemSil(idx: number) {
    setKalemler((prev) => prev.filter((_, i) => i !== idx));
  }

  function kalemEkle() {
    setKalemler((prev) => [...prev, { urunAdi: "", adet: 1, birimFiyat: 0, kdvOrani: 20 }]);
  }

  /* Hesaplamalar */
  let genelAraToplam = 0;
  let genelKdvTutari = 0;
  const kalemHesaplari = kalemler.map((k) => {
    const { araToplam, kdvTutari } = calcKalem(k.adet, k.birimFiyat, k.kdvOrani);
    genelAraToplam += araToplam;
    genelKdvTutari += kdvTutari;
    return { araToplam, kdvTutari };
  });
  const genelToplam = genelAraToplam + genelKdvTutari;

  const gecerli = kalemler.some((k) => k.urunAdi.trim() && k.adet > 0 && k.birimFiyat >= 0);
  const gonderiliyor = createMut.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/60 pt-10 pb-10" onClick={onClose}>
      <div
        className="w-full max-w-3xl rounded-xl border border-zinc-800 bg-zinc-900 p-6 m-4 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Fatura Oluştur</h2>
          <button onClick={onClose} className="p-1.5 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition">
            <X size={18} />
          </button>
        </div>

        {/* Kalemler */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-400">Fatura Kalemleri</h3>

          {kalemler.map((k, i) => {
            const h = kalemHesaplari[i];
            return (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <div className="flex-1 grid grid-cols-12 gap-2">
                  <input
                    value={k.urunAdi}
                    onChange={(e) => kalemDegistir(i, "urunAdi", e.target.value)}
                    placeholder="Ürün Adı"
                    className="col-span-4 p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none"
                  />
                  <input
                    type="number"
                    value={k.adet || ""}
                    onChange={(e) => kalemDegistir(i, "adet", Math.max(1, parseInt(e.target.value) || 1))}
                    placeholder="Adet"
                    min={1}
                    className="col-span-2 p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none"
                  />
                  <input
                    type="number"
                    value={k.birimFiyat || ""}
                    onChange={(e) => kalemDegistir(i, "birimFiyat", Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="Birim Fiyat"
                    min={0}
                    step="0.01"
                    className="col-span-2 p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none"
                  />
                  <select
                    value={k.kdvOrani}
                    onChange={(e) => kalemDegistir(i, "kdvOrani", parseInt(e.target.value))}
                    className="col-span-1 p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none"
                  >
                    {KDV_ORANLARI.map((o) => (
                      <option key={o} value={o}>%{o}</option>
                    ))}
                  </select>
                  <div className="col-span-2 flex flex-col justify-center text-right">
                    <p className="text-xs text-zinc-400">{formatCur(h.araToplam)}</p>
                    <p className="text-[10px] text-zinc-500">KDV: {formatCur(h.kdvTutari)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => kalemSil(i)}
                  disabled={kalemler.length <= 1}
                  className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-900/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={kalemEkle}
            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
          >
            <Plus size={14} /> Kalem Ekle
          </button>
        </div>

        {/* Ödeme ve Vade Bilgileri */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500">Ödeme Şekli</label>
            <select
              value={odemeSekli}
              onChange={(e) => setOdemeSekli(e.target.value)}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none"
            >
              {ODEME_SECENEKLERI.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500">Vade Tarihi</label>
            <input
              type="date"
              value={vadeTarihi}
              onChange={(e) => setVadeTarihi(e.target.value)}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Teslimat Notu */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-500">Teslimat Notu</label>
          <textarea
            value={teslimatNotu}
            onChange={(e) => setTeslimatNotu(e.target.value)}
            rows={2}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none resize-none"
          />
        </div>

        {/* Hesaplama Özeti */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Ara Toplam</span>
            <span className="text-white">{formatCur(genelAraToplam)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Toplam KDV</span>
            <span className="text-white">{formatCur(genelKdvTutari)}</span>
          </div>
          <div className="border-t border-zinc-800 pt-1.5 flex items-center justify-between">
            <span className="text-base font-bold text-blue-400">Genel Toplam</span>
            <span className="text-base font-bold text-blue-400">{formatCur(genelToplam)}</span>
          </div>
        </div>

        {/* Hata */}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {/* Butonlar */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-sm transition"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={() => { setError(""); createMut.mutate(); }}
            disabled={!gecerli || gonderiliyor}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition disabled:opacity-50"
          >
            {gonderiliyor && <Loader2 size={15} className="animate-spin" />}
            {gonderiliyor ? "Oluşturuluyor..." : "Faturayı Oluştur"}
          </button>
        </div>
      </div>
    </div>
  );
}
