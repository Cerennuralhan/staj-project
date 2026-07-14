"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateMusteriAction } from "@/features/musteri/actions";
import type { Musteri } from "@/features/musteri/types";
import { X } from "lucide-react";

function ModalWrapper({
  title,
  onClose,
  onSave,
  isPending,
  isValid,
  error,
  children,
}: {
  title: string;
  onClose: () => void;
  onSave: () => void;
  isPending: boolean;
  isValid: boolean;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 overflow-auto" onClick={onClose}>
      <div className="w-full max-w-lg p-6 rounded-xl border border-zinc-800 bg-zinc-900 space-y-4 m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={20} /></button>
        </div>
        {children}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-sm">İptal</button>
          <button onClick={onSave} disabled={!isValid || isPending}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50">
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}

export function KisiselBilgilerModal({ musteri, onClose }: { musteri: Musteri; onClose: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    adSoyad: musteri.adSoyad,
    telefon: musteri.telefon || "",
    alternatifTelefon: musteri.alternatifTelefon || "",
    eposta: musteri.eposta || "",
    dogumTarihi: musteri.dogumTarihi || "",
    cinsiyet: musteri.cinsiyet || "belirtilmemis",
    uyruk: musteri.uyruk || "",
    tcVergiNo: musteri.tcVergiNo || "",
    musteriDurumu: musteri.musteriDurumu || "aktif",
  });

  const updateMut = useMutation({
    mutationFn: () => updateMusteriAction(musteri._id, form),
    onSuccess: (res) => {
      if (res.success) { queryClient.invalidateQueries({ queryKey: ["musteriler"] }); router.refresh(); onClose(); }
    },
  });

  return (
    <ModalWrapper title="Kişisel Bilgileri Düzenle" onClose={onClose} onSave={() => updateMut.mutate()}
      isPending={updateMut.isPending} isValid={!!form.adSoyad}
      error={updateMut.data && !updateMut.data.success ? String(updateMut.data.error) : null}>
      <div className="grid grid-cols-2 gap-3">
        <input value={form.adSoyad} onChange={(e) => setForm(p => ({ ...p, adSoyad: e.target.value }))}
          placeholder="Ad Soyad *" className="col-span-2 p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
        <input value={form.telefon} onChange={(e) => setForm(p => ({ ...p, telefon: e.target.value }))}
          placeholder="Telefon" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
        <input value={form.alternatifTelefon} onChange={(e) => setForm(p => ({ ...p, alternatifTelefon: e.target.value }))}
          placeholder="Alternatif Telefon" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
        <input value={form.eposta} onChange={(e) => setForm(p => ({ ...p, eposta: e.target.value }))}
          placeholder="E-posta" type="email" className="col-span-2 p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
        <label className="col-span-2 flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Doğum Tarihi</span>
          <input value={form.dogumTarihi ? form.dogumTarihi.slice(0, 10) : ""} onChange={(e) => setForm(p => ({ ...p, dogumTarihi: e.target.value || "" }))}
            type="date" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Cinsiyet</span>
          <select value={form.cinsiyet} onChange={(e) => setForm(p => ({ ...p, cinsiyet: e.target.value as "erkek" | "kadin" | "belirtilmemis" }))}
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none">
            <option value="belirtilmemis">Belirtilmemiş</option>
            <option value="erkek">Erkek</option>
            <option value="kadin">Kadın</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Müşteri Durumu</span>
          <select value={form.musteriDurumu} onChange={(e) => setForm(p => ({ ...p, musteriDurumu: e.target.value as "aktif" | "pasif" | "askida" }))}
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none">
            <option value="aktif">Aktif</option>
            <option value="pasif">Pasif</option>
            <option value="askida">Askıda</option>
          </select>
        </label>
        <input value={form.uyruk} onChange={(e) => setForm(p => ({ ...p, uyruk: e.target.value }))}
          placeholder="Uyruk" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
        <input value={form.tcVergiNo} onChange={(e) => setForm(p => ({ ...p, tcVergiNo: e.target.value }))}
          placeholder="TC / Vergi No" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
      </div>
    </ModalWrapper>
  );
}

export function FaturaAdresiModal({ musteri, onClose }: { musteri: Musteri; onClose: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    faturaSokak: musteri.faturaSokak || "",
    faturaMahalleIlce: musteri.faturaMahalleIlce || "",
    faturaSehir: musteri.faturaSehir || "",
    faturaPostaKodu: musteri.faturaPostaKodu || "",
    faturaUlke: musteri.faturaUlke || "",
    faturaTeslimatAyni: musteri.faturaTeslimatAyni ?? false,
  });

  const updateMut = useMutation({
    mutationFn: () => updateMusteriAction(musteri._id, form),
    onSuccess: (res) => {
      if (res.success) { queryClient.invalidateQueries({ queryKey: ["musteriler"] }); router.refresh(); onClose(); }
    },
  });

  return (
    <ModalWrapper title="Fatura Adresini Düzenle" onClose={onClose} onSave={() => updateMut.mutate()}
      isPending={updateMut.isPending} isValid={true}
      error={updateMut.data && !updateMut.data.success ? String(updateMut.data.error) : null}>
      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.faturaTeslimatAyni}
            onChange={(e) => setForm(p => ({ ...p, faturaTeslimatAyni: e.target.checked }))}
            className="accent-blue-500" />
          <span className="text-sm text-zinc-300">Teslimat adresiyle aynı</span>
        </label>
        <input value={form.faturaSokak} onChange={(e) => setForm(p => ({ ...p, faturaSokak: e.target.value }))}
          placeholder="Sokak / Cadde" className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
        <div className="grid grid-cols-2 gap-3">
          <input value={form.faturaMahalleIlce} onChange={(e) => setForm(p => ({ ...p, faturaMahalleIlce: e.target.value }))}
            placeholder="Mahalle / İlçe" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
          <input value={form.faturaSehir} onChange={(e) => setForm(p => ({ ...p, faturaSehir: e.target.value }))}
            placeholder="Şehir" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input value={form.faturaPostaKodu} onChange={(e) => setForm(p => ({ ...p, faturaPostaKodu: e.target.value }))}
            placeholder="Posta Kodu" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
          <input value={form.faturaUlke} onChange={(e) => setForm(p => ({ ...p, faturaUlke: e.target.value }))}
            placeholder="Ülke" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
        </div>
      </div>
    </ModalWrapper>
  );
}

export function OdemeBilgileriModal({ musteri, onClose }: { musteri: Musteri; onClose: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    odemeYontemi: musteri.odemeYontemi || "",
    iban: musteri.iban || "",
    bankaAdi: musteri.bankaAdi || "",
    hesapSahibi: musteri.hesapSahibi || "",
  });

  const updateMut = useMutation({
    mutationFn: () => updateMusteriAction(musteri._id, form),
    onSuccess: (res) => {
      if (res.success) { queryClient.invalidateQueries({ queryKey: ["musteriler"] }); router.refresh(); onClose(); }
    },
  });

  return (
    <ModalWrapper title="Ödeme Bilgilerini Düzenle" onClose={onClose} onSave={() => updateMut.mutate()}
      isPending={updateMut.isPending} isValid={true}
      error={updateMut.data && !updateMut.data.success ? String(updateMut.data.error) : null}>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 col-span-2">
          <span className="text-xs text-zinc-500">Ödeme Yöntemi</span>
          <select value={form.odemeYontemi} onChange={(e) => setForm(p => ({ ...p, odemeYontemi: e.target.value }))}
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none">
            <option value="">Seçiniz...</option>
            <option value="havale">Havale / EFT</option>
            <option value="kredi_karti">Kredi Kartı</option>
            <option value="nakit">Nakit</option>
            <option value="cek">Çek</option>
          </select>
        </label>
        <input value={form.iban} onChange={(e) => setForm(p => ({ ...p, iban: e.target.value }))}
          placeholder="IBAN" className="col-span-2 p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
        <input value={form.bankaAdi} onChange={(e) => setForm(p => ({ ...p, bankaAdi: e.target.value }))}
          placeholder="Banka Adı" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
        <input value={form.hesapSahibi} onChange={(e) => setForm(p => ({ ...p, hesapSahibi: e.target.value }))}
          placeholder="Hesap Sahibi" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
      </div>
    </ModalWrapper>
  );
}
