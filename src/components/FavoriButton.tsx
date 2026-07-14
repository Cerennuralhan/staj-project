"use client";

import { useUyeAuth } from "@/contexts/uye-auth-context";
import { favoriEkleAction, favoriSilAction, favoriListAction } from "@/features/favori/public-actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGateModal } from "./AuthGateModal";
import { Heart, Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  urunId: string;
  className?: string;
}

export function FavoriButton({ urunId, className = "" }: Props) {
  const { uye } = useUyeAuth();
  const queryClient = useQueryClient();
  const [gateOpen, setGateOpen] = useState(false);

  const { data: favoriler = [] } = useQuery({
    queryKey: ["favorilerim", uye?.id],
    queryFn: () => favoriListAction(uye!.id),
    enabled: !!uye,
  });

  const favoriIds = new Set(
    favoriler.map((fav: any) =>
      typeof fav.urunId === "string" ? fav.urunId : fav.urunId?._id
    ).filter(Boolean)
  );
  const isFavori = favoriIds.has(urunId);

  const [mutating, setMutating] = useState(false);

  const handleClick = async () => {
    if (!uye) {
      setGateOpen(true);
      return;
    }

    setMutating(true);
    if (isFavori) {
      await favoriSilAction(uye.id, urunId);
    } else {
      await favoriEkleAction(uye.id, urunId);
    }
    queryClient.invalidateQueries({ queryKey: ["favorilerim"] });
    setMutating(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={mutating}
        className={`p-1.5 rounded-full transition ${className} ${
          isFavori
            ? "text-red-400 hover:text-red-300"
            : "text-muted hover:text-danger"
        }`}
        aria-label={isFavori ? "Favorilerden çıkar" : "Favorilere ekle"}
      >
        {mutating ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Heart size={16} fill={isFavori ? "currentColor" : "none"} />
        )}
      </button>

      <AuthGateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        type="favori"
        urunId={urunId}
        onSuccess={() => {
          setGateOpen(false);
          queryClient.invalidateQueries({ queryKey: ["favorilerim"] });
        }}
      />
    </>
  );
}
