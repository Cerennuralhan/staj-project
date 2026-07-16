"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getIletisimMesajiByIdAction } from "@/features/magaza/actions";
import { hasPermission } from "@/lib/auth/permissions";
import { X, Loader2, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

export default function MesajDetayPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { mesajId } = useParams();
  const [mesaj, setMesaj] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const rol = (session?.user as any)?.rol as string | undefined;

  useEffect(() => {
    if (rol && !hasPermission(rol as any, "mesaj")) {
      router.replace("/dashboard");
      return;
    }
    if (!mesajId || !rol) return;

    setLoading(true);
    getIletisimMesajiByIdAction(mesajId as string)
      .then((data) => {
        if (!data) {
          setError("Mesaj bulunamadı veya erişim izniniz yok.");
        } else {
          setMesaj(data);
        }
      })
      .catch(() => setError("Mesaj yüklenirken bir hata oluştu."))
      .finally(() => setLoading(false));
  }, [mesajId, rol, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-zinc-500" size={32} />
      </div>
    );
  }

  if (error || !mesaj) {
    return (
      <div className="text-center py-20 space-y-4">
        <Mail size={48} className="text-zinc-600 mx-auto" />
        <p className="text-zinc-400">{error || "Mesaj bulunamadı."}</p>
        <button
          onClick={() => router.push("/dashboard/mesajlar")}
          className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline"
        >
          <ArrowLeft size={14} /> Mesajlara Dön
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <button
        onClick={() => router.push("/dashboard/mesajlar")}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft size={14} /> Mesajlara Dön
      </button>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold text-white">Mesaj Detayı</h2>
        </div>

        <div className="text-sm text-zinc-300 space-y-2">
          <p>
            <span className="text-zinc-500">Ad Soyad:</span>{" "}
            {mesaj.musteriId?._id ? (
              <Link href={"/dashboard/musteri/" + mesaj.musteriId._id} className="text-blue-400 hover:underline">
                {mesaj.adSoyad}
              </Link>
            ) : (
              mesaj.adSoyad
            )}
          </p>
          <p>
            <span className="text-zinc-500">E-posta:</span>{" "}
            <a href={`mailto:${mesaj.eposta}`} className="text-blue-400 hover:underline">
              {mesaj.eposta}
            </a>
          </p>
          {mesaj.telefon && (
            <p>
              <span className="text-zinc-500">Telefon:</span>{" "}
              <a href={`tel:${mesaj.telefon}`} className="text-blue-400 hover:underline">
                {mesaj.telefon}
              </a>
            </p>
          )}
          <p>
            <span className="text-zinc-500">Tarih:</span>{" "}
            {new Date(mesaj.tarih).toLocaleString("tr-TR")}
          </p>
        </div>

        <hr className="border-zinc-700" />

        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Mesaj</h3>
          <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">{mesaj.mesaj}</p>
        </div>
      </div>
    </div>
  );
}
