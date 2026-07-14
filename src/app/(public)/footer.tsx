import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="public-footer border-t border-[#4A4540] bg-[#3D3833]">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-[#F0EBE3] mb-3">DEMİRAY Mobilya</h3>
            <p className="text-sm text-[#B0A89E] leading-relaxed">
              Kaliteli ve şık mobilyalarla yaşam alanlarınızı güzelleştiriyoruz.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="text-sm font-semibold text-[#F0EBE3] mb-3">Hızlı Linkler</h4>
            <div className="space-y-2 text-sm text-[#B0A89E]">
              <Link href="/" className="block hover:text-[#F0EBE3] transition-colors">Ana Sayfa</Link>
              <Link href="/urunler" className="block hover:text-[#F0EBE3] transition-colors">Ürünler</Link>
              <Link href="/koleksiyonlar" className="block hover:text-[#F0EBE3] transition-colors">Koleksiyonlar</Link>
              <Link href="/galeri" className="block hover:text-[#F0EBE3] transition-colors">Galeri</Link>
            </div>
          </div>

          {/* Müşteri Hizmetleri */}
          <div>
            <h4 className="text-sm font-semibold text-[#F0EBE3] mb-3">Müşteri Hizmetleri</h4>
            <div className="space-y-2 text-sm text-[#B0A89E]">
              <Link href="/iletisim" className="block hover:text-[#F0EBE3] transition-colors">İletişim</Link>
              <Link href="/hakkimizda" className="block hover:text-[#F0EBE3] transition-colors">Hakkımızda</Link>
              <Link href="/magaza" className="block hover:text-[#F0EBE3] transition-colors">Mağazalar</Link>
            </div>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="text-sm font-semibold text-[#F0EBE3] mb-3">İletişim</h4>
            <div className="space-y-2 text-sm text-[#B0A89E]">
              <p>info@demiray.com</p>
              <p>+90 (212) 555 0123</p>
              <p>İstanbul, Türkiye</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#4A4540] text-center text-sm text-[#8A827A]">
          <p>© {new Date().getFullYear()} Demiray Mobilya. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
