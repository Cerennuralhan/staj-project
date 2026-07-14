"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  _id: string;
  baslik?: string;
  resim?: string;
  butonYazisi?: string;
  butonLinki?: string;
}

interface Props {
  slides: Slide[];
}

export function HeroCarousel({ slides }: Props) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const len = slides.length;

  const goTo = useCallback(
    (index: number) => {
      if (index < 0) setCurrent(len - 1);
      else if (index >= len) setCurrent(0);
      else setCurrent(index);
    },
    [len]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (len <= 1 || isHovered) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(next, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [len, isHovered, next]);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.touches[0].clientX);
  const handleTouchEnd = () => {
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  };

  if (len === 0) return null;

  return (
    <section
      className="relative w-full h-[70vh] min-h-[400px] bg-[#3D3833] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, i) => (
        <div
          key={slide._id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          {slide.resim && (
            <img src={slide.resim} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 hero-overlay" />
          <div className="relative z-10 flex h-full items-center px-6 md:px-16 max-w-7xl mx-auto">
            <div className="max-w-lg">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                {slide.baslik || "DEMİRAY Mobilya"}
              </h1>
              {slide.butonYazisi && (
                <Link
                  href={slide.butonLinki || "#"}
                  className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition"
                >
                  {slide.butonYazisi}
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Oklar — sadece 1+ slayt varsa */}
      {len > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition"
            aria-label="Önceki slayt"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition"
            aria-label="Sonraki slayt"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Noktalar — sadece 1+ slayt varsa */}
      {len > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-8 h-2.5 bg-white"
                  : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Slayt ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
