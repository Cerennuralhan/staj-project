"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchProductsAction } from "@/features/urun/public-actions";
import Link from "next/link";
import { X, Search, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["arama", debounced],
    queryFn: () => searchProductsAction(debounced),
    enabled: debounced.trim().length > 0,
  });

  // Escape tuşu
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Açılınca input'a odaklan
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Kapandığında state sıfırla
  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebounced("");
    }
  }, [open]);

  if (!open) return null;

  const hasQuery = query.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl px-4 pt-20">
        {/* Input satırı */}
        <div className="flex items-center gap-3 border-b-2 border-primary pb-2">
          <Search size={24} className="text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ürün ara..."
            className="flex-1 bg-transparent text-2xl text-white placeholder-zinc-400 outline-none"
          />
          {isFetching && <Loader2 size={22} className="text-primary animate-spin shrink-0" />}
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors shrink-0">
            <X size={28} />
          </button>
        </div>

        {/* Sonuçlar */}
        {hasQuery && (
          <div className="mt-6 space-y-3 max-h-[60vh] overflow-y-auto">
            {results.length === 0 && !isFetching && (
              <p className="text-zinc-400 text-center py-10">Sonuç bulunamadı.</p>
            )}
            {results.map((p: any) => (
              <Link
                key={p._id}
                href={`/urunler/${p._id}`}
                onClick={onClose}
                className="flex items-center gap-4 p-3 rounded-lg bg-surface-alt hover:bg-card transition"
              >
                {p.kapakResmi && (
                  <img src={p.kapakResmi} alt="" className="w-14 h-14 rounded object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium truncate">{p.urunAdi}</p>
                  <p className="text-sm text-primary">{p.fiyat} TL</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Boşken güven şeridi */}
        {!hasQuery && (
          <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { label: "Ücretsiz Kargo", desc: "2500 TL üzeri" },
              { label: "Kolay İade", desc: "30 gün içinde" },
              { label: "Garanti", desc: "2 yıl garantili" },
              { label: "Güvenli Ödeme", desc: "SSL sertifikası" },
              { label: "7/24 Destek", desc: "Canlı destek" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
