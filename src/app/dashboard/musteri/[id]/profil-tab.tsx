"use client";

import { useState } from "react";
import type { Musteri } from "@/features/musteri/types";
import { User, Phone, Mail, MapPin, CreditCard, Pencil } from "lucide-react";
import { KisiselBilgilerModal, FaturaAdresiModal, OdemeBilgileriModal } from "./profil-edit-modals";

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      {icon && <span className="text-zinc-500 shrink-0 mt-0.5">{icon}</span>}
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-sm text-white">{value}</p>
      </div>
    </div>
  );
}

function Box({ title, icon, children, onEdit }: { title: string; icon: React.ReactNode; children: React.ReactNode; onEdit?: () => void }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {onEdit && (
          <button onClick={onEdit} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <Pencil size={12} /> Düzenle
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function ProfilTab({ musteri }: { musteri: Musteri }) {
  const [modal, setModal] = useState<"kisisel" | "adres" | "odeme" | null>(null);

  const cinsiyetLabel: Record<string, string> = { erkek: "Erkek", kadin: "Kadın", belirtilmemis: "Belirtilmemiş" };
  const durumLabel: Record<string, string> = { aktif: "Aktif", pasif: "Pasif", askida: "Askıda" };
  const odemeYontemiLabel: Record<string, string> = { havale: "Havale / EFT", kredi_karti: "Kredi Kartı", nakit: "Nakit", cek: "Çek" };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Kişisel Bilgiler */}
      <Box title="Kişisel Bilgiler" icon={<User size={16} className="text-blue-400" />} onEdit={() => setModal("kisisel")}>
        <InfoRow icon={<User size={14} />} label="Ad Soyad" value={musteri.adSoyad} />
        <div className="flex items-start gap-2.5">
          <span className="text-zinc-500 shrink-0 mt-0.5"><Phone size={14} /></span>
          <div>
            <p className="text-xs text-zinc-500">Telefon</p>
            {musteri.telefon ? <a href={`tel:${musteri.telefon}`} className="text-sm text-blue-400 hover:underline">{musteri.telefon}</a> : <p className="text-sm text-zinc-500">—</p>}
          </div>
        </div>
        {musteri.alternatifTelefon && (
          <div className="flex items-start gap-2.5">
            <span className="text-zinc-500 shrink-0 mt-0.5"><Phone size={14} /></span>
            <div>
              <p className="text-xs text-zinc-500">Alternatif Telefon</p>
              <a href={`tel:${musteri.alternatifTelefon}`} className="text-sm text-blue-400 hover:underline">{musteri.alternatifTelefon}</a>
            </div>
          </div>
        )}
        <div className="flex items-start gap-2.5">
          <span className="text-zinc-500 shrink-0 mt-0.5"><Mail size={14} /></span>
          <div>
            <p className="text-xs text-zinc-500">E-posta</p>
            {musteri.eposta ? <a href={`mailto:${musteri.eposta}`} className="text-sm text-blue-400 hover:underline">{musteri.eposta}</a> : <p className="text-sm text-zinc-500">—</p>}
          </div>
        </div>
        {musteri.dogumTarihi && <InfoRow label="Doğum Tarihi" value={new Date(musteri.dogumTarihi).toLocaleDateString("tr-TR")} />}
        {musteri.cinsiyet !== "belirtilmemis" && <InfoRow label="Cinsiyet" value={cinsiyetLabel[musteri.cinsiyet]} />}
        {musteri.uyruk && <InfoRow label="Uyruk" value={musteri.uyruk} />}
        {musteri.tcVergiNo && <InfoRow label="TC / Vergi No" value={musteri.tcVergiNo} />}
        {musteri.musteriDurumu && <InfoRow label="Müşteri Durumu" value={durumLabel[musteri.musteriDurumu] || musteri.musteriDurumu} />}
        {musteri.uyeId && <p className="text-xs text-blue-400">Online üye hesabına bağlı</p>}
      </Box>

      {/* Fatura Adresi */}
      <Box title="Fatura Adresi" icon={<MapPin size={16} className="text-blue-400" />} onEdit={() => setModal("adres")}>
        {musteri.faturaTeslimatAyni ? (
          <p className="text-sm text-zinc-500 italic">Teslimat adresiyle aynı</p>
        ) : (musteri.faturaSokak || musteri.faturaMahalleIlce || musteri.faturaSehir) ? (
          <div className="text-sm text-zinc-300 space-y-1">
            {musteri.faturaSokak && <p>{musteri.faturaSokak}</p>}
            {musteri.faturaMahalleIlce && <p>{musteri.faturaMahalleIlce}</p>}
            {(musteri.faturaSehir || musteri.faturaPostaKodu) && <p>{musteri.faturaSehir} {musteri.faturaPostaKodu}</p>}
            {musteri.faturaUlke && <p>{musteri.faturaUlke}</p>}
          </div>
        ) : musteri.adres ? (
          <p className="text-sm text-zinc-300 whitespace-pre-line">{musteri.adres}</p>
        ) : (
          <p className="text-sm text-zinc-500 italic">Adres belirtilmemiş.</p>
        )}
      </Box>

      {/* Ödeme Bilgileri */}
      <Box title="Ödeme Bilgileri" icon={<CreditCard size={16} className="text-blue-400" />} onEdit={musteri.odemeYontemi || musteri.iban ? () => setModal("odeme") : undefined}>
        {musteri.odemeYontemi || musteri.iban ? (
          <div className="text-sm text-zinc-300 space-y-1">
            {musteri.odemeYontemi && <p>Yöntem: {odemeYontemiLabel[musteri.odemeYontemi] || musteri.odemeYontemi}</p>}
            {musteri.iban && <p className="text-xs text-zinc-400">IBAN: {musteri.iban}</p>}
            {musteri.bankaAdi && <p>Banka: {musteri.bankaAdi}</p>}
            {musteri.hesapSahibi && <p>Hesap Sahibi: {musteri.hesapSahibi}</p>}
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-500 italic">Kayıtlı ödeme yöntemi bulunmuyor.</p>
            <button onClick={() => setModal("odeme")} className="text-xs text-blue-400 hover:text-blue-300 underline">Ödeme bilgisi ekle</button>
          </>
        )}
      </Box>

      {/* Garanti Bilgileri */}
      <Box title="Garanti Bilgileri" icon={<CreditCard size={16} className="text-blue-400" />}>
        <p className="text-sm text-zinc-500 italic">Garanti bilgileri ürün bazında otomatik hesaplanır.</p>
        <p className="text-[11px] text-zinc-600">Detaylı görüntüleme için "Garanti" sekmesine geçin.</p>
      </Box>

      {modal === "kisisel" && <KisiselBilgilerModal musteri={musteri} onClose={() => setModal(null)} />}
      {modal === "adres" && <FaturaAdresiModal musteri={musteri} onClose={() => setModal(null)} />}
      {modal === "odeme" && <OdemeBilgileriModal musteri={musteri} onClose={() => setModal(null)} />}
    </div>
  );
}
