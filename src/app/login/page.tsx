"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        eposta,
        sifre,
        redirect: false,
      });

      if (result?.error) {
        setError("E-posta veya şifre hatalı.");
      } else {
        router.push("/dashboard");
        return;
      }
    } catch (err) {
      setError("Giriş yapılırken bir hata oluştu.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 space-y-5 rounded-xl border border-zinc-800 bg-zinc-900"
      >
        <h1 className="text-2xl font-bold text-white text-center">
          Demiray Mobilya
        </h1>
        <p className="text-sm text-zinc-400 text-center">Yönetim Paneli</p>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/20 p-3 rounded-md text-center">
            {error}
          </p>
        )}

        <div className="space-y-1">
          <label className="text-sm text-zinc-300">E-posta</label>
          <input
            name="eposta"
            type="email"
            required
            value={eposta}
            onChange={(e) => setEposta(e.target.value)}
            className="w-full p-2.5 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-zinc-300">Şifre</label>
          <input
            name="sifre"
            type="password"
            required
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            className="w-full p-2.5 rounded bg-zinc-800 border border-zinc-700 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </main>
  );
}
