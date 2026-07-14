"use client";

import { Suspense, useState } from "react";
import { sifreSifirlamaUygulaAction } from "@/features/uye/actions";
import { useRouter, useSearchParams } from "next/navigation";

function SifreSifirlaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const eposta = searchParams.get("eposta") || "";

  const [sifre, setSifre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sifre.length < 6) return setError("Şifre en az 6 karakter olmalıdır");
    setError("");
    setLoading(true);
    const fd = new FormData();
    fd.set("token", token);
    fd.set("eposta", eposta);
    fd.set("sifre", sifre);
    const res = await sifreSifirlamaUygulaAction(fd);
    setLoading(false);
    if (!res.success) return setError(res.error || "Bir hata oluştu");
    setSuccess(true);
  };

  if (!token || !eposta) {
    return <p className="text-center text-muted py-16">Geçersiz bağlantı.</p>;
  }

  if (success) {
    return (
      <div className="text-center py-16">
        <p className="text-accent mb-2">Şifreniz başarıyla değiştirildi.</p>
        <button onClick={() => router.push("/hesap")} className="text-primary hover:underline text-sm">
          Giriş yap
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      {error && (
        <div className="mb-4 rounded-lg bg-danger-light border border-danger px-4 py-2 text-sm text-red-300 text-center">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-muted mb-1 block">Yeni Şifre</label>
          <input type="password" required value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            className="w-full rounded-lg bg-surface-alt border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            placeholder="En az 6 karakter"
          />
        </div>
        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-foreground hover:bg-primary-hover transition disabled:opacity-50"
        >
          {loading ? "Değiştiriliyor..." : "ŞİFREYİ DEĞİŞTİR"}
        </button>
      </form>
    </div>
  );
}

export default function SifreSifirlaPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-muted-darker">Yükleniyor...</div>}>
      <SifreSifirlaForm />
    </Suspense>
  );
}
