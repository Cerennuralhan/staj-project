"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { SearchOverlay } from "./search-overlay";
import { useUyeAuth } from "@/contexts/uye-auth-context";
import { AuthGateModal } from "@/components/AuthGateModal";
import { useQuery } from "@tanstack/react-query";
import { sepetDetayliGetirAction } from "@/features/sepet/public-actions";
import { getOrCreateMisafirSepetId } from "@/lib/sepet-cookie";

const navLinks = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Koleksiyonlar", href: "/koleksiyonlar" },
  { label: "Ürünler", href: "/urunler" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "İletişim", href: "/iletisim" },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const { uye, logout } = useUyeAuth();

  const [misafirId, setMisafirId] = useState("");

  useEffect(() => {
    setMisafirId(getOrCreateMisafirSepetId());
  }, []);

  const { data: sepetData } = useQuery({
    queryKey: ["sepet", uye?.id, misafirId],
    queryFn: () => sepetDetayliGetirAction(uye?.id, uye ? undefined : misafirId),
    enabled: !!uye || misafirId.length > 0,
  });
  const sepetAdet = sepetData?.urunler?.reduce((t: number, u: any) => t + u.adet, 0) || 0;

  return (
    <>
      <header className="public-header sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">D</span>
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              DEMİRAY <span className="text-primary">Mobilya</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-foreground-secondary">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-foreground transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-3 text-muted">
            <button onClick={() => setSearchOpen(true)} className="hover:text-foreground transition-colors p-1" aria-label="Arama">
              <Search size={20} />
            </button>

            {/* Kullanıcı */}
            {uye ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="hover:text-foreground transition-colors p-1 flex items-center gap-1.5"
                  aria-label="Hesap"
                >
                  <User size={20} />
                  <span className="text-xs hidden sm:inline max-w-[80px] truncate">{uye.ad}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border-strong bg-card py-2 shadow-xl z-20">
                      <p className="px-3 py-1 text-xs text-muted truncate">{uye.ad} {uye.soyad}</p>
                      <p className="px-3 pb-2 text-xs text-muted-darker truncate border-b border-border">{uye.eposta}</p>
                      <Link href="/hesap/profil" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-surface-alt transition"
                      >
                        <User size={14} /> Hesabım
                      </Link>
                      <Link href="/siparislerim" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-surface-alt transition"
                      >
                        <Package size={14} /> Siparişlerim
                      </Link>
                      <Link href="/favorilerim" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-surface-alt transition"
                      >
                        <Heart size={14} /> Favorilerim
                      </Link>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-surface-alt transition"
                      >
                        <LogOut size={14} /> Çıkış Yap
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/hesap" className="hover:text-foreground transition-colors p-1" aria-label="Hesap">
                <User size={20} />
              </Link>
            )}

            {/* Favori — gate modal açar */}
            <button
              onClick={() => {
                if (uye) { router.push("/favorilerim"); }
                else { setGateOpen(true); }
              }}
              className="hover:text-foreground transition-colors p-1" aria-label="Favoriler"
            >
              <Heart size={20} />
            </button>

            <Link href="/sepet" className="relative hover:text-foreground transition-colors p-1" aria-label="Sepet">
              <ShoppingBag size={20} />
              {sepetAdet > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 flex items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground leading-none min-w-[16px] h-4 px-1">
                  {sepetAdet > 99 ? "99+" : sepetAdet}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden hover:text-foreground transition-colors p-1"
              aria-label="Menü"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-white px-4 py-4 space-y-3">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AuthGateModal open={gateOpen} onClose={() => setGateOpen(false)} type="favori" />
    </>
  );
}
