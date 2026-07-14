"use client";

import { useState, useEffect } from "react";
import { useUyeAuth } from "@/contexts/uye-auth-context";
import { getUyeProfileAction, updateUyeBultenTercihiAction } from "@/features/uye/actions";
import Link from "next/link";
import { ArrowLeft, Mail, Bell, User } from "lucide-react";

export default function ProfilPage() {
  const { uye, loading: authLoading } = useUyeAuth();
  const [bultenOnay, setBultenOnay] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!uye) return;
    setLoading(true);
    getUyeProfileAction(uye.id).then((data) => {
      if (data) {
        setBultenOnay(data.bultenOnay);
      }
      setLoading(false);
    });
  }, [uye]);

  async function handleToggle() {
    if (!uye) return;
    const yeniDeger = !bultenOnay;
    setBultenOnay(yeniDeger);
    setSaving(true);
    setMessage("");
    const res = await updateUyeBultenTercihiAction(uye.id, yeniDeger);
    setSaving(false);
    if (res.success) {
      setMessage(yeniDeger ? "Bülten aboneliğiniz aktifleştirildi." : "Bülten aboneliğiniz iptal edildi.");
    } else {
      setBultenOnay(!yeniDeger);
      setMessage(res.error || "Bir hata oluştu.");
    }
  }

  if (authLoading) {
    return <div className="mx-auto max-w-md px-4 py-16 text-center text-zinc-500">Yükleniyor...</div>;
  }

  if (!uye) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <p className="text-zinc-400">Bu sayfayı görüntülemek için giriş yapmalısınız.</p>
        <Link href="/hesap" className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition">
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <User size={20} className="text-blue-400" />
          Hesabım
        </h1>
      </div>

      {/* Profil Bilgileri */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <User size={16} className="text-blue-400" />
          Profil Bilgileri
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-zinc-500">Ad</p>
            <p className="text-sm text-white">{uye.ad}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Soyad</p>
            <p className="text-sm text-white">{uye.soyad}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-zinc-500">E-posta</p>
            <p className="text-sm text-white">{uye.eposta}</p>
          </div>
        </div>
      </div>

      {/* Bildirim Tercihleri */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Bell size={16} className="text-blue-400" />
          Bildirim Tercihleri
        </h2>

        {loading ? (
          <p className="text-sm text-zinc-500">Yükleniyor...</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">E-posta Bülteni</p>
                  <p className="text-xs text-zinc-500">Kampanya, indirim ve duyurular hakkında e-posta almak istiyorum.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggle}
                disabled={saving}
                role="switch"
                aria-checked={bultenOnay}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
                  bultenOnay ? "bg-green-600" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    bultenOnay ? "translate-x-[22px]" : "translate-x-[2px]"
                  }`}
                />
              </button>
            </div>
            {message && (
              <p className={`text-xs ${message.includes("hata") ? "text-red-400" : "text-green-400"}`}>
                {message}
              </p>
            )}
            {saving && <p className="text-xs text-zinc-500">Kaydediliyor...</p>}
          </div>
        )}
      </div>
    </div>
  );
}
