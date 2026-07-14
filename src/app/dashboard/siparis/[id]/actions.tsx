"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateSiparisDurumAction } from "@/features/siparis/actions";

const statusLabels: Record<string, string> = {
  beklemede: "Beklemede", onaylandi: "Onaylandı", hazirlaniyor: "Hazırlanıyor",
  kargoda: "Kargoda", teslim_edildi: "Teslim Edildi", iptal: "İptal",
};

const statusFlow: Record<string, string[]> = {
  beklemede: ["onaylandi", "iptal"],
  onaylandi: ["hazirlaniyor", "iptal"],
  hazirlaniyor: ["kargoda", "iptal"],
  kargoda: ["teslim_edildi"],
  teslim_edildi: [],
  iptal: [],
};

export function DurumActions({
  siparisId,
  mevcutDurum,
}: {
  siparisId: string;
  mevcutDurum: string;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [hata, setHata] = useState("");

  const mutation = useMutation({
    mutationFn: async (durum: string) => {
      setHata("");
      const result = await updateSiparisDurumAction(siparisId, durum);
      if (!result.success) throw new Error(result.error ?? "Bilinmeyen hata");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siparisler"] });
      queryClient.invalidateQueries({ queryKey: ["siparis", siparisId] });
      router.refresh();
    },
    onError: (err: Error) => {
      setHata(err.message);
    },
  });

  const next = statusFlow[mevcutDurum] ?? [];

  if (next.length === 0) return null;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        {next.map((d) => (
          <button
            key={d}
            onClick={() => mutation.mutate(d)}
            disabled={mutation.isPending}
            className={`px-3 py-1 rounded text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
              d === "iptal"
                ? "bg-red-900/50 text-red-300 hover:bg-red-800"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {mutation.isPending ? "İşleniyor..." : statusLabels[d] ?? d}
          </button>
        ))}
      </div>
      {hata && <p className="text-xs text-red-400">{hata}</p>}
    </div>
  );
}
