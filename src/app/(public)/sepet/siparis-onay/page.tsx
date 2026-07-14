"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

function OnayContent() {
  const searchParams = useSearchParams();
  const siparisNo = searchParams.get("siparisNo") || "";

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <CheckCircle size={56} className="text-green-500 mx-auto mb-6" />
      <h1 className="text-2xl font-bold text-white mb-2">Siparişiniz Alındı!</h1>
      <p className="text-zinc-400 mb-1">Sipariş numaranız:</p>
      <p className="text-xl font-mono font-bold text-blue-400 mb-6">{siparisNo}</p>
      <p className="text-sm text-zinc-500 mb-8">
        Siparişiniz en kısa sürede hazırlanıp size teslim edilecektir.
      </p>
      <Link
        href="/"
        className="inline-block rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}

export default function SiparisOnayPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-zinc-500">Yükleniyor...</div>}>
      <OnayContent />
    </Suspense>
  );
}
