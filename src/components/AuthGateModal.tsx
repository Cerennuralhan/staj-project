"use client";

import { useState, useEffect } from "react";
import { useUyeAuth } from "@/contexts/uye-auth-context";
import { uyeGirisAction } from "@/features/uye/actions";
import { favoriEkleAction } from "@/features/favori/public-actions";
import { sepetBirlestirAction } from "@/features/sepet/public-actions";
import { getMisafirSepetIdFromCookie, clearMisafirSepetIdCookie } from "@/lib/sepet-cookie";
import { X, Heart, ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";

interface Props {
  open: boolean;
  onClose: () => void;
  type?: "favori" | "sepet";
  urunId?: string;
  onSuccess?: () => void;
  onGuestContinue?: () => void; // sepet checkout'ta misafir olarak devam et
}

export function AuthGateModal({ open, onClose, type = "favori", urunId, onSuccess, onGuestContinue }: Props) {
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useUyeAuth();

  useEffect(() => {
    if (open) { setEposta(""); setSifre(""); setError(""); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const title = type === "sepet" ? "Sepete devam et" : "Favorilere ekle";
  const Icon = type === "sepet" ? ShoppingBag : Heart;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData();
    fd.set("eposta", eposta);
    fd.set("sifre", sifre);
    const res = await uyeGirisAction(fd);
    setLoading(false);
    if (!res.success) return setError(res.error || "Hata");

    setAuth(res.token!, res.uye!);

    // Misafir sepeti varsa birleştir
    const misafirId = getMisafirSepetIdFromCookie();
    if (misafirId) {
      await sepetBirlestirAction(misafirId, res.uye!.id);
      clearMisafirSepetIdCookie();
    }

    // Ürün belirtilmişse otomatik favoriye ekle
    if (type === "favori" && urunId) {
      await favoriEkleAction(res.uye!.id, urunId);
    }

    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="relative w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-8">
        <button onClick={onClose} className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex justify-center mb-4 text-blue-400">
          <Icon size={36} />
        </div>
        <h2 className="text-center text-lg font-semibold text-white mb-6">{title}</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email" required placeholder="E-posta" value={eposta}
              onChange={(e) => setEposta(e.target.value)}
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <input
              type="password" required placeholder="Şifre" value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            GİRİŞ YAP
          </button>

          {onGuestContinue && (
            <button type="button" onClick={onGuestContinue}
              className="block w-full text-center text-xs text-zinc-500 hover:text-zinc-300 underline"
            >
              Misafir olarak devam et
            </button>
          )}

          <p className="text-center text-sm text-zinc-500">
            Üye değil misin?{" "}
            <Link href="/hesap?tab=kayit" onClick={onClose}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Üye Ol
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
