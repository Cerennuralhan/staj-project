"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  getKurulumListAction, getMontajKurulumListAction, getMontajKullanicilarAction,
  assignKurulumAction, uploadKurulumFotografiBase64Action, completeKurulumAction,
} from "@/features/kurulum/actions";

/* ---------- Renk / etiket yardımcıları ---------- */

const durumRenk: Record<string, string> = {
  planlandi: "text-yellow-400",
  tamamlandi: "text-green-400",
  iptal: "text-red-400",
};
const durumLabels: Record<string, string> = {
  planlandi: "Planlandı",
  tamamlandi: "Tamamlandı",
  iptal: "İptal",
};

/* ==================================================================
   Admin / Satis görünümü — tüm kurulumlar + atama
   ================================================================== */

function AdminKurulumView() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");

  const { data: kurulumlar = [] } = useQuery({
    queryKey: ["kurulumlar"],
    queryFn: getKurulumListAction,
  });
  const { data: montajKullanicilar = [] } = useQuery({
    queryKey: ["montaj-kullanicilar"],
    queryFn: getMontajKullanicilarAction,
  });

  const assignMut = useMutation({
    mutationFn: ({
      kurulumId,
      montajKullaniciId,
      kurulumTarihi,
    }: {
      kurulumId: string;
      montajKullaniciId: string;
      kurulumTarihi: string;
    }) => assignKurulumAction(kurulumId, montajKullaniciId, kurulumTarihi),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kurulumlar"] }),
  });

  const [assigning, setAssigning] = useState<string | null>(null);

  const filtered = filter
    ? kurulumlar.filter((k: any) => k.durum === filter)
    : kurulumlar;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Kurulumlar</h1>

      {/* Filtreler */}
      <div className="flex gap-2">
        {["", "planlandi", "tamamlandi", "iptal"].map((d) => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            className={`px-3 py-1 rounded-full text-xs border ${
              filter === d
                ? "bg-blue-600 border-blue-600 text-white"
                : "border-zinc-700 text-zinc-300"
            }`}
          >
            {d ? durumLabels[d] : "Tümü"}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="grid gap-3">
        {filtered.map((k: any) => (
          <div
            key={k._id}
            className="p-4 rounded-lg border border-zinc-800 bg-zinc-900"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="font-semibold text-white">
                  {k.urunId?.urunAdi ?? "—"}
                </p>
                <p className="text-xs text-zinc-400">
                  Sipariş: #{k.siparisId?.siparisNo ?? "—"} ·{" "}
                  Tarih:{" "}
                  {k.kurulumTarihi
                    ? new Date(k.kurulumTarihi).toLocaleDateString("tr-TR")
                    : "—"}
                </p>
                <p className="text-xs text-zinc-500">
                  {k.siparisId?.musteriId?._id ? (
                    <Link href={"/dashboard/musteri/" + k.siparisId.musteriId._id} className="text-blue-400 hover:underline">
                      {k.siparisId.musteriId.adSoyad}
                    </Link>
                  ) : k.siparisId?.musteriId?.adSoyad ?? ""}
                </p>
                <p className="text-xs text-zinc-500">
                  Atanan:{" "}
                  {k.montajKullaniciId?.adSoyad ?? "Atanmadı"}
                </p>
              </div>
              <span
                className={`text-sm font-medium ${durumRenk[k.durum] ?? ""}`}
              >
                {durumLabels[k.durum]}
              </span>
            </div>

            {/* Atama formu (planlandi ve atanmamış) */}
            {k.durum === "planlandi" && !k.montajKullaniciId && (
              <div className="mt-3">
                {assigning === k._id ? (
                  <div className="flex flex-wrap gap-2">
                    <select
                      className="p-1.5 rounded bg-zinc-800 border border-zinc-700 text-white text-xs"
                      onChange={(e) =>
                        assignMut.mutate({
                          kurulumId: k._id,
                          montajKullaniciId: e.target.value,
                          kurulumTarihi: new Date(
                            Date.now() + 7 * 86400000
                          ).toISOString(),
                        })
                      }
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Kullanıcı seç
                      </option>
                      {montajKullanicilar.map((u: any) => (
                        <option key={u._id} value={u._id}>
                          {u.adSoyad}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setAssigning(null)}
                      className="text-xs text-zinc-400"
                    >
                      İptal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAssigning(k._id)}
                    className="px-3 py-1 rounded text-xs bg-blue-600 text-white"
                  >
                    Ata
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-zinc-500 text-sm">Kurulum bulunamadı.</p>
        )}
      </div>
    </div>
  );
}

/* ==================================================================
   Montaj görünümü — kendi kurulumları + fotoğraf yükle + tamamla
   ================================================================== */

function MontajKurulumView() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const queryClient = useQueryClient();

  const { data: kurulumlar = [] } = useQuery({
    queryKey: ["montaj-kurulumlar", userId],
    queryFn: () => getMontajKurulumListAction(userId),
    enabled: !!userId,
  });

  // Her kurulum için fotoğraf yükleme state
  const [photoForms, setPhotoForms] = useState<
    Record<string, { uploading: boolean; aciklama: string }>
  >({});

  const [uploadError, setUploadError] = useState<string | null>(null);

  // Dosya referanslarını sakla
  const [photoFiles, setPhotoFiles] = useState<Record<string, File>>({});

  const uploadMut = useMutation({
    mutationFn: async ({
      kurulumId,
      aciklama,
    }: {
      kurulumId: string;
      aciklama: string;
    }) => {
      const file = photoFiles[kurulumId];
      if (!file) throw new Error("Lütfen bir dosya seçin");

      // File'ı base64'e çevir
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = `data:${file.type};base64,${btoa(binary)}`;

      if (base64.length > 6 * 1024 * 1024) {
        throw new Error("Fotoğraf çok büyük (max 5MB). Lütfen daha küçük bir fotoğraf seçin.");
      }

      const res = await uploadKurulumFotografiBase64Action(kurulumId, base64, aciklama);
      if (!res.success) throw new Error(res.error || "Yükleme başarısız");
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["montaj-kurulumlar", userId] });
    },
    onError: (err: Error) => {
      setUploadError(err.message);
    },
  });

  const completeMut = useMutation({
    mutationFn: (kurulumId: string) => completeKurulumAction(kurulumId),
    onSuccess: (res) => {
      if (!res.success) setUploadError(res.error || "Kurulum tamamlanamadı");
      else queryClient.invalidateQueries({ queryKey: ["montaj-kurulumlar", userId] });
    },
    onError: (err: Error) => {
      setUploadError(err.message);
    },
  });

  const planlandiKurulumlar = kurulumlar.filter(
    (k: any) => k.durum === "planlandi"
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Kurulumlarım</h1>

      {planlandiKurulumlar.length === 0 && (
        <p className="text-zinc-500 text-sm">
          Size atanmış planlanan kurulum bulunamadı.
        </p>
      )}

      {planlandiKurulumlar.map((k: any) => {
        const fotoCount =
          (k as any).fotograflar?.length ?? 0;
        const pf = photoForms[k._id] ?? {
          uploading: false,
          aciklama: "",
        };
        const hasFile = !!photoFiles[k._id];

        return (
          <div
            key={k._id}
            className="p-4 rounded-lg border border-zinc-800 bg-zinc-900 space-y-3"
          >
            <div>
              <p className="font-semibold text-white">
                {k.urunId?.urunAdi ?? "—"}
              </p>
              <p className="text-xs text-zinc-400">
                Sipariş: #{k.siparisId?.siparisNo ?? "—"} ·{" "}
                Tarih:{" "}
                {k.kurulumTarihi
                  ? new Date(k.kurulumTarihi).toLocaleDateString("tr-TR")
                  : "—"}
              </p>
            </div>

            {/* Fotoğraf yükleme */}
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="file"
                accept="image/*"
                className="text-xs text-zinc-300 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-zinc-700 file:text-white"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPhotoFiles((p) => ({ ...p, [k._id]: file }));
                  }
                }}
              />
              <input
                value={pf.aciklama}
                onChange={(e) =>
                  setPhotoForms((p) => ({
                    ...p,
                    [k._id]: { ...p[k._id], aciklama: e.target.value },
                  }))
                }
                placeholder="Açıklama"
                className="flex-1 min-w-[120px] p-1.5 rounded bg-zinc-800 border border-zinc-700 text-white text-xs"
              />
              <button
                disabled={!hasFile || pf.uploading}
                onClick={async () => {
                  setUploadError(null);
                  setPhotoForms((p) => ({
                    ...p,
                    [k._id]: { ...p[k._id], uploading: true },
                  }));
                  try {
                    await uploadMut.mutateAsync({
                      kurulumId: k._id,
                      aciklama: pf.aciklama,
                    });
                    setPhotoForms((p) => ({
                      ...p,
                      [k._id]: { uploading: false, aciklama: "" },
                    }));
                    setPhotoFiles((p) => {
                      const next = { ...p };
                      delete next[k._id];
                      return next;
                    });
                  } catch {
                    setPhotoForms((p) => ({
                      ...p,
                      [k._id]: { ...p[k._id], uploading: false },
                    }));
                  }
                }}
                className="px-3 py-1.5 rounded text-xs bg-blue-600 text-white disabled:opacity-40"
              >
                {pf.uploading ? "Yükleniyor..." : "Yükle"}
              </button>
            </div>

            {/* Hata mesajı */}
            {uploadError && (
              <p className="text-red-400 text-xs">{uploadError}</p>
            )}

            {/* Yüklenen fotoğraflar */}
            {(k as any).fotograflar?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(k as any).fotograflar.map((f: any) => (
                  <div key={f._id} className="relative group">
                    <img
                      src={f.resim}
                      alt={f.aciklama}
                      className="w-16 h-16 object-cover rounded border border-zinc-700"
                    />
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-white px-1 truncate">
                      {f.aciklama}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tamamla butonu — en az 1 fotoğraf gerekli */}
            <button
              disabled={fotoCount < 1}
              onClick={() => {
                setUploadError(null);
                completeMut.mutate(k._id);
              }}
              className={`px-4 py-2 rounded text-sm text-white ${
                fotoCount < 1
                  ? "bg-zinc-700 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Kurulumu Tamamla
              {fotoCount < 1 && " (önce fotoğraf yükleyin)"}
            </button>

            {completeMut.data && !completeMut.data.success && (
              <p className="text-red-400 text-xs">
                {completeMut.data.error}
              </p>
            )}
          </div>
        );
      })}

      {/* Geçmiş kurulumlar */}
      {kurulumlar.filter((k: any) => k.durum !== "planlandi").length > 0 && (
        <>
          <h2 className="text-lg font-bold text-zinc-400 pt-4">
            Geçmiş Kurulumlar
          </h2>
          {kurulumlar
            .filter((k: any) => k.durum !== "planlandi")
            .map((k: any) => (
              <div
                key={k._id}
                className="p-4 rounded-lg border border-zinc-800 bg-zinc-900"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">
                      {k.urunId?.urunAdi ?? "—"}
                    </p>
                    <p className="text-xs text-zinc-400">
                      #{k.siparisId?.siparisNo ?? "—"}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      durumRenk[k.durum] ?? ""
                    }`}
                  >
                    {durumLabels[k.durum]}
                  </span>
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  );
}

/* ==================================================================
   Ana bileşen — role göre yönlendir
   ================================================================== */

export default function KurulumPage() {
  const { data: session, status } = useSession();
  const rol = (session?.user as any)?.rol;

  if (status === "loading") {
    return (
      <div className="text-zinc-400 text-sm">Yükleniyor...</div>
    );
  }

  if (rol === "montaj") {
    return <MontajKurulumView />;
  }

  return <AdminKurulumView />;
}
