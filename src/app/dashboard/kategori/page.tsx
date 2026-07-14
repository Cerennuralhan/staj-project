"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  getKategorilerAction,
  createKategoriAction,
  updateKategoriAction,
  deleteKategoriAction,
  reorderKategoriAction,
} from "@/features/kategori/actions";
import type { Kategori } from "@/features/kategori/types";

function SortableItem({
  kategori,
  onEdit,
  onDelete,
}: {
  kategori: Kategori;
  onEdit: (k: Kategori) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: kategori._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-zinc-500 hover:text-white text-lg">⠿</button>
      <span className="text-xs text-zinc-500 w-6">{kategori.sira}</span>
      {kategori.resim && (
        <img src={kategori.resim} alt="" className="w-10 h-10 rounded object-cover" />
      )}
      <span className="flex-1 text-white">{kategori.kategoriAdi}</span>
      <button onClick={() => onEdit(kategori)} className="text-xs text-blue-400 hover:text-blue-300">Düzenle</button>
      <button onClick={() => onDelete(kategori._id)} className="text-xs text-red-400 hover:text-red-300">Sil</button>
    </div>
  );
}

export default function KategoriPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ kategoriAdi: "", resim: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const { data: kategoriler = [], isLoading } = useQuery({
    queryKey: ["kategoriler"],
    queryFn: getKategorilerAction,
  });

  const createMutation = useMutation({
    mutationFn: () => createKategoriAction({ ...form, sira: kategoriler.length }),
    onSuccess: (res) => { if (res.success) { setForm({ kategoriAdi: "", resim: "" }); queryClient.invalidateQueries({ queryKey: ["kategoriler"] }); } },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateKategoriAction(editingId!, form),
    onSuccess: (res) => { if (res.success) { setForm({ kategoriAdi: "", resim: "" }); setEditingId(null); queryClient.invalidateQueries({ queryKey: ["kategoriler"] }); } },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteKategoriAction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kategoriler"] }),
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { _id: string; sira: number }[]) => reorderKategoriAction(items),
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: ["kategoriler"] });
      const prev = queryClient.getQueryData<Kategori[]>(["kategoriler"]);
      queryClient.setQueryData<Kategori[]>(["kategoriler"], (old) =>
        old?.map((k) => {
          const match = items.find((i) => i._id === k._id);
          return match ? { ...k, sira: match.sira } : k;
        }),
      );
      return { prev };
    },
    onError: (_err, _items, context) => {
      if (context?.prev) queryClient.setQueryData(["kategoriler"], context.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["kategoriler"] }),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = kategoriler.findIndex((k) => k._id === active.id);
    const newIdx = kategoriler.findIndex((k) => k._id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const reordered = [...kategoriler];
    const [moved] = reordered.splice(oldIdx, 1);
    reordered.splice(newIdx, 0, moved);
    const items = reordered.map((k, i) => ({ _id: k._id, sira: i }));
    reorderMutation.mutate(items);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) updateMutation.mutate();
    else createMutation.mutate();
  }

  function handleEdit(k: Kategori) {
    setEditingId(k._id);
    setForm({ kategoriAdi: k.kategoriAdi, resim: k.resim });
  }

  function handleDelete(id: string) {
    if (confirm("Kategoriyi silmek istediğinize emin misiniz?")) deleteMutation.mutate(id);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Kategoriler</h1>

      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1 space-y-1">
          <label className="text-xs text-zinc-400">Kategori Adı</label>
          <input
            value={form.kategoriAdi}
            onChange={(e) => setForm((p) => ({ ...p, kategoriAdi: e.target.value }))}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs text-zinc-400">Görsel URL</label>
          <input
            value={form.resim}
            onChange={(e) => setForm((p) => ({ ...p, resim: e.target.value }))}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="p-2 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition h-[38px]"
        >
          {editingId ? "Güncelle" : "Ekle"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => { setEditingId(null); setForm({ kategoriAdi: "", resim: "" }); }}
            className="p-2 px-4 rounded bg-zinc-700 hover:bg-zinc-600 text-white text-sm transition h-[38px]"
          >
            İptal
          </button>
        )}
      </form>

      {isLoading ? (
        <p className="text-zinc-400">Yükleniyor...</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={kategoriler.map((k) => k._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {kategoriler.map((k) => (
                <SortableItem key={k._id} kategori={k} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
