"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { getSiparisListAction, updateSiparisDurumAction } from "@/features/siparis/actions";
import type { Siparis } from "@/features/siparis/types";

const durumRenk: Record<string, string> = {
  beklemede: "bg-yellow-900/40 text-yellow-300 border-yellow-700",
  onaylandi: "bg-blue-900/40 text-blue-300 border-blue-700",
  hazirlaniyor: "bg-purple-900/40 text-purple-300 border-purple-700",
  kargoda: "bg-cyan-900/40 text-cyan-300 border-cyan-700",
  teslim_edildi: "bg-green-900/40 text-green-300 border-green-700",
  iptal: "bg-red-900/40 text-red-300 border-red-700",
};

const statusLabels: Record<string, string> = {
  beklemede: "Beklemede", onaylandi: "Onaylandı", hazirlaniyor: "Hazırlanıyor",
  kargoda: "Kargoda", teslim_edildi: "Teslim Edildi", iptal: "İptal",
};

export default function SiparisPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");

  const { data: siparisler = [] } = useQuery({
    queryKey: ["siparisler"],
    queryFn: getSiparisListAction,
  });

  const durumMut = useMutation({
    mutationFn: ({ id, durum }: { id: string; durum: string }) => updateSiparisDurumAction(id, durum),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["siparisler"] }),
  });

  const filtered = filter ? siparisler.filter((s) => s.durum === filter) : siparisler;

  const nextStatus: Record<string, string[]> = {
    beklemede: ["onaylandi", "iptal"], onaylandi: ["hazirlaniyor", "iptal"],
    hazirlaniyor: ["kargoda", "iptal"], kargoda: ["teslim_edildi"],
    teslim_edildi: [], iptal: [],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Siparişler</h1>
        <Link href="/dashboard/siparis/yeni" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
          + Yeni Sipariş
        </Link>
      </div>

      {/* Durum filtre */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter("")} className={`px-3 py-1 rounded-full text-xs border ${!filter ? "bg-blue-600 border-blue-600 text-white" : "border-zinc-700 text-zinc-300"}`}>Tümü</button>
        {Object.keys(statusLabels).map((k) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1 rounded-full text-xs border ${filter === k ? "bg-blue-600 border-blue-600 text-white" : "border-zinc-700 text-zinc-300"}`}>{statusLabels[k]}</button>
        ))}
      </div>

      {filtered.map((s: Siparis) => (
        <Link key={s._id} href={`/dashboard/siparis/${s._id}`} className="block p-4 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">#{s.siparisNo}</p>
              <p className="text-xs text-zinc-400">{s.urunler.length} ürün · {s.toplamTutar} TL</p>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs border ${durumRenk[s.durum] ?? ""}`}>{statusLabels[s.durum]}</span>
          </div>
        </Link>
      ))}

      {filtered.length === 0 && <p className="text-zinc-500">Sipariş bulunamadı.</p>}
    </div>
  );
}
