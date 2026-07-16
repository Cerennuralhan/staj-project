import Link from "next/link";
import { getSiparisByIdAction } from "@/features/siparis/actions";
import { connectDB } from "@/lib/db";
import { Kurulum } from "@/features/kurulum/queries";
import { Garanti } from "@/features/garanti/queries";
import { notFound } from "next/navigation";
import { DurumActions } from "./actions";

export default async function SiparisDetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const _siparis = await getSiparisByIdAction(id);
  if (!_siparis) notFound();
  const siparis: any = _siparis;

  await connectDB();
  const [kurulumlar, rawGarantiler] = await Promise.all([
    Kurulum.find({ siparisId: id }).lean(),
    Garanti.find({ siparisId: id }).populate("urunId", "urunAdi kapakResmi").lean(),
  ]);

  const garantiler = rawGarantiler.map((g: any) => {
    const kalanGun = Math.ceil((new Date(g.garantiBitis).getTime() - Date.now()) / 86400000);
    return { ...g, durum: kalanGun >= 0 ? "aktif" : "suresi_doldu", kalanGun: Math.max(kalanGun, 0) };
  });

  const durumRenk: Record<string, string> = {
    beklemede: "text-yellow-400", onaylandi: "text-blue-400",
    hazirlaniyor: "text-purple-400", kargoda: "text-cyan-400",
    teslim_edildi: "text-green-400", iptal: "text-red-400",
  };

  const durumLabels: Record<string, string> = {
    beklemede: "Beklemede", onaylandi: "Onaylandı", hazirlaniyor: "Hazırlanıyor",
    kargoda: "Kargoda", teslim_edildi: "Teslim Edildi", iptal: "İptal",
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Başlık + durum */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Sipariş #{siparis.siparisNo}</h1>
        <div className="flex items-center gap-3">
          <span className={`text-lg font-semibold ${durumRenk[siparis.durum] ?? ""}`}>{durumLabels[siparis.durum]}</span>
          <DurumActions siparisId={siparis._id} mevcutDurum={siparis.durum} />
        </div>
      </div>

      {/* Sipariş bilgisi */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-2">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase">Genel</h2>
          <p className="text-white">Toplam Tutar: <span className="text-blue-400 font-bold">{siparis.toplamTutar} TL</span></p>
          <p className="text-zinc-300 text-sm">Tarih: {new Date(siparis.siparisTarihi).toLocaleDateString("tr-TR")}</p>
        </div>
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-2">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase">Müşteri</h2>
          {siparis.musteriId ? (
            <>
              <p className="text-white">
                <Link href={"/dashboard/musteri/" + siparis.musteriId._id} className="text-blue-400 hover:underline cursor-pointer">
                  {siparis.musteriId.adSoyad}
                </Link>
              </p>
              {siparis.musteriId.telefon && (
                <p className="text-zinc-300 text-sm"><a href={`tel:${siparis.musteriId.telefon}`} className="text-blue-400 hover:underline">{siparis.musteriId.telefon}</a></p>
              )}
              {siparis.musteriId.eposta && (
                <p className="text-zinc-300 text-sm"><a href={`mailto:${siparis.musteriId.eposta}`} className="text-blue-400 hover:underline">{siparis.musteriId.eposta}</a></p>
              )}
            </>
          ) : (
            <p className="text-zinc-500 text-sm">—</p>
          )}
        </div>
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-2">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase">Ürünler ({siparis.urunler.length})</h2>
          {siparis.urunler.map((u: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
              {u.kapakResmi && <img src={u.kapakResmi} alt="" className="w-8 h-8 rounded object-cover" />}
              <span className="flex-1">{u.urunAdi}</span>
              <span>{u.adet} × {u.fiyat} TL</span>
            </div>
          ))}
        </div>
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-1">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase">Teslimat Adresi</h2>
          <p className="text-zinc-300 text-sm whitespace-pre-line">{siparis.dinamikTeslimatAdresi}</p>
        </div>
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-1">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase">Fatura Adresi</h2>
          <p className="text-zinc-300 text-sm whitespace-pre-line">{siparis.dinamikFaturaAdresi}</p>
        </div>
      </div>

      {/* Kurulumlar */}
      <section className="p-5 rounded-xl border border-zinc-800 bg-zinc-900">
        <h2 className="text-lg font-semibold text-white mb-3">Kurulumlar ({kurulumlar.length})</h2>
        {kurulumlar.length === 0 ? (
          <p className="text-zinc-500 text-sm">Henüz kurulum kaydı yok. Sipariş onaylanınca otomatik oluşur.</p>
        ) : (
          <div className="space-y-2">
            {kurulumlar.map((k: any) => (
              <div key={k._id} className="flex justify-between items-center p-3 rounded bg-zinc-800/50">
                <p className="text-sm text-zinc-300">Ürün ID: {k.urunId?.toString()}</p>
                <span className={`text-xs font-medium ${k.durum === "tamamlandi" ? "text-green-400" : k.durum === "planlandi" ? "text-yellow-400" : "text-red-400"}`}>{k.durum}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Garantiler */}
      <section className="p-5 rounded-xl border border-zinc-800 bg-zinc-900">
        <h2 className="text-lg font-semibold text-white mb-3">Garantiler ({garantiler.length})</h2>
        {garantiler.length === 0 ? (
          <p className="text-zinc-500 text-sm">Garanti kaydı bulunmuyor.</p>
        ) : (
          <div className="space-y-2">
            {garantiler.map((g: any) => (
              <div key={g._id} className="flex justify-between items-center p-3 rounded bg-zinc-800/50">
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">{g.urunId?.urunAdi || "Ürün"}</p>
                  <p className="text-xs text-zinc-400">{new Date(g.garantiBaslangic).toLocaleDateString("tr-TR")} — {new Date(g.garantiBitis).toLocaleDateString("tr-TR")}</p>
                </div>
                <span className={`text-xs font-medium ${g.durum === "aktif" ? "text-green-400" : "text-red-400"}`}>{g.durum === "aktif" ? "Aktif" : "Süresi Doldu"}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
