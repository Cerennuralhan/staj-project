"use client";

import { Printer } from "lucide-react";

export function YazdirButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2 text-sm font-semibold text-white transition"
    >
      <Printer size={16} />
      YAZDIR
    </button>
  );
}
