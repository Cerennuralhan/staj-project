"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUyeAuth } from "@/contexts/uye-auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { sepetUrunEkleAction } from "@/features/sepet/public-actions";
import { getOrCreateMisafirSepetId } from "@/lib/sepet-cookie";
import { AuthGateModal } from "@/components/AuthGateModal";
import { ShoppingBag, Zap, Minus, Plus, Loader2, Check } from "lucide-react";

interface Props {
  urunId: string;
  urunAdi: string;
  kapakResmi: string;
  fiyat: number;
  stok: number;
}

export function UrunDetayActions({ urunId, urunAdi, kapakResmi, fiyat, stok }: Props) {
  const router = useRouter();
  const { uye } = useUyeAuth();
  const queryClient = useQueryClient();
  const [adet, setAdet] = useState(1);
  const [sepeteLoading, setSepeteLoading] = useState(false);
  const [sepeteBasarili, setSepeteBasarili] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const stoktaYok = stok <= 0;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSepeteEkle = async () => {
    if (stoktaYok) return;
    setSepeteLoading(true);
    const misafirId = getOrCreateMisafirSepetId();
    const res = await sepetUrunEkleAction(
      urunId,
      adet,
      uye?.id,
      uye ? undefined : misafirId
    );
    setSepeteLoading(false);
    if (res.success) {
      queryClient.invalidateQueries({ queryKey: ["sepet"] });
      setSepeteBasarili(true);
      setTimeout(() => setSepeteBasarili(false), 2000);
      showToast(`${urunAdi} sepete eklendi`);
    }
  };

  const handleSatinal = () => {
    if (stoktaYok) return;
    if (!uye) {
      setGateOpen(true);
      return;
    }
    router.push(`/hizli-satin-al?urunId=${urunId}&adet=${adet}`);
  };

  const handleGateSuccess = () => {
    setGateOpen(false);
    router.push(`/hizli-satin-al?urunId=${urunId}&adet=${adet}`);
  };

  const azalt = () => setAdet((a) => Math.max(1, a - 1));
  const artir = () => setAdet((a) => Math.min(stok, a + 1));

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-[200] rounded-lg bg-accent-light border border-accent px-4 py-2.5 text-sm text-accent shadow-2xl animate-slide-up flex items-center gap-2">
          <Check size={16} /> {toast}
        </div>
      )}

      <div className="space-y-3">
        {/* Adet seçici */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted font-medium uppercase tracking-wider">
            Adet
          </span>
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={azalt}
              disabled={adet <= 1 || stoktaYok}
              className="px-2.5 py-1.5 text-foreground-secondary hover:text-foreground hover:bg-surface-alt transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus size={16} />
            </button>
            <span className="w-10 text-center text-sm font-semibold text-foreground">
              {adet}
            </span>
            <button
              onClick={artir}
              disabled={adet >= stok || stoktaYok}
              className="px-2.5 py-1.5 text-foreground-secondary hover:text-foreground hover:bg-surface-alt transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
          </div>
          {!stoktaYok && (
            <span className="text-[10px] text-muted-darker">
              Stok: {stok}
            </span>
          )}
        </div>

        {/* Stokta yok etiketi */}
        {stoktaYok ? (
          <div className="flex items-center gap-2 rounded-lg bg-red-900/20 border border-red-800 px-4 py-2.5 text-sm text-red-300 font-medium">
            <ShoppingBag size={16} /> Stokta Yok
          </div>
        ) : (
          <div className="flex gap-3">
            {/* Sepete Ekle */}
            <button
              onClick={handleSepeteEkle}
              disabled={sepeteLoading || stoktaYok}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-semibold transition ${
                sepeteBasarili
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-primary text-primary hover:bg-primary-light hover:border-primary-hover"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {sepeteLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : sepeteBasarili ? (
                <Check size={18} />
              ) : (
                <ShoppingBag size={18} />
              )}
              {sepeteBasarili ? "EKLENDİ" : "Sepete Ekle"}
            </button>

            {/* Satın Al */}
            <button
              onClick={handleSatinal}
              disabled={stoktaYok}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap size={18} /> Satın Al
            </button>
          </div>
        )}
      </div>

      {gateOpen && (
        <AuthGateModal
          open={gateOpen}
          onClose={() => setGateOpen(false)}
          type="sepet"
          onSuccess={handleGateSuccess}
        />
      )}
    </>
  );
}
