"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUyeAuth } from "@/contexts/uye-auth-context";
import { checkoutAction } from "@/features/siparis/public-actions";
import { getUyeProfileAction } from "@/features/uye/actions";
import { AuthGateModal } from "@/components/AuthGateModal";

export interface CheckoutItem {
  urunId: string;
  adet: number;
  urunAdi: string;
  kapakResmi: string;
  fiyat: number;
}

interface UseCheckoutOptions {
  items: CheckoutItem[];
  isCartCheckout?: boolean;
  onSuccess?: (siparisNo: string) => void;
}

export function useCheckout({ items, isCartCheckout, onSuccess }: UseCheckoutOptions) {
  const router = useRouter();
  const { uye } = useUyeAuth();
  const [step, setStep] = useState<"loading" | "gate" | "form">(
    uye ? "loading" : "loading"
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  // Form state
  const [adSoyad, setAdSoyad] = useState(uye ? `${uye.ad} ${uye.soyad}` : "");
  const [eposta, setEposta] = useState(uye ? uye.eposta : "");
  const [telefon, setTelefon] = useState("");
  const [teslimatAdresi, setTeslimatAdresi] = useState("");
  const [faturaAdresi, setFaturaAdresi] = useState("");
  const [faturaAyni, setFaturaAyni] = useState(true);
  const [kaydetAdres, setKaydetAdres] = useState(true);

  // Ödeme state
  const [odemeYontemi, setOdemeYontemi] = useState<"pesin" | "taksit">("pesin");
  const [taksitSayisi, setTaksitSayisi] = useState(2);

  // Profilden bilgileri getir
  useEffect(() => {
    if (uye) {
      setAdSoyad(`${uye.ad} ${uye.soyad}`);
      setEposta(uye.eposta);
      getUyeProfileAction(uye.id).then((profil) => {
        if (profil) {
          if (profil.cepTelefonu) setTelefon(profil.cepTelefonu);
          if (profil.adres) setTeslimatAdresi(profil.adres);
        }
        setStep("form");
      });
    } else {
      setStep("gate");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uye?.id]);

  const handleSubmit = useCallback(async () => {
    if (!items.length) return;
    if (!teslimatAdresi.trim()) {
      setError("Teslimat adresi zorunludur");
      return;
    }
    setError("");
    setSubmitting(true);

    const res = await checkoutAction({
      uyeId: uye?.id,
      adSoyad,
      eposta,
      telefon,
      teslimatAdresi,
      faturaAdresi: faturaAyni ? teslimatAdresi : faturaAdresi,
      urunler: items,
      kaydetAdres: uye ? kaydetAdres : undefined,
      odemeYontemi,
      taksitSayisi: odemeYontemi === "taksit" ? taksitSayisi : undefined,
    });

    setSubmitting(false);

    if (!res.success) {
      setError(res.error || "Bir hata oluştu");
      return;
    }

    onSuccess?.(res.siparisNo!);
    router.push(`/sepet/siparis-onay?siparisNo=${res.siparisNo}`);
  }, [items, uye, adSoyad, eposta, telefon, teslimatAdresi, faturaAyni, faturaAdresi, kaydetAdres, odemeYontemi, taksitSayisi, router, onSuccess]);

  const renderAuthGate = useCallback(
    (guestNote?: string) => {
      if (step !== "gate") return null;
      return (
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="text-xl font-semibold text-white mb-4">
            {isCartCheckout ? "Siparişi Tamamla" : "Hızlı Satın Al"}
          </h1>
          <p className="text-zinc-400 mb-6">
            {guestNote || "Devam etmek için giriş yapın veya misafir olarak devam edin."}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setGateOpen(true)}
              className="block w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition"
            >
              Üye Girişi Yap
            </button>
            <button
              onClick={() => setStep("form")}
              className="block w-full rounded-lg border border-zinc-600 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition"
            >
              Misafir Olarak Devam Et
            </button>
          </div>

          <AuthGateModal
            open={gateOpen}
            onClose={() => setGateOpen(false)}
            type="sepet"
            onGuestContinue={() => {
              setGateOpen(false);
              setStep("form");
            }}
            onSuccess={() => {
              setGateOpen(false);
              setStep("form");
            }}
          />
        </div>
      );
    },
    [step, isCartCheckout, gateOpen]
  );

  const toplamTutar = items.reduce((t, u) => t + u.fiyat * u.adet, 0);

  return {
    step,
    error,
    submitting,
    setStep,
    adSoyad, setAdSoyad,
    eposta, setEposta,
    telefon, setTelefon,
    teslimatAdresi, setTeslimatAdresi,
    faturaAdresi, setFaturaAdresi,
    faturaAyni, setFaturaAyni,
    kaydetAdres, setKaydetAdres,
    odemeYontemi, setOdemeYontemi,
    taksitSayisi, setTaksitSayisi,
    handleSubmit,
    renderAuthGate,
    toplamTutar,
    items,
  };
}
