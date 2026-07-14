"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { addTedarikciBelgeAction, deleteTedarikciBelgeAction } from "@/features/tedarikci/actions";
import type { TedarikciBelge } from "@/features/tedarikci/types";
import { Upload, X, FileText } from "lucide-react";

interface Props {
  tedarikciId: string;
  belgeler: TedarikciBelge[];
}

export function BelgeUploadForm({ tedarikciId, belgeler }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [aciklama, setAciklama] = useState("");
  const [tur, setTur] = useState("fatura");

  const refresh = () => router.refresh();

  const uploadMut = useMutation({
    mutationFn: async () => {
      const file = fileRef.current?.files?.[0];
      if (!file) throw new Error("Dosya seçilmedi");
      const buffer = await file.arrayBuffer();
      const base64 = `data:${file.type};base64,${Buffer.from(buffer).toString("base64")}`;
      return addTedarikciBelgeAction(tedarikciId, base64, aciklama, tur);
    },
    onSuccess: (res) => {
      if (res.success) {
        setAciklama("");
        if (fileRef.current) fileRef.current.value = "";
        refresh();
      }
    },
  });

  const deleteMut = useMutation({
    mutationFn: (url: string) => deleteTedarikciBelgeAction(tedarikciId, url),
    onSuccess: () => refresh(),
  });

  return (
    <div className="space-y-4">
      {belgeler.length > 0 && (
        <div className="grid gap-3">
          {belgeler.map((b, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
              <FileText size={18} className="text-blue-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{b.aciklama || "Belge"}</p>
                <p className="text-xs text-zinc-500">{b.tur || "—"}</p>
              </div>
              <a href={b.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline shrink-0">Görüntüle</a>
              <button onClick={() => { if (confirm("Silmek istediğinize emin misiniz?")) deleteMut.mutate(b.url); }}
                className="text-red-400 hover:text-red-300 shrink-0">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-zinc-300">Yeni Belge Yükle</h3>
        <div className="grid grid-cols-2 gap-3">
          <input ref={fileRef} type="file" accept="image/*,.pdf"
            className="col-span-2 text-sm text-zinc-400 file:mr-3 file:rounded file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-sm file:text-white" />
          <input value={aciklama} onChange={(e) => setAciklama(e.target.value)}
            placeholder="Açıklama"
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none" />
          <select value={tur} onChange={(e) => setTur(e.target.value)}
            className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-blue-500 outline-none">
            <option value="fatura">Fatura</option>
            <option value="sozlesme">Sözleşme</option>
            <option value="irsaliye">İrsaliye</option>
            <option value="diger">Diğer</option>
          </select>
        </div>
        <button onClick={() => uploadMut.mutate()}
          disabled={uploadMut.isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition disabled:opacity-50">
          <Upload size={16} />
          {uploadMut.isPending ? "Yükleniyor..." : "Yükle"}
        </button>
        {uploadMut.data && !uploadMut.data.success && (
          <p className="text-xs text-red-400">{uploadMut.data.error}</p>
        )}
      </div>
    </div>
  );
}
