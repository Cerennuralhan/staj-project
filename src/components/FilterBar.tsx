"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  getKategoriCountsAction,
  getFiyatAraligiAction,
  getRenklerAction,
  getMateryallerAction,
} from "@/features/urun/public-actions";
import { ChevronDown, X } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";

const colorMap: Record<string, string> = {
  Siyah: "#1a1a1a", Beyaz: "#f5f5f5", Gri: "#9ca3af", Bej: "#e8dcc8",
  Lacivert: "#1e3a5f", Mavi: "#3b82f6", "Koyu Yeşil": "#166534",
  Yeşil: "#22c55e", Kahverengi: "#8b5a2b", Bordo: "#7f1d1d",
  Ceviz: "#6b3a2a", Meşe: "#b8926c", Kırmızı: "#dc2626",
};

const sortOptions = [
  { value: "cok_satan", label: "Çok Satanlar" },
  { value: "dusuk_butce", label: "Düşük Bütçe" },
  { value: "populer", label: "Popüler" },
  { value: "kampanyali", label: "Kampanyalı" },
];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const kategori = searchParams.get("kategori") || "";
  const minFiyat = searchParams.get("minFiyat") || "";
  const maxFiyat = searchParams.get("maxFiyat") || "";
  const renkler = searchParams.get("renkler")?.split(",").filter(Boolean) || [];
  const materyaller = searchParams.get("materyaller")?.split(",").filter(Boolean) || [];
  const sirala = searchParams.get("sirala") || "";

  const { data: kategoriCounts = [] } = useQuery({
    queryKey: ["kategori-counts"],
    queryFn: getKategoriCountsAction,
  });
  const { data: fiyatAraligi } = useQuery({
    queryKey: ["fiyat-araligi"],
    queryFn: getFiyatAraligiAction,
  });
  const { data: renkList = [] } = useQuery({
    queryKey: ["renkler"],
    queryFn: getRenklerAction,
  });
  const { data: materyalList = [] } = useQuery({
    queryKey: ["materyaller"],
    queryFn: getMateryallerAction,
  });

  const [localMin, setLocalMin] = useState(0);
  const [localMax, setLocalMax] = useState(100000);

  useEffect(() => {
    if (fiyatAraligi) {
      setLocalMin(minFiyat ? Number(minFiyat) : fiyatAraligi.min);
      setLocalMax(maxFiyat ? Number(maxFiyat) : fiyatAraligi.max);
    }
  }, [fiyatAraligi, minFiyat, maxFiyat]);

  const updateURL = useCallback(
    (params: Record<string, string | undefined>) => {
      const sp = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, val]) => {
        if (val) sp.set(key, val);
        else sp.delete(key);
      });
      router.push(`/urunler?${sp.toString()}`);
    },
    [router, searchParams]
  );

  const hasActiveFilters =
    kategori || minFiyat || maxFiyat || renkler.length || materyaller.length || sirala;

  const pctMin = fiyatAraligi
    ? ((localMin - fiyatAraligi.min) / (fiyatAraligi.max - fiyatAraligi.min)) * 100
    : 0;
  const pctMax = fiyatAraligi
    ? ((localMax - fiyatAraligi.min) / (fiyatAraligi.max - fiyatAraligi.min)) * 100
    : 100;

  const panel =
    "min-w-[280px] max-w-[320px] rounded-xl border border-border bg-card p-4 shadow-2xl";
  const contentClass = "z-50 animate-slide-up";

  const baseBtn =
    "flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition whitespace-nowrap cursor-pointer";

  const activeBtn = "bg-primary border-primary text-primary-foreground";
  const inactiveBtn = "border-border text-foreground-secondary hover:border-border-strong";

  return (
    <div
      className="sticky top-14 z-40 border-b border-border bg-surface/95 backdrop-blur-sm"
      style={{ position: "sticky", top: "56px" }}
    >
      <div className="mx-auto max-w-6xl px-4 py-2.5">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {/* KATEGORİLER */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className={`${baseBtn} ${kategori ? activeBtn : inactiveBtn}`}>
                KATEGORİLER {kategori && "(1)"} <ChevronDown size={14} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                sideOffset={8}
                align="start"
                className={`${panel} max-h-72 overflow-y-auto ${contentClass}`}
              >
                <button
                  onClick={() => updateURL({ kategori: undefined })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    !kategori
                      ? "bg-primary-light text-primary"
                      : "text-foreground-secondary hover:bg-surface-alt"
                  }`}
                >
                  Tümü
                </button>
                {kategoriCounts.map((k: any) => (
                  <button
                    key={k._id}
                    onClick={() =>
                      updateURL({
                        kategori: k._id === kategori ? undefined : k._id,
                      })
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      kategori === k._id
                        ? "bg-primary-light text-primary"
                        : "text-foreground-secondary hover:bg-surface-alt"
                    }`}
                  >
                    {k.kategoriAdi}{" "}
                    <span className="text-muted-darker text-xs">({k.count} ürün)</span>
                  </button>
                ))}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {/* FİYAT ARALIĞI */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className={`${baseBtn} ${minFiyat || maxFiyat ? activeBtn : inactiveBtn}`}>
                FİYAT ARALIĞI {(minFiyat || maxFiyat) ? "(1)" : ""} <ChevronDown size={14} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                sideOffset={8}
                align="start"
                className={`${panel} ${contentClass}`}
              >
                {fiyatAraligi && (
                  <>
                    <div className="relative h-2 bg-zinc-700 rounded-full mb-4">
                      <div
                        className="absolute h-full bg-primary rounded-full"
                        style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
                      />
                      <input
                        type="range"
                        min={fiyatAraligi.min}
                        max={fiyatAraligi.max}
                        value={localMin}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (v < localMax) setLocalMin(v);
                        }}
                        className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer"
                      />
                      <input
                        type="range"
                        min={fiyatAraligi.min}
                        max={fiyatAraligi.max}
                        value={localMax}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (v > localMin) setLocalMax(v);
                        }}
                        className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={localMin}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D/g, "");
                          const v = cleaned ? Number(cleaned) : 0;
                          if (v >= fiyatAraligi.min && v < localMax) setLocalMin(v);
                        }}
                        className="w-full rounded-lg bg-surface-alt border border-border px-2 py-1.5 text-xs text-foreground text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <span className="text-muted-darker text-xs">-</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={localMax}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D/g, "");
                          const v = cleaned ? Number(cleaned) : 0;
                          if (v <= fiyatAraligi.max && v > localMin) setLocalMax(v);
                        }}
                        className="w-full rounded-lg bg-surface-alt border border-border px-2 py-1.5 text-xs text-foreground text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          updateURL({
                            minFiyat: String(localMin),
                            maxFiyat: String(localMax),
                          })
                        }
                        className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition"
                      >
                        Uygula
                      </button>
                      <button
                        onClick={() => {
                          setLocalMin(fiyatAraligi.min);
                          setLocalMax(fiyatAraligi.max);
                          updateURL({
                            minFiyat: undefined,
                            maxFiyat: undefined,
                          });
                        }}
                        className="flex-1 rounded-lg border border-border py-1.5 text-xs text-foreground-secondary hover:bg-surface-alt transition"
                      >
                        Temizle
                      </button>
                    </div>
                  </>
                )}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {/* RENK */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className={`${baseBtn} ${renkler.length ? activeBtn : inactiveBtn}`}>
                RENK {renkler.length > 0 && `(${renkler.length})`} <ChevronDown size={14} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                sideOffset={8}
                align="start"
                className={`${panel} ${contentClass}`}
              >
                <div className="flex flex-wrap gap-2">
                  {renkList.map((r) => {
                    const bg = colorMap[r] || "#9ca3af";
                    const selected = renkler.includes(r);
                    const isLight = ["Beyaz", "Bej", "Gri"].includes(r);
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          const newRenkler = renkler.includes(r)
                            ? renkler.filter((x) => x !== r)
                            : [...renkler, r];
                          updateURL({
                            renkler: newRenkler.length
                              ? newRenkler.join(",")
                              : undefined,
                          });
                        }}
                        title={r}
                        className={`w-8 h-8 rounded-full border-2 transition ${
                          selected
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-zinc-600 hover:border-zinc-400"
                        }`}
                        style={{ backgroundColor: bg }}
                      >
                        {selected && (
                          <span
                            className={`flex items-center justify-center text-[10px] font-bold ${
                              isLight ? "text-black" : "text-white"
                            }`}
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {renkler.length > 0 && (
                  <button
                    onClick={() => updateURL({ renkler: undefined })}
                    className="mt-3 w-full text-center text-xs text-muted-darker hover:text-foreground-secondary underline"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {/* MATERYAL */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className={`${baseBtn} ${materyaller.length ? activeBtn : inactiveBtn}`}>
                MATERYAL {materyaller.length > 0 && `(${materyaller.length})`}{" "}
                <ChevronDown size={14} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                sideOffset={8}
                align="start"
                className={`${panel} max-h-60 overflow-y-auto ${contentClass}`}
              >
                {materyalList.map((m) => (
                  <label
                    key={m}
                    className="flex items-center gap-2 cursor-pointer px-1 py-1.5 rounded hover:bg-surface-alt transition"
                  >
                    <input
                      type="checkbox"
                      checked={materyaller.includes(m)}
                      onChange={() => {
                        const newMateryaller = materyaller.includes(m)
                          ? materyaller.filter((x) => x !== m)
                          : [...materyaller, m];
                        updateURL({
                          materyaller: newMateryaller.length
                            ? newMateryaller.join(",")
                            : undefined,
                        });
                      }}
                      className="accent-primary"
                    />
                    <span className="text-sm text-foreground-secondary">{m}</span>
                  </label>
                ))}
                {materyaller.length > 0 && (
                  <button
                    onClick={() => updateURL({ materyaller: undefined })}
                    className="mt-2 w-full text-center text-xs text-muted-darker hover:text-foreground-secondary underline"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {/* SIRALA */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className={`${baseBtn} ${sirala ? activeBtn : inactiveBtn}`}>
                SIRALA {sirala && "(1)"} <ChevronDown size={14} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                sideOffset={8}
                align="start"
                className={`${panel} ${contentClass}`}
              >
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      updateURL({
                        sirala: sirala === opt.value ? undefined : opt.value,
                      })
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      sirala === opt.value
                        ? "bg-primary-light text-primary font-semibold"
                        : "text-foreground-secondary hover:bg-surface-alt"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {hasActiveFilters && (
            <button
              onClick={() => router.push("/urunler")}
              className="flex items-center gap-1 rounded-full border border-red-800 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/20 transition whitespace-nowrap shrink-0"
            >
              <X size={14} /> Temizle
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
