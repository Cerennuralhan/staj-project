"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  getBildirimListAction,
  getOkunmamisBildirimSayisiAction,
  bildirimOkunduAction,
  tumBildirimlerOkunduAction,
} from "@/features/bildirim/actions";

function getBildirimYolu(b: any): string | null {
  switch (b.tur) {
    case "stok_tukendi":
      if (b.linkUrl) return b.linkUrl;
      return b.ilgiliUrunId ? `/dashboard/urun?q=${b.ilgiliUrunId}&highlight=stok` : null;
    case "mesaj":
      if (b.ilgiliMesajId) return `/dashboard/mesajlar/${b.ilgiliMesajId}`;
      if (b.linkUrl) return b.linkUrl;
      return "/dashboard/mesajlar";
    case "siparis":
      return b.linkUrl || null;
    default:
      return b.linkUrl || null;
  }
}

export function NotificationBell() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: sayi = 0 } = useQuery({
    queryKey: ["bildirim-sayi", userId],
    queryFn: () => getOkunmamisBildirimSayisiAction(userId),
    enabled: !!userId,
    refetchInterval: 30000,
  });

  const { data: bildirimler = [] } = useQuery({
    queryKey: ["bildirimler", userId],
    queryFn: () => getBildirimListAction(userId),
    enabled: !!userId && open,
  });

  const okunduMut = useMutation({
    mutationFn: (id: string) => bildirimOkunduAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bildirim-sayi", userId] });
      queryClient.invalidateQueries({ queryKey: ["bildirimler", userId] });
    },
  });

  const tumunuOkunduMut = useMutation({
    mutationFn: () => tumBildirimlerOkunduAction(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bildirim-sayi", userId] });
      queryClient.invalidateQueries({ queryKey: ["bildirimler", userId] });
    },
  });

  // Sayfa odaklandığında yenile
  const handleFocus = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["bildirim-sayi", userId] });
  }, [queryClient, userId]);

  useEffect(() => {
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [handleFocus]);

  if (!userId) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-zinc-800 transition text-zinc-300 hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {sayi > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {sayi > 9 ? "9+" : sayi}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl z-50 max-h-96 overflow-auto">
            <div className="flex items-center justify-between p-3 border-b border-zinc-800">
              <span className="text-sm font-semibold text-white">Bildirimler</span>
              {sayi > 0 && (
                <button onClick={() => tumunuOkunduMut.mutate()} className="text-xs text-blue-400">
                  Tümünü Okundu İşaretle
                </button>
              )}
            </div>
            {bildirimler.length === 0 ? (
              <p className="p-4 text-sm text-zinc-500">Bildirim yok.</p>
            ) : (
              bildirimler.map((b: any) => (
                <div
                  key={b._id}
                  onClick={() => {
                    if (!b.okunduMu) okunduMut.mutate(b._id);
                    setOpen(false);
                    const yol = getBildirimYolu(b);
                    if (yol) router.push(yol);
                  }}
                  className={`p-3 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition ${
                    !b.okunduMu ? "bg-zinc-800/30" : ""
                  }`}
                >
                  <p className="text-sm font-medium text-white">{b.baslik}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{b.mesaj}</p>
                  <p className="text-[10px] text-zinc-600 mt-1">
                    {new Date(b.tarih).toLocaleString("tr-TR")}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
