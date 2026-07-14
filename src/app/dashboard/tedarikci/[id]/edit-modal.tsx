"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateTedarikciAction } from "@/features/tedarikci/actions";
import type { Tedarikci } from "@/features/tedarikci/types";
import { X, ChevronDown, ChevronUp, Landmark } from "lucide-react";

interface Props {
  tedarikci: Tedarikci;
  onClose: () => void;
}

export function TedarikciEditModal({ tedarikci, onClose }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showBanka, setShowBanka] = useState(false);
  const [form, setForm] = useState({
    firmaAdi: tedarikci.firmaAdi,
    telefon: tedarikci.telefon || "",
    eposta: tedarikci.eposta || "",
    logo: tedarikci.logo || "",
    adres: tedarikci.adres || "",
    vergiNo: tedarikci.vergiNo || "",
    vergiDairesi: tedarikci.vergiDairesi || "",
    mersisNo: tedarikci.mersisNo || "",
    kurulusYili: tedarikci.kurulusYili || "",
    yetkiliKisi: tedarikci.yetkiliKisi || "",
    calismaSaatleri: tedarikci.calismaSaatleri || "",
    aciklama: tedarikci.aciklama || "",
    aktifMi: tedarikci.aktifMi,
    bankaBilgileri: {
      banka: tedarikci.bankaBilgileri?.banka || "",
      iban: tedarikci.bankaBilgileri?.iban || "",
      sube: tedarikci.bankaBilgileri?.sube || "",
      hesapNo: tedarikci.bankaBilgileri?.hesapNo || "",
      paraBirimi: tedarikci.bankaBilgileri?.paraBirimi || "",
    },
  });

  function setBanka(k: string, v: string) {
    setForm((p) => ({ ...p, bankaBilgileri: { ...p.bankaBilgileri, [k]: v } }));
  }

  const updateMut = useMutation({
    mutationFn: () => updateTedarikciAction(tedarikci._id, form),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["tedarikciler"] });
        router.refresh();
        onClose();
      }
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/60 overflow-auto" onClick={onClose}>
      <div className="w-full max-w-2xl p-6 rounded-xl border border-zinc-800 bg-zinc-900 space-y-4 m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Tedarikçi Düzenle</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition"><X size={20} /></button>
        </div>

        {/* Temel Bilgiler */}
        <div className="grid grid-cols-2 gap-3">
          <input value={form.firmaAdi}
            onChange={(e) => setForm((p) => ({ ...p, firmaAdi: e.target.value }))}
            placeholder="Firma Adı *"
            className="col-span-2 p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
          <input value={form.telefon}
            onChange={(e) => setForm((p) => ({ ...p, telefon: e.target.value }))}
            placeholder="Telefon"
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
          <input value={form.eposta}
            onChange={(e) => setForm((p) => ({ ...p, eposta: e.target.value }))}
            placeholder="E-posta"
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
          <input value={form.logo}
            onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))}
            placeholder="Logo URL"
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
          <input value={form.yetkiliKisi}
            onChange={(e) => setForm((p) => ({ ...p, yetkiliKisi: e.target.value }))}
            placeholder="Yetkili Kişi"
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
          <input value={form.calismaSaatleri}
            onChange={(e) => setForm((p) => ({ ...p, calismaSaatleri: e.target.value }))}
            placeholder="Çalışma Saatleri"
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
          <textarea value={form.adres}
            onChange={(e) => setForm((p) => ({ ...p, adres: e.target.value }))}
            placeholder="Adres"
            rows={2}
            className="col-span-2 p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none resize-none" />
          <input value={form.vergiNo}
            onChange={(e) => setForm((p) => ({ ...p, vergiNo: e.target.value }))}
            placeholder="Vergi No"
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
          <input value={form.vergiDairesi}
            onChange={(e) => setForm((p) => ({ ...p, vergiDairesi: e.target.value }))}
            placeholder="Vergi Dairesi"
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
          <input value={form.mersisNo}
            onChange={(e) => setForm((p) => ({ ...p, mersisNo: e.target.value }))}
            placeholder="Mersis No"
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
          <input value={form.kurulusYili}
            onChange={(e) => setForm((p) => ({ ...p, kurulusYili: e.target.value }))}
            placeholder="Kuruluş Yılı"
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
        </div>

        {/* Banka Bilgileri */}
        <button type="button" onClick={() => setShowBanka(!showBanka)}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition">
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
                placeholder="Para Birimi"
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
          placeholder="Açıklama"
          rows={3}
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none resize-none" />

        {/* Butonlar */}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose}
            className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition">
            İptal
          </button>
          <button onClick={() => updateMut.mutate()}
            disabled={!form.firmaAdi || updateMut.isPending}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:opacity-50">
            {updateMut.isPending ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
        {updateMut.data && !updateMut.data.success && (
          <p className="text-xs text-red-400">{updateMut.data.error as string || "Bir hata oluştu"}</p>
        )}
      </div>
    </div>
  );
}
