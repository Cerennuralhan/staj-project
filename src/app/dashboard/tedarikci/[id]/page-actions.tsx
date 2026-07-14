"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { Tedarikci } from "@/features/tedarikci/types";
import { TedarikciEditModal } from "./edit-modal";

export function TedarikciPageActions({ tedarikci }: { tedarikci: Tedarikci }) {
  const [showEdit, setShowEdit] = useState(false);

  return (
    <>
      <button onClick={() => setShowEdit(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2 text-sm font-semibold text-white transition">
        <Pencil size={16} />
        Düzenle
      </button>
      {showEdit && (
        <TedarikciEditModal tedarikci={tedarikci} onClose={() => setShowEdit(false)} />
      )}
    </>
  );
}
