"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  getUrunListAction, getFiyatAraligiAction,
  getAllProductsAction, createProductAction, updateProductAction,
  deleteProductAction, reorderImagesAction, getCloudinaryUploadParams, deleteImageAction,
} from "@/features/urun/actions";
import { getKategorilerAction } from "@/features/kategori/actions";
import { getDefaultWarrantyPeriodAction } from "@/features/magaza/actions";
import { formatWarrantyPeriod } from "@/lib/warranty/calculateWarrantyEndDate";
import type { Urun, UrunResim } from "@/features/urun/types";
import type { Kategori } from "@/features/kategori/types";
import Image from "next/image";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import {
  Plus, Search, X, ChevronLeft, ChevronRight, Loader2, ImageOff,
} from "lucide-react";

/* ---------- Image sortable item ---------- */
function SortableImage({
  img,
  onRemove,
}: {
  img: UrunResim;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img.resim });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <ImageWithFallback src={img.resim} alt="" width={96} height={96} className="w-24 h-24 rounded object-cover border border-zinc-700" />
      <button
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1 rounded cursor-grab opacity-0 group-hover:opacity-100"
      >
        ⠿
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onRemove(); }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-1 right-1 bg-red-700 text-white text-xs w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center"
      >
        <X size={12} />
      </button>
    </div>
  );
}

/* ---------- Product form (add / edit) ---------- */
function ProductForm({
  kategoriler,
  editingProduct,
  onClose,
}: {
  kategoriler: Kategori[];
  editingProduct: Urun | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [warrantyUnit, setWarrantyUnit] = useState<"year" | "month">("year");

  const initFiyat = editingProduct ? (editingProduct.fiyat?.toString() ?? "") : "";
  const initStok = editingProduct ? (editingProduct.stok?.toString() ?? "") : "";

  const [fiyatStr, setFiyatStr] = useState(initFiyat);
  const [stokStr, setStokStr] = useState(initStok);

  useEffect(() => {
    setFiyatStr(editingProduct ? (editingProduct.fiyat?.toString() ?? "") : "");
    setStokStr(editingProduct ? (editingProduct.stok?.toString() ?? "") : "");
  }, [editingProduct?._id]);

  const [form, setForm] = useState({
    kategoriId: editingProduct?.kategoriId?.toString() ?? "",
    urunAdi: editingProduct?.urunAdi ?? "",
    aciklama: editingProduct?.aciklama ?? "",
    fiyat: editingProduct?.fiyat ?? 0,
    stok: editingProduct?.stok ?? 0,
    kapakResmi: editingProduct?.kapakResmi ?? "",
    warrantyPeriodMonths: editingProduct?.warrantyPeriodMonths ?? 0,
    yayinlandiMi: editingProduct?.yayinlandiMi ?? true,
    oneCikan: editingProduct?.oneCikan ?? false,
    resimler: editingProduct?.resimler ?? [],
  });

  useEffect(() => {
    if (!editingProduct && form.warrantyPeriodMonths === 0) {
      getDefaultWarrantyPeriodAction().then((defaultVal) => {
        setForm((p) => ({ ...p, warrantyPeriodMonths: defaultVal }));
      });
    }
  }, [editingProduct]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        fiyat: fiyatStr ? parseFloat(fiyatStr) : 0,
        stok: stokStr ? parseInt(stokStr, 10) : 0,
      };
      if (editingProduct) {
        return updateProductAction(editingProduct._id, payload);
      }
      return createProductAction(payload);
    },
    onSuccess: (res) => {
      if (res.success) { queryClient.invalidateQueries({ queryKey: ["urunler"] }); onClose(); }
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const reorderMutation = useMutation({
    mutationFn: (resimler: UrunResim[]) => {
      if (!editingProduct) return Promise.resolve({ success: false });
      return reorderImagesAction(editingProduct._id, resimler);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["urunler"] }),
  });

  function handleImageDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = form.resimler.findIndex((r) => r.resim === active.id);
    const newIdx = form.resimler.findIndex((r) => r.resim === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = [...form.resimler];
    const [moved] = reordered.splice(oldIdx, 1);
    reordered.splice(newIdx, 0, moved);
    const updated = reordered.map((r, i) => ({ ...r, sira: i }));
    setForm((p) => ({ ...p, resimler: updated }));
    reorderMutation.mutate(updated);
  }

  function addImage(url: string) {
    setForm((p) => ({ ...p, resimler: [...p.resimler, { resim: url, sira: p.resimler.length }] }));
  }

  function removeImage(resim: string) {
    deleteImageAction(resim).catch(() => {});
    const guncel = form.resimler.filter((r) => r.resim !== resim).map((r, i) => ({ ...r, sira: i }));
    setForm((p) => ({ ...p, resimler: guncel }));
    if (editingProduct) {
      updateProductAction(editingProduct._id, { resimler: guncel }).then((r) => {
        if (r.success) queryClient.invalidateQueries({ queryKey: ["urunler"] });
      });
    }
  }

  async function handleCloudinaryUpload() {
    const params = await getCloudinaryUploadParams();
    if (!params.success) return;

    const cloudName = params.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const formData = new FormData();
    formData.append("file", "");
    formData.append("timestamp", String(params.timestamp));
    formData.append("signature", params.signature);
    formData.append("api_key", params.apiKey);
    formData.append("folder", "demiray");

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files ?? []);
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("timestamp", String(params.timestamp));
        fd.append("signature", params.signature);
        fd.append("api_key", params.apiKey);
        fd.append("folder", "demiray");
        try {
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd });
          const data = await res.json();
          if (data.secure_url) addImage(data.secure_url);
        } catch (e) { console.error("Yükleme hatası", e); }
      }
    };
    input.click();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/60 overflow-auto">
      <div className="w-full max-w-2xl p-6 rounded-xl border border-zinc-800 bg-zinc-900 space-y-4 m-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{editingProduct ? "Ürünü Düzenle" : "Yeni Ürün"}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-xl">&times;</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Kategori</label>
            <select
              value={form.kategoriId}
              onChange={(e) => setForm((p) => ({ ...p, kategoriId: e.target.value }))}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm outline-none"
              required
            >
              <option value="">Seçiniz</option>
              {kategoriler.map((k) => (
                <option key={k._id} value={k._id}>{k.kategoriAdi}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Ürün Adı</label>
            <input value={form.urunAdi} onChange={(e) => setForm((p) => ({ ...p, urunAdi: e.target.value }))}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm outline-none" required />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-xs text-zinc-400">Açıklama</label>
            <textarea value={form.aciklama} onChange={(e) => setForm((p) => ({ ...p, aciklama: e.target.value }))}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm outline-none h-20" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Fiyat (TL)</label>
            <input type="text" inputMode="decimal"
              value={fiyatStr}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^\d+(\.\d{0,2})?$/.test(v)) {
                  const cleaned = v.replace(/^0+(?=\d)/, "");
                  setFiyatStr(cleaned);
                }
              }}
              onBlur={() => {
                const val = fiyatStr || "0";
                const cleaned = val.replace(/^0+(?=\d)/, "") || "0";
                setFiyatStr(cleaned);
                setForm((p) => ({ ...p, fiyat: parseFloat(cleaned) }));
              }}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Stok</label>
            <input type="text" inputMode="numeric"
              value={stokStr}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^\d+$/.test(v)) {
                  const cleaned = v.replace(/^0+(?=\d)/, "");
                  setStokStr(cleaned);
                }
              }}
              onBlur={() => {
                const val = stokStr || "0";
                const cleaned = val.replace(/^0+(?=\d)/, "") || "0";
                setStokStr(cleaned);
                setForm((p) => ({ ...p, stok: parseInt(cleaned, 10) }));
              }}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Kapak Görseli URL</label>
            <input value={form.kapakResmi} onChange={(e) => setForm((p) => ({ ...p, kapakResmi: e.target.value }))}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Garanti Süresi</label>
            <div className="flex gap-2">
              <input type="number"
                value={warrantyUnit === "year" ? Math.round(form.warrantyPeriodMonths / 12) : form.warrantyPeriodMonths}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setForm((p) => ({
                    ...p,
                    warrantyPeriodMonths: warrantyUnit === "year" ? val * 12 : val,
                  }));
                }}
                className="flex-1 p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm outline-none"
                min={warrantyUnit === "year" ? 1 : 1}
                max={warrantyUnit === "year" ? 10 : 120}
              />
              <select
                value={warrantyUnit}
                onChange={(e) => {
                  const unit = e.target.value as "year" | "month";
                  setWarrantyUnit(unit);
                  setForm((p) => ({
                    ...p,
                    warrantyPeriodMonths: unit === "year"
                      ? Math.round(p.warrantyPeriodMonths / 12) * 12
                      : p.warrantyPeriodMonths,
                  }));
                }}
                className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm outline-none"
              >
                <option value="year">Yıl</option>
                <option value="month">Ay</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-400">Yayınla</label>
            <input type="checkbox" checked={form.yayinlandiMi}
              onChange={(e) => setForm((p) => ({ ...p, yayinlandiMi: e.target.checked }))}
              className="accent-blue-600" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-400">Öne Çıkan</label>
            <input type="checkbox" checked={form.oneCikan}
              onChange={(e) => setForm((p) => ({ ...p, oneCikan: e.target.checked }))}
              className="accent-amber-500" />
          </div>
        </div>

        {/* Resimler */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-400">Ürün Görselleri</label>
            <button onClick={handleCloudinaryUpload}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition">
              + Cloudinary Yükle
            </button>
          </div>
          {form.resimler.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center border border-dashed border-zinc-700 rounded">
              Henüz görsel eklenmedi
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleImageDragEnd}>
              <SortableContext items={form.resimler.map((r) => r.resim)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-wrap gap-2">
                  {form.resimler.map((r) => (
                    <SortableImage key={r.resim} img={r} onRemove={() => removeImage(r.resim)} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <button onClick={() => updateMutation.mutate()}
          className="w-full p-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition">
          {editingProduct ? "Güncelle" : "Kaydet"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Product card (grid) ---------- */
function ProductCard({ urun, onEdit }: { urun: Urun; onEdit: (u: Urun) => void }) {
  return (
    <div
      onClick={() => onEdit(urun)}
      className="group cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-blue-600/50 transition-colors"
    >
      <div className="aspect-square bg-zinc-800 relative">
        {urun.kapakResmi ? (
          <Image src={urun.kapakResmi} alt={urun.urunAdi} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-600">
            <ImageOff size={28} />
          </div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
          {urun.urunAdi}
        </h3>
        <p className="text-sm text-blue-400">{urun.fiyat.toLocaleString("tr-TR")} TL</p>
        <p className={`text-xs ${urun.stok > 0 ? "text-zinc-500" : "text-red-400"}`}>
          Stok: {urun.stok}
        </p>
      </div>
    </div>
  );
}

/* ---------- Main page ---------- */
export default function UrunPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const q = searchParams.get("q") || "";
  const kategoriId = searchParams.get("kategori") || "";
  const stokDurumu = searchParams.get("stok") || "";
  const minFiyatStr = searchParams.get("minFiyat") || "";
  const maxFiyatStr = searchParams.get("maxFiyat") || "";
  const sort = searchParams.get("sort") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [searchDraft, setSearchDraft] = useState(q);
  useEffect(() => { setSearchDraft(q); }, [q]);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Urun | null>(null);

  const [fiyatOpen, setFiyatOpen] = useState(false);
  const fiyatRef = useRef<HTMLDivElement>(null);
  const [localMin, setLocalMin] = useState(minFiyatStr);
  const [localMax, setLocalMax] = useState(maxFiyatStr);

  useEffect(() => {
    setLocalMin(minFiyatStr);
    setLocalMax(maxFiyatStr);
  }, [minFiyatStr, maxFiyatStr]);

  useEffect(() => {
    if (!fiyatOpen) return;
    function handleClick(e: MouseEvent) {
      if (fiyatRef.current && !fiyatRef.current.contains(e.target as Node)) {
        setFiyatOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [fiyatOpen]);

  useEffect(() => {
    if (localMin === minFiyatStr && localMax === maxFiyatStr) return;
    const timer = setTimeout(() => {
      setParam("minFiyat", localMin);
      setParam("maxFiyat", localMax);
    }, 400);
    return () => clearTimeout(timer);
  }, [localMin, localMax, minFiyatStr, maxFiyatStr]);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.set("page", "1");
    router.replace(`/dashboard/urun?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (searchDraft === q) return;
    const timer = setTimeout(() => {
      setParam("q", searchDraft);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchDraft, q]);

  const filters = {
    search: q || undefined,
    kategoriId: kategoriId || undefined,
    stokDurumu: stokDurumu || undefined,
    minFiyat: minFiyatStr ? Number(minFiyatStr) : undefined,
    maxFiyat: maxFiyatStr ? Number(maxFiyatStr) : undefined,
    sort: sort || undefined,
    page,
  };

  const { data: pageData, isLoading } = useQuery({
    queryKey: ["urunler", filters],
    queryFn: () => getUrunListAction(filters),
  });

  const { data: kategoriler = [] } = useQuery({
    queryKey: ["kategoriler"],
    queryFn: getKategorilerAction,
  });

  const { data: fiyatAraligi } = useQuery({
    queryKey: ["fiyat-araligi"],
    queryFn: getFiyatAraligiAction,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProductAction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["urunler"] }),
  });

  const urunler = pageData?.data ?? [];
  const totalPages = pageData?.totalPages ?? 0;
  const total = pageData?.total ?? 0;

  function handleEdit(u: Urun) {
    setEditingProduct(u);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    if (confirm("Ürünü silmek istediğinize emin misiniz?")) deleteMutation.mutate(id);
  }

  function handleClose() {
    setShowForm(false);
    setEditingProduct(null);
  }

  const sortOptions = [
    { value: "", label: "Varsayılan" },
    { value: "fiyat-artan", label: "Fiyata göre artan" },
    { value: "fiyat-azalan", label: "Fiyata göre azalan" },
    { value: "ad-a-z", label: "İsme göre A-Z" },
    { value: "ad-z-a", label: "İsme göre Z-A" },
  ];

  return (
    <div className="space-y-6">
      {/* Üst bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ürünler</h1>
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition"
        >
          <Plus size={16} />
          Yeni Ürün
        </button>
      </div>

      {/* Filtre/arama satırı */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Arama */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Ürün ara..."
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Kategori */}
        <select
          value={kategoriId}
          onChange={(e) => setParam("kategori", e.target.value)}
          className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="">Tüm Kategoriler</option>
          {kategoriler.map((k) => (
            <option key={k._id} value={k._id}>{k.kategoriAdi}</option>
          ))}
        </select>

        {/* Stok Durumu */}
        <select
          value={stokDurumu}
          onChange={(e) => setParam("stok", e.target.value)}
          className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="">Tüm Stoklar</option>
          <option value="var">Stok var</option>
          <option value="yok">Stok yok</option>
        </select>

        {/* Fiyat Aralığı */}
        <div ref={fiyatRef} className="relative">
          <button
            onClick={() => setFiyatOpen((p) => !p)}
            className={`rounded-lg border px-3 py-2 text-sm transition ${
              (minFiyatStr || maxFiyatStr)
                ? "border-blue-500 bg-blue-500/10 text-blue-400"
                : "border-zinc-700 bg-zinc-800 text-white hover:border-zinc-500"
            }`}
          >
            {minFiyatStr || maxFiyatStr
              ? `₺${minFiyatStr || "0"} - ₺${maxFiyatStr || "∞"}`
              : "Fiyat Aralığı"}
          </button>
          {fiyatOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-zinc-700 bg-zinc-800 p-3 shadow-xl">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min ₺"
                  value={localMin}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLocalMin(v);
                  }}
                  min={0}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
                <span className="text-zinc-500 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Maks ₺"
                  value={localMax}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLocalMax(v);
                  }}
                  min={0}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              {(minFiyatStr || maxFiyatStr) && (
                <button
                  onClick={() => {
                    setLocalMin("");
                    setLocalMax("");
                    setFiyatOpen(false);
                    setParam("minFiyat", "");
                    setParam("maxFiyat", "");
                  }}
                  className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 transition"
                >
                  Temizle
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sıralama */}
        <select
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* İçerik */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-zinc-500" size={32} />
        </div>
      ) : urunler.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500">Henüz ürün bulunamadı.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-zinc-500">{total} ürün bulundu</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {urunler.map((u: Urun) => (
              <ProductCard key={u._id} urun={u} onEdit={handleEdit} />
            ))}
          </div>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setParam("page", String(page - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
                Önceki
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setParam("page", String(p))}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                    p === page
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setParam("page", String(page + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sonraki
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}

      {showForm && (
        <ProductForm
          kategoriler={kategoriler}
          editingProduct={editingProduct}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
