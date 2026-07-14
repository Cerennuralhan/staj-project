"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateMusteriAction, deleteMusteriAction } from "@/features/musteri/actions";
import type { Musteri } from "@/features/musteri/types";
import { Pencil, X, Trash2 } from "lucide-react";

export function MusteriDeleteButton({ musteriId }: { musteriId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    if (!confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    const res = await deleteMusteriAction(musteriId);
    if (res.success) router.push("/dashboard/musteri");
    else { alert(res.error || "Silme hatası"); setLoading(false); }
  };
  return (
    <button onClick={handleDelete} disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-700/40 px-3.5 py-2 text-sm font-semibold text-red-400 transition disabled:opacity-50">
      <Trash2 size={15} />
      {loading ? "..." : "Sil"}
    </button>
  );
}

export function MusteriPageActions({ musteri }: { musteri: Musteri }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    adSoyad: musteri.adSoyad,
    telefon: musteri.telefon || "",
    eposta: musteri.eposta || "",
    adres: musteri.adres || "",
  });

  const updateMut = useMutation({
    mutationFn: () => updateMusteriAction(musteri._id, form),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["musteriler"] });
        router.refresh();
        setShow(false);
      }
    },
  });

  return (
    <>
      <button onClick={() => setShow(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3.5 py-2 text-sm font-semibold text-white transition">
        <Pencil size={15} />
        Düzenle
      </button>

      {show && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 overflow-auto" onClick={() => setShow(false)}>
          <div className="w-full max-w-lg p-6 rounded-xl border border-zinc-800 bg-zinc-900 space-y-4 m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Müşteri Düzenle</h2>
              <button onClick={() => setShow(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.adSoyad} onChange={(e) => setForm((p) => ({ ...p, adSoyad: e.target.value }))}
                placeholder="Ad Soyad *"
                className="col-span-2 p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
              <input value={form.telefon} onChange={(e) => setForm((p) => ({ ...p, telefon: e.target.value }))}
                placeholder="Telefon" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
              <input value={form.eposta} onChange={(e) => setForm((p) => ({ ...p, eposta: e.target.value }))}
                placeholder="E-posta" type="email" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
            </div>
            <textarea value={form.adres} onChange={(e) => setForm((p) => ({ ...p, adres: e.target.value }))}
              placeholder="Adres" rows={2}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none resize-none" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShow(false)} className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-sm">İptal</button>
              <button onClick={() => updateMut.mutate()} disabled={!form.adSoyad || updateMut.isPending}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50">
                {updateMut.isPending ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
            {updateMut.data && !updateMut.data.success && (
              <p className="text-xs text-red-400">{String(updateMut.data.error) || "Hata"}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
