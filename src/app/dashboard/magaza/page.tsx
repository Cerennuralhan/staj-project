"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSliderListAction, createSliderAction, updateSliderAction, deleteSliderAction,
  getGaleriListAction, createGaleriAction, updateGaleriAction, deleteGaleriAction,
  getSayfaListAction, createSayfaAction, updateSayfaAction, deleteSayfaAction,
  getIletisimMesajlariAction, deleteIletisimMesajiAction,
  getMagazaAction, updateMagazaAction,
} from "@/features/magaza/actions";

const tabs = ["slider", "galeri", "sayfalar", "iletisim", "magaza"] as const;
type Tab = (typeof tabs)[number];
const tabLabels: Record<Tab, string> = { slider: "Slider", galeri: "Galeri", sayfalar: "Sayfalar", iletisim: "İletişim", magaza: "Mağaza" };

function SliderTab() {
  const qc = useQueryClient();
  const { data: list = [] } = useQuery({ queryKey: ["slider"], queryFn: getSliderListAction });
  const [form, setForm] = useState({ baslik: "", resim: "", butonYazisi: "", butonLinki: "", sira: 0 });
  const [editing, setEditing] = useState<string | null>(null);
  const createMut = useMutation({ mutationFn: () => createSliderAction(form), onSuccess: () => { setForm({ baslik: "", resim: "", butonYazisi: "", butonLinki: "", sira: 0 }); qc.invalidateQueries({ queryKey: ["slider"] }); } });
  const updateMut = useMutation({ mutationFn: () => updateSliderAction(editing!, form), onSuccess: () => { setEditing(null); setForm({ baslik: "", resim: "", butonYazisi: "", butonLinki: "", sira: 0 }); qc.invalidateQueries({ queryKey: ["slider"] }); } });
  const deleteMut = useMutation({ mutationFn: (id: string) => deleteSliderAction(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["slider"] }) });

  return <div className="space-y-3">
    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input value={form.baslik} onChange={(e) => setForm((p) => ({ ...p, baslik: e.target.value }))} placeholder="Başlık" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
        <input value={form.resim} onChange={(e) => setForm((p) => ({ ...p, resim: e.target.value }))} placeholder="Resim URL" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
        <input value={form.butonYazisi} onChange={(e) => setForm((p) => ({ ...p, butonYazisi: e.target.value }))} placeholder="Buton Yazısı" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
        <input value={form.butonLinki} onChange={(e) => setForm((p) => ({ ...p, butonLinki: e.target.value }))} placeholder="Buton Linki" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
      </div>
      <input value={form.sira} onChange={(e) => setForm((p) => ({ ...p, sira: Number(e.target.value) }))} type="number" placeholder="Sıra" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm w-24" />
      <button onClick={() => (editing ? updateMut : createMut).mutate()} className="px-4 py-2 rounded bg-blue-600 text-white text-sm">{editing ? "Güncelle" : "Ekle"}</button>
    </div>
    {list.map((s: any) => (
      <div key={s._id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900">
        <div><p className="font-semibold text-white">{s.baslik || "—"}</p><p className="text-xs text-zinc-400">Sıra: {s.sira}</p></div>
        <div className="flex gap-2">
          <button onClick={() => { setForm(s); setEditing(s._id); }} className="text-xs text-blue-400">Düzenle</button>
          <button onClick={() => { if (confirm("Sil?")) deleteMut.mutate(s._id); }} className="text-xs text-red-400">Sil</button>
        </div>
      </div>
    ))}
  </div>;
}

function GaleriTab() {
  const qc = useQueryClient();
  const { data: list = [] } = useQuery({ queryKey: ["galeri"], queryFn: getGaleriListAction });
  const [form, setForm] = useState({ baslik: "", resim: "", tur: "", sira: 0 });
  const [editing, setEditing] = useState<string | null>(null);
  const createMut = useMutation({ mutationFn: () => createGaleriAction(form), onSuccess: () => { setForm({ baslik: "", resim: "", tur: "", sira: 0 }); qc.invalidateQueries({ queryKey: ["galeri"] }); } });
  const updateMut = useMutation({ mutationFn: () => updateGaleriAction(editing!, form), onSuccess: () => { setEditing(null); setForm({ baslik: "", resim: "", tur: "", sira: 0 }); qc.invalidateQueries({ queryKey: ["galeri"] }); } });
  const deleteMut = useMutation({ mutationFn: (id: string) => deleteGaleriAction(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["galeri"] }) });

  return <div className="space-y-3">
    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input value={form.baslik} onChange={(e) => setForm((p) => ({ ...p, baslik: e.target.value }))} placeholder="Başlık" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
        <input value={form.resim} onChange={(e) => setForm((p) => ({ ...p, resim: e.target.value }))} placeholder="Resim URL" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
        <input value={form.tur} onChange={(e) => setForm((p) => ({ ...p, tur: e.target.value }))} placeholder="Tür" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
        <input value={form.sira} onChange={(e) => setForm((p) => ({ ...p, sira: Number(e.target.value) }))} type="number" placeholder="Sıra" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
      </div>
      <button onClick={() => (editing ? updateMut : createMut).mutate()} className="px-4 py-2 rounded bg-blue-600 text-white text-sm">{editing ? "Güncelle" : "Ekle"}</button>
    </div>
    {list.map((g: any) => (
      <div key={g._id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900">
        <div><p className="font-semibold text-white">{g.baslik || "—"}</p><p className="text-xs text-zinc-400">{g.tur} · Sıra: {g.sira}</p></div>
        <div className="flex gap-2">
          <button onClick={() => { setForm(g); setEditing(g._id); }} className="text-xs text-blue-400">Düzenle</button>
          <button onClick={() => { if (confirm("Sil?")) deleteMut.mutate(g._id); }} className="text-xs text-red-400">Sil</button>
        </div>
      </div>
    ))}
  </div>;
}

function SayfalarTab() {
  const qc = useQueryClient();
  const { data: list = [] } = useQuery({ queryKey: ["sayfalar"], queryFn: getSayfaListAction });
  const [form, setForm] = useState({ baslik: "", slug: "", icerik: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const createMut = useMutation({ mutationFn: () => createSayfaAction(form), onSuccess: () => { setForm({ baslik: "", slug: "", icerik: "" }); qc.invalidateQueries({ queryKey: ["sayfalar"] }); } });
  const updateMut = useMutation({ mutationFn: () => updateSayfaAction(editing!, form), onSuccess: () => { setEditing(null); setForm({ baslik: "", slug: "", icerik: "" }); qc.invalidateQueries({ queryKey: ["sayfalar"] }); } });
  const deleteMut = useMutation({ mutationFn: (id: string) => deleteSayfaAction(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["sayfalar"] }) });

  return <div className="space-y-3">
    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input value={form.baslik} onChange={(e) => setForm((p) => ({ ...p, baslik: e.target.value }))} placeholder="Başlık" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
        <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} placeholder="Slug" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
      </div>
      <textarea value={form.icerik} onChange={(e) => setForm((p) => ({ ...p, icerik: e.target.value }))} placeholder="İçerik (HTML)" rows={6} className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm font-mono" />
      <button onClick={() => (editing ? updateMut : createMut).mutate()} className="px-4 py-2 rounded bg-blue-600 text-white text-sm">{editing ? "Güncelle" : "Ekle"}</button>
    </div>
    {list.map((s: any) => (
      <div key={s._id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900">
        <div><p className="font-semibold text-white">{s.baslik}</p><p className="text-xs text-zinc-400">/{s.slug}</p></div>
        <div className="flex gap-2">
          <button onClick={() => { setForm(s); setEditing(s._id); }} className="text-xs text-blue-400">Düzenle</button>
          <button onClick={() => { if (confirm("Sil?")) deleteMut.mutate(s._id); }} className="text-xs text-red-400">Sil</button>
        </div>
      </div>
    ))}
  </div>;
}

function IletisimTab() {
  const qc = useQueryClient();
  const { data: mesajlar = [] } = useQuery({ queryKey: ["iletisim-mesajlari"], queryFn: getIletisimMesajlariAction });
  const deleteMut = useMutation({ mutationFn: (id: string) => deleteIletisimMesajiAction(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["iletisim-mesajlari"] }) });
  return <div className="space-y-3">
    {mesajlar.map((m: any) => (
      <div key={m._id} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900">
        <div className="flex justify-between items-start">
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-white">{m.adSoyad}</p>
            <p className="text-zinc-400">{m.eposta} · {m.telefon}</p>
            <p className="text-zinc-300 mt-2">{m.mesaj}</p>
            <p className="text-xs text-zinc-500">{new Date(m.tarih).toLocaleDateString("tr-TR")}</p>
          </div>
          <button onClick={() => { if (confirm("Sil?")) deleteMut.mutate(m._id); }} className="text-xs text-red-400">Sil</button>
        </div>
      </div>
    ))}
    {mesajlar.length === 0 && <p className="text-zinc-500 text-sm">İletişim mesajı bulunamadı.</p>}
  </div>;
}

function MagazaAyarlariTab() {
  const qc = useQueryClient();
  const { data: magaza } = useQuery({ queryKey: ["magaza"], queryFn: getMagazaAction });
  const [form, setForm] = useState({
    magazaAdi: "", telefon: "", eposta: "", adres: "", logo: "",
    koordinat: { lat: 0, lng: 0 }, disGorunusFotograflari: [],
    defaultWarrantyPeriodMonths: 24,
    vergiDairesi: "", vergiNo: "",
  });
  const [hata, setHata] = useState("");

  useEffect(() => {
    if (magaza) setForm(magaza);
  }, [magaza]);

  const updateMut = useMutation({
    mutationFn: () => updateMagazaAction(form),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["magaza"] });
        setHata("");
      } else {
        setHata(res.error || "Kaydetme başarısız");
      }
    },
    onError: (err: Error) => setHata(err.message),
  });

  return <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3 max-w-xl">
    {hata && <p className="text-red-400 text-xs bg-red-900/20 p-2 rounded">{hata}</p>}
    <input value={form.magazaAdi} onChange={(e) => setForm((p) => ({ ...p, magazaAdi: e.target.value }))} placeholder="Mağaza Adı" className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
    <div className="grid grid-cols-2 gap-3">
      <input value={form.telefon} onChange={(e) => setForm((p) => ({ ...p, telefon: e.target.value }))} placeholder="Telefon" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
      <input value={form.logo} onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))} placeholder="Logo URL" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <input value={form.eposta} onChange={(e) => setForm((p) => ({ ...p, eposta: e.target.value }))} placeholder="E-posta" type="email" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
      <input value={form.vergiDairesi} onChange={(e) => setForm((p) => ({ ...p, vergiDairesi: e.target.value }))} placeholder="Vergi Dairesi" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
    </div>
    <input value={form.vergiNo} onChange={(e) => setForm((p) => ({ ...p, vergiNo: e.target.value }))} placeholder="Vergi No" className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
    <textarea value={form.adres} onChange={(e) => setForm((p) => ({ ...p, adres: e.target.value }))} placeholder="Adres" rows={3} className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
    <div className="grid grid-cols-2 gap-3">
      <input value={form.koordinat.lat} onChange={(e) => setForm((p) => ({ ...p, koordinat: { ...p.koordinat, lat: Number(e.target.value) } }))} type="number" placeholder="Enlem" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
      <input value={form.koordinat.lng} onChange={(e) => setForm((p) => ({ ...p, koordinat: { ...p.koordinat, lng: Number(e.target.value) } }))} type="number" placeholder="Boylam" className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm" />
    </div>
    <div className="space-y-1">
      <label className="text-xs text-zinc-400">Varsayılan Garanti Süresi (ay)</label>
      <input
        type="number"
        value={form.defaultWarrantyPeriodMonths}
        onChange={(e) => setForm((p) => ({ ...p, defaultWarrantyPeriodMonths: Number(e.target.value) }))}
        min={1} max={120}
        className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm outline-none"
      />
      <p className="text-[10px] text-zinc-500">Yeni ürün eklenirken otomatik doldurulur, ürün bazında değiştirilebilir.</p>
    </div>
    <button onClick={() => { setHata(""); updateMut.mutate(); }} disabled={updateMut.isPending} className="px-4 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-50">{updateMut.isPending ? "Kaydediliyor..." : "Kaydet"}</button>
  </div>;
}

export default function MagazaPage() {
  const [tab, setTab] = useState<Tab>("slider");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mağaza Yönetimi</h1>
      <div className="flex gap-1 border-b border-zinc-800 pb-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${tab === t ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}>
            {tabLabels[t]}
          </button>
        ))}
      </div>
      {tab === "slider" && <SliderTab />}
      {tab === "galeri" && <GaleriTab />}
      {tab === "sayfalar" && <SayfalarTab />}
      {tab === "iletisim" && <IletisimTab />}
      {tab === "magaza" && <MagazaAyarlariTab />}
    </div>
  );
}
