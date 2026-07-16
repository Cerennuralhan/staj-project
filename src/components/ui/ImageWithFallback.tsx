"use client";

import { useState } from "react";
import Image from "next/image";

type Props = Omit<React.ComponentProps<typeof Image>, "onError" | "src"> & {
  src: string;
  fallbackSrc?: string;
};

export function ImageWithFallback({
  src,
  fallbackSrc = "/images/placeholder.png",
  alt,
  ...rest
}: Props) {
  const [imgSrc, setImgSrc] = useState(src);

  if (!imgSrc || imgSrc.trim().length === 0) {
    return (
      <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600 text-xs">
        Görsel yok
      </div>
    );
  }

  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (fallbackSrc) setImgSrc(fallbackSrc);
      }}
    />
  );
}
