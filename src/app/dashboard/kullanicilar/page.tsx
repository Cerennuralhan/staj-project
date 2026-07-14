"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getKullaniciListAction, createKullaniciAction, updateKullaniciAction, deleteKullaniciAction } from "@/features/auth/actions";

const rolLabels: Record<string, string> = { admin: "Admin", satis: "Satış", montaj: "Montaj" };
const rolRenk: Record<string, string> = { admin: "text-red-400", satis: "text-blue-400", montaj: "text-yellow-400" };

export default function KullanicilarPage() {
  const qc = useQueryClient();
  const { data: kullanicilar = [] } = useQuery({ queryKey: ["kullanicilar"], queryFn: getKullaniciListAction });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ adSoyad: "", eposta: "", sifre: "", rol: "satis" as const });

  const createMut = useMutation({
    mutationFn: () => createKullaniciAction(form),
    onSuccess: (r) => { if (r.success) { setForm({ adSoyad: "", eposta: "", sifre: "", rol: "satis" }); setShowForm(false); qc.invalidateQueries({ queryKey: ["kullanicilar"] }); } },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, aktifMi }: { id: string; aktifMi: boolean }) => updateKullaniciAction(id, { aktifMi }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kullanicilar"] }),
  });

  const rolMut = useMutation({
    mutationFn: ({ id, rol }: { id: string; rol: string }) => updateKullaniciAction(id, { rol: rol as any }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kullanicilar"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteKullaniciAction(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kullanicilar"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kullanıcılar</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm">+ Yeni</button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3 max-w-md">
          <input value={form.adSoyad} onChange={(e) => setForm((p) => ({ ...p, adSoyad: e.target.value }))} placeholder="Ad Soyad" className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
          <input value={form.eposta} onChange={(e) => setForm((p) => ({ ...p, eposta: e.target.value }))} placeholder="E-posta" className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
          <input value={form.sifre} onChange={(e) => setForm((p) => ({ ...p, sifre: e.target.value }))} type="password" placeholder="Şifre" className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
          <select value={form.rol} onChange={(e) => setForm((p) => ({ ...p, rol: e.target.value as any }))} className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm">
            <option value="admin">Admin</option>
            <option value="satis">Satış</option>
            <option value="montaj">Montaj</option>
          </select>
          <button onClick={() => createMut.mutate()} disabled={!form.adSoyad || !form.eposta || !form.sifre} className="px-4 py-2 rounded bg-blue-600 text-white text-sm">Oluştur</button>
        </div>
      )}

      <div className="grid gap-3">
        {kullanicilar.map((k: any) => (
          <div key={k._id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900">
            <div>
              <p className="font-semibold text-white">{k.adSoyad}</p>
              <p className="text-xs text-zinc-400">{k.eposta}</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={k.rol} onChange={(e) => rolMut.mutate({ id: k._id, rol: e.target.value })}
                className="p-1 rounded bg-zinc-700 text-white text-xs border border-zinc-600">
                <option value="admin">Admin</option>
                <option value="satis">Satış</option>
                <option value="montaj">Montaj</option>
              </select>
              <button onClick={() => toggleMut.mutate({ id: k._id, aktifMi: !k.aktifMi })}
                className={`px-2 py-1 rounded text-xs ${k.aktifMi ? "bg-green-700" : "bg-red-700"} text-white`}>
                {k.aktifMi ? "Aktif" : "Pasif"}
              </button>
              <button onClick={() => { if (confirm("Sil?")) deleteMut.mutate(k._id); }} className="text-xs text-red-400">Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
