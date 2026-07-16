"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { getAllowedModules } from "@/lib/auth/permissions";
import type { Rol } from "@/lib/auth/permissions";

const menuConfig: Record<string, { label: string; href: string }> = {
  urun: { label: "Ürünler", href: "/dashboard/urun" },
  musteri: { label: "Müşteriler", href: "/dashboard/musteri" },
  siparis: { label: "Siparişler", href: "/dashboard/siparis" },
  kurulum: { label: "Kurulumlar", href: "/dashboard/kurulum" },
  garanti: { label: "Garantiler", href: "/dashboard/garanti" },
  magaza: { label: "Mağaza", href: "/dashboard/magaza" },
  auth: { label: "Kullanıcılar", href: "/dashboard/kullanicilar" },
  tedarikci: { label: "Tedarikçiler", href: "/dashboard/tedarikci" },
  kategori: { label: "Kategoriler", href: "/dashboard/kategori" },
  mesaj: { label: "Mesajlar", href: "/dashboard/mesajlar" },
};

interface Props {
  rol: Rol;
  userName: string;
}

export function DashboardSidebar({ rol, userName }: Props) {
  const pathname = usePathname();
  const allowedModules = getAllowedModules(rol);

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="p-5 border-b border-zinc-800">
        <h2 className="text-white font-bold text-lg">Demiray</h2>
        <p className="text-zinc-400 text-xs mt-1">
          {userName} · {rol}
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <Link
          href="/dashboard"
          className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition ${
            pathname === "/dashboard"
              ? "bg-blue-600 text-white"
              : "text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          <span>Ana Sayfa</span>
        </Link>

        <div className="border-t border-zinc-800 my-2" />

        {allowedModules.map((modul) => {
          const cfg = menuConfig[modul];
          if (!cfg) return null;
          return (
            <Link
              key={modul}
              href={cfg.href}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition ${
                pathname.startsWith(cfg.href)
                  ? "bg-blue-600 text-white"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              <span>{cfg.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-zinc-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition text-left"
        >
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
