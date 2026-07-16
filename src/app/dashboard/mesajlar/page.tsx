"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getIletisimMesajlariAction,
  markIletisimMesajiOkunduAction,
  markIletisimMesajiOkunmadiAction,
  markAllIletisimMesajlariOkunduAction,
  deleteIletisimMesajiAction,
} from "@/features/magaza/actions";
import { hasPermission } from "@/lib/auth/permissions";
import { Mail, Trash2, X, Loader2, CheckCheck, CircleCheck, AlertCircle } from "lucide-react";

function MesajDetay({ mesaj, onClose }: { mesaj: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/60 overflow-auto">
      <div className="w-full max-w-xl p-6 rounded-xl border border-zinc-800 bg-zinc-900 space-y-4 m-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Mesaj Detayı</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="text-sm text-zinc-300 space-y-2">
          <p>
            <span className="text-zinc-500">Ad Soyad:</span>{" "}
            {mesaj.musteriId?._id ? (
              <Link href={"/dashboard/musteri/" + mesaj.musteriId._id} className="text-blue-400 hover:underline">
                {mesaj.adSoyad}
              </Link>
            ) : (
              mesaj.adSoyad
            )}
          </p>
          <p>
            <span className="text-zinc-500">E-posta:</span>{" "}
            <a href={`mailto:${mesaj.eposta}`} className="text-blue-400 hover:underline">
              {mesaj.eposta}
            </a>
          </p>
          {mesaj.telefon && (
            <p>
              <span className="text-zinc-500">Telefon:</span>{" "}
              <a href={`tel:${mesaj.telefon}`} className="text-blue-400 hover:underline">
                {mesaj.telefon}
              </a>
            </p>
          )}
          <p>
            <span className="text-zinc-500">Tarih:</span>{" "}
            {new Date(mesaj.tarih).toLocaleString("tr-TR")}
          </p>
        </div>
        <hr className="border-zinc-700" />
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Mesaj
          </h3>
          <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
            {mesaj.mesaj}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MesajlarPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const queryClient = useQueryClient();
  const [selectedMesaj, setSelectedMesaj] = useState<any>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const autoOpenedRef = useRef(false);

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  const rol = (session?.user as any)?.rol as string | undefined;
  useEffect(() => {
    if (rol && !hasPermission(rol as any, "mesaj")) {
      router.replace("/dashboard");
    }
  }, [rol, router]);

  const { data: mesajlar = [], isFetching } = useQuery({
    queryKey: ["iletisim-mesajlari"],
    queryFn: getIletisimMesajlariAction,
  });

  useEffect(() => {
    if (highlightId && mesajlar.length > 0 && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      const hedef = mesajlar.find((m: any) => m._id === highlightId);
      if (hedef) {
        setSelectedMesaj(hedef);
        if (!hedef.okunduMu) {
          okunduMut.mutate(hedef._id);
        }
        setTimeout(() => {
          highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
    }
  }, [highlightId, mesajlar]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["iletisim-mesajlari"] });
  };

  const okunduMut = useMutation({
    mutationFn: (id: string) => markIletisimMesajiOkunduAction(id),
    onSettled: invalidate,
  });

  const okunmadiMut = useMutation({
    mutationFn: (id: string) => markIletisimMesajiOkunmadiAction(id),
    onSettled: invalidate,
  });

  const markAllMut = useMutation({
    mutationFn: async () => {
      const res = await markAllIletisimMesajlariOkunduAction();
      if (!res.success) throw new Error(res.error || "Bir hata oluştu");
      return res;
    },
    onSuccess: () => setNotification({ type: "success", message: "Tüm mesajlar okundu olarak işaretlendi." }),
    onError: (err: Error) => setNotification({ type: "error", message: err.message }),
    onSettled: invalidate,
  });

  const silMut = useMutation({
    mutationFn: (id: string) => deleteIletisimMesajiAction(id),
    onSettled: invalidate,
  });

  const handleSelect = (m: any) => {
    setSelectedMesaj(m);
    if (!m.okunduMu) {
      okunduMut.mutate(m._id);
    }
  };

  const okunmamisCount = mesajlar.filter((m: any) => !m.okunduMu).length;

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            notification.type === "success"
              ? "border-green-700/50 bg-green-900/20 text-green-300"
              : "border-red-700/50 bg-red-900/20 text-red-300"
          }`}
        >
          {notification.type === "success" ? <CircleCheck size={16} /> : <AlertCircle size={16} />}
          {notification.message}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Mesajlar</h1>
          {okunmamisCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 border border-red-500/30 px-3 py-1 text-xs font-medium text-red-400">
              <Mail size={12} />
              {okunmamisCount} okunmamış
            </span>
          )}
        </div>
        {okunmamisCount > 0 && (
          <button
            onClick={() => markAllMut.mutate()}
            disabled={markAllMut.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 transition disabled:opacity-50"
          >
            {markAllMut.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <CheckCheck size={14} />
            )}
            Tümünü okundu işaretle
          </button>
        )}
      </div>

      {isFetching ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-zinc-500" size={32} />
        </div>
      ) : mesajlar.length === 0 ? (
        <div className="text-center py-20">
          <Mail size={48} className="text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">Henüz mesaj bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {mesajlar.map((m: any, i: number) => (
            <div
              key={m._id}
              ref={m._id === highlightId ? highlightRef : undefined}
              onClick={() => handleSelect(m)}
              className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                m._id === highlightId
                  ? "border-yellow-500/60 bg-yellow-900/15"
                  : !m.okunduMu
                  ? "border-blue-800/50 bg-blue-900/10 hover:border-blue-600/50"
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {m.musteriId?._id ? (
                    <Link
                      href={"/dashboard/musteri/" + m.musteriId._id}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-sm truncate text-blue-400 hover:underline ${
                        !m.okunduMu ? "font-bold" : ""
                      }`}
                    >
                      {m.adSoyad}
                    </Link>
                  ) : (
                    <p className={`text-sm truncate ${!m.okunduMu ? "font-bold text-white" : "text-zinc-300"}`}>
                      {m.adSoyad}
                    </p>
                  )}
                  {!m.okunduMu && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  )}
                </div>
                <p
                  className={`text-xs mt-0.5 truncate ${
                    !m.okunduMu ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  {m.mesaj}
                </p>
                <p className="text-[11px] text-zinc-600 mt-1">
                  {new Date(m.tarih).toLocaleString("tr-TR")}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-4">
                <span className="text-xs text-zinc-500 truncate max-w-[120px] hidden sm:block">
                  {m.eposta}
                </span>
                {m.okunduMu && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      okunmadiMut.mutate(m._id);
                    }}
                    className="p-1.5 rounded text-zinc-500 hover:text-blue-400 hover:bg-blue-900/20 transition"
                    title="Okunmadı olarak işaretle"
                  >
                    <CheckCheck size={14} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Bu mesajı silmek istediğinize emin misiniz?")) {
                      silMut.mutate(m._id);
                    }
                  }}
                  className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-red-900/20 transition"
                  title="Sil"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMesaj && (
        <MesajDetay mesaj={selectedMesaj} onClose={() => setSelectedMesaj(null)} />
      )}
    </div>
  );
}
