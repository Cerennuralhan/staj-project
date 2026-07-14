"use client";

import { useState } from "react";
import { submitIletisim } from "@/features/magaza/public-actions";

export function IletisimFormu() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = new FormData(e.currentTarget);
      const res = await submitIletisim({
        adSoyad: data.get("adSoyad") as string,
        telefon: data.get("telefon") as string,
        eposta: data.get("eposta") as string,
        mesaj: data.get("mesaj") as string,
      });
      if (!res.success) {
        setError(res.error || "Bir hata oluştu");
        return;
      }
      setSent(true);
    } catch {
      setError("Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return <p className="text-accent text-sm">Mesajınız gönderildi. Teşekkür ederiz.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="rounded-lg bg-danger-light border border-danger px-4 py-2 text-sm text-red-300 text-center">
          {error}
        </div>
      )}
      <input name="adSoyad" placeholder="Ad Soyad" required
        className="w-full p-2.5 rounded bg-card border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-primary" />
      <input name="telefon" placeholder="Telefon"
        className="w-full p-2.5 rounded bg-card border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-primary" />
      <input name="eposta" type="email" placeholder="E-posta" required
        className="w-full p-2.5 rounded bg-card border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-primary" />
      <textarea name="mesaj" placeholder="Mesajınız" required rows={4}
        className="w-full p-2.5 rounded bg-card border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-primary" />
      <button type="submit" disabled={loading}
        className="w-full p-2.5 rounded bg-primary hover:bg-primary-hover text-foreground font-medium transition disabled:opacity-50">
        {loading ? "Gönderiliyor..." : "Gönder"}
      </button>
    </form>
  );
}
