"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  getMusteriListAction, getMusteriOzetAction, getAllMusteriListAction,
  getBultenAboneListAction,
  createMusteriAction, updateMusteriAction, deleteMusteriAction,
} from "@/features/musteri/actions";
import type { Musteri } from "@/features/musteri/types";
import {
  Plus, Search, Download, ChevronLeft, ChevronRight,
  Users, UserPlus, Activity, Clock, Mail, Pencil, Trash2, Eye,
  ArrowUpDown,
} from "lucide-react";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("tr-TR");
}

/* ---------- CSV Export ---------- */
function exportCSV(data: Musteri[]) {
  const header = "Ad Soyad,Telefon,E-posta,Adres,Kayıt Tarihi";
  const rows = data.map((m) =>
    `"${m.adSoyad}","${m.telefon}","${m.eposta}","${m.adres}","${formatDate(m.createdAt)}"`,
  ).join("\n");
  const blob = new Blob([`${header}\n${rows}`], { type: "text/csv;charset=utf-8;", endings: "native" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `musteriler_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportBultenCSV(data: { adSoyad: string; eposta: string }[]) {
  const header = "Ad Soyad,E-posta";
  const rows = data.map((m) => `"${m.adSoyad}","${m.eposta}"`).join("\n");
  const blob = new Blob([`${header}\n${rows}`], { type: "text/csv;charset=utf-8;", endings: "native" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bulten_aboneleri_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- Müşteri Formu (Oluştur / Düzenle) ---------- */
interface FormState {
  adSoyad: string; telefon: string; eposta: string; adres: string;
}
const emptyForm: FormState = { adSoyad: "", telefon: "", eposta: "", adres: "" };

function MusteriFormModal({ onClose, initial, onSave, loading }: {
  onClose: () => void; initial: FormState; onSave: (d: FormState) => void; loading: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 overflow-auto" onClick={onClose}>
      <div className="w-full max-w-lg p-6 rounded-xl border border-zinc-800 bg-zinc-900 space-y-4 m-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white">{initial.adSoyad ? "Müşteri Düzenle" : "Yeni Müşteri"}</h2>
        <div className="grid grid-cols-2 gap-3">
          <input value={form.adSoyad} onChange={(e) => setForm((p) => ({ ...p, adSoyad: e.target.value }))}
            placeholder="Ad Soyad *"
            className="col-span-2 p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
          <input value={form.telefon} onChange={(e) => setForm((p) => ({ ...p, telefon: e.target.value }))}
            placeholder="Telefon"
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
          <input value={form.eposta} onChange={(e) => setForm((p) => ({ ...p, eposta: e.target.value }))}
            placeholder="E-posta" type="email"
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
        </div>
        <textarea value={form.adres} onChange={(e) => setForm((p) => ({ ...p, adres: e.target.value }))}
          placeholder="Adres"
          rows={2}
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none resize-none" />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-sm">İptal</button>
          <button onClick={() => onSave(form)} disabled={!form.adSoyad || loading}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50">
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Ana Sayfa ---------- */
export default function MusteriPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("-createdAt");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Musteri | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [bultenFiltre, setBultenFiltre] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["musteriler", debouncedSearch, page, sort, bultenFiltre],
    queryFn: () => getMusteriListAction({
      search: debouncedSearch, page, limit: 15, sort,
      bultenOnay: bultenFiltre ? true : undefined,
    }),
  });

  const { data: ozet } = useQuery({
    queryKey: ["musteri-ozet"],
    queryFn: () => getMusteriOzetAction(),
  });

  const createMut = useMutation({
    mutationFn: (form: FormState) => createMusteriAction(form),
    onSuccess: (res) => {
      if (res.success) { setShowForm(false); queryClient.invalidateQueries({ queryKey: ["musteriler"] }); queryClient.invalidateQueries({ queryKey: ["musteri-ozet"] }); }
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, form }: { id: string; form: FormState }) => updateMusteriAction(id, form),
    onSuccess: (res) => {
      if (res.success) { setEditTarget(null); queryClient.invalidateQueries({ queryKey: ["musteriler"] }); queryClient.invalidateQueries({ queryKey: ["musteri-ozet"] }); }
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteMusteriAction(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["musteriler"] }); queryClient.invalidateQueries({ queryKey: ["musteri-ozet"] }); },
  });

  const handleSearch = useCallback(
    (() => { let timer: ReturnType<typeof setTimeout>; return (v: string) => { setSearch(v); clearTimeout(timer); timer = setTimeout(() => { setDebouncedSearch(v); setPage(1); }, 400); }; })(),
    [],
  );

  const handleExport = async () => {
    setExportLoading(true);
    try {
      if (bultenFiltre) {
        const aboneler = await getBultenAboneListAction();
        exportBultenCSV(aboneler);
      } else {
        const all = await getAllMusteriListAction();
        exportCSV(all);
      }
    } finally { setExportLoading(false); }
  };

  const totalPages = data?.totalPages || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users size={24} className="text-blue-400" />
            Müşteriler
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Müşteri kayıtlarını yönetin, görüntüleyin ve dışa aktarın.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition">
          <Plus size={16} />
          Yeni Müşteri
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SummaryCard icon={<Users size={20} />} label="Toplam Müşteri" value={ozet?.toplam ?? "—"} color="blue" />
        <SummaryCard icon={<UserPlus size={20} />} label="Bu Ay Yeni" value={ozet?.buAyYeni ?? "—"} color="green" />
        <SummaryCard icon={<Activity size={20} />} label="Aktif (3 Ay)" value={ozet?.aktif ?? "—"} color="purple" />
        <SummaryCard icon={<Mail size={20} />} label="Bülten Aboneleri" value={ozet?.bultenAbone ?? "—"} color="pink" />
        <SummaryCard icon={<Clock size={20} />} label="Son Güncelleme" value={ozet?.sonGuncelleme ? formatDate(ozet.sonGuncelleme) : "—"} color="amber" />
      </div>

      {/* Search + Actions Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input value={search} onChange={(e) => handleSearch(e.target.value)}
            placeholder="İsim, telefon veya e-posta ile ara..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
        </div>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none">
          <option value="-createdAt">En Yeni</option>
          <option value="createdAt">En Eski</option>
          <option value="adSoyad">İsim (A-Z)</option>
          <option value="-adSoyad">İsim (Z-A)</option>
        </select>
        <label className="flex items-center gap-2 cursor-pointer shrink-0">
          <input type="checkbox" checked={bultenFiltre} onChange={(e) => { setBultenFiltre(e.target.checked); setPage(1); }}
            className="accent-blue-500 w-4 h-4" />
          <span className="text-sm text-zinc-300 whitespace-nowrap">Bültene Kayıtlı</span>
        </label>
        <button onClick={handleExport} disabled={exportLoading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3.5 py-2 text-sm text-zinc-300 transition disabled:opacity-50">
          <Download size={15} />
          {exportLoading ? "..." : "Dışa Aktar"}
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="rounded-xl border border-zinc-800 p-10 text-center text-sm text-zinc-500">Yükleniyor...</div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Ad Soyad</th>
                <th className="text-left px-4 py-3 font-medium">Telefon</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">E-posta</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Adres</th>
                <th className="text-right px-4 py-3 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {data?.data?.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-500">Müşteri bulunamadı.</td></tr>
              ) : (
                data?.data?.map((m: Musteri) => (
                  <tr key={m._id} className="bg-zinc-900 hover:bg-zinc-800/60 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium truncate max-w-[180px]">{m.adSoyad}</p>
                      {m.uyeId && <span className="inline-block mt-0.5 rounded-full bg-blue-900/40 border border-blue-800 px-2 py-0.5 text-[10px] font-medium text-blue-300">Online</span>}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{m.telefon || "—"}</td>
                    <td className="px-4 py-3 text-zinc-300 hidden md:table-cell">{m.eposta || "—"}</td>
                    <td className="px-4 py-3 text-zinc-300 hidden lg:table-cell truncate max-w-[200px]">{m.adres || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/musteri/${m._id}`}
                          className="p-1.5 rounded text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 transition" title="Görüntüle">
                          <Eye size={15} />
                        </Link>
                        <button onClick={() => setEditTarget(m)}
                          className="p-1.5 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition" title="Düzenle">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => { if (confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) deleteMut.mutate(m._id); }}
                          className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition" title="Sil">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
            className="p-2 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 transition">
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
            Math.max(0, Math.min(page - 3, totalPages - 7)),
            Math.min(totalPages, Math.max(7, page + 3)),
          ).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded text-sm font-medium transition ${page === p ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="p-2 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 transition">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <MusteriFormModal
          initial={emptyForm}
          onClose={() => setShowForm(false)}
          onSave={(form) => createMut.mutate(form)}
          loading={createMut.isPending}
        />
      )}

      {/* Edit Form Modal */}
      {editTarget && (
        <MusteriFormModal
          initial={{ adSoyad: editTarget.adSoyad, telefon: editTarget.telefon, eposta: editTarget.eposta, adres: editTarget.adres }}
          onClose={() => setEditTarget(null)}
          onSave={(form) => updateMut.mutate({ id: editTarget._id, form })}
          loading={updateMut.isPending}
        />
      )}
    </div>
  );
}

/* ---------- Özet Kartı ---------- */
function SummaryCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number; color: "blue" | "green" | "purple" | "amber" | "pink";
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  };
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  );
}
