"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateMusteriNotAction } from "@/features/musteri/actions";
import { Save, FileText } from "lucide-react";

export function NotlarEditor({ musteriId, notlar: initial }: { musteriId: string; notlar: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [notlar, setNotlar] = useState(initial);
  const [dirty, setDirty] = useState(false);

  const saveMut = useMutation({
    mutationFn: () => updateMusteriNotAction(musteriId, notlar),
    onSuccess: (res) => {
      if (res.success) {
        setDirty(false);
        queryClient.invalidateQueries({ queryKey: ["musteriler"] });
        router.refresh();
      }
    },
  });

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <FileText size={16} className="text-blue-400" />
          Müşteri Notları
        </h2>
        <textarea
          value={notlar}
          onChange={(e) => { setNotlar(e.target.value); setDirty(true); }}
          placeholder="Bu müşteri hakkında notlarınızı buraya yazabilirsiniz..."
          rows={8}
          className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none resize-none"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            {dirty ? "Kaydedilmemiş değişiklikler var" : "Son kaydedilen"}
          </p>
          <button
            onClick={() => saveMut.mutate()}
            disabled={!dirty || saveMut.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
          >
            <Save size={15} />
            {saveMut.isPending ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
        {saveMut.data && !saveMut.data.success && (
          <p className="text-xs text-red-400">{String(saveMut.data.error)}</p>
        )}
      </div>
    </div>
  );
}
