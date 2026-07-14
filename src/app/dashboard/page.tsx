import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Kurulum } from "@/features/kurulum/queries";
import { Garanti } from "@/features/garanti/queries";
import { Siparis } from "@/features/siparis/queries";
import { Urun } from "@/features/urun/queries";
import { TedarikSiparis } from "@/features/magaza/queries";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;
  const rol = (user as any).rol;

  await connectDB();

  const now = new Date();
  const ayBasi = new Date(now.getFullYear(), now.getMonth(), 1);
  const aySonu = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const haftaBasi = new Date(now);
  haftaBasi.setDate(now.getDate() - now.getDay());
  haftaBasi.setHours(0, 0, 0, 0);
  const otuzGunSonra = new Date(now.getTime() + 30 * 86400000);

  const [
    buHaftaKurulum,
    yaklasanGaranti,
    buAySiparis,
    buAySiparisToplam,
    kritikStok,
    bekleyenTedarik,
    toplamUrun,
    toplamMusteri,
    toplamSiparis,
  ] = await Promise.all([
    Kurulum.countDocuments({
      durum: "planlandi",
      kurulumTarihi: { $gte: haftaBasi, $lte: now },
    }),
    Garanti.countDocuments({
      garantiBitis: { $gte: now, $lte: otuzGunSonra },
    }),
    Siparis.countDocuments({
      siparisTarihi: { $gte: ayBasi, $lte: aySonu },
    }),
    Siparis.aggregate([
      { $match: { siparisTarihi: { $gte: ayBasi, $lte: aySonu } } },
      { $group: { _id: null, toplam: { $sum: "$toplamTutar" } } },
    ]).then((r) => (r[0]?.toplam ?? 0)),
    Urun.countDocuments({ stok: { $lt: 5 } }),
    TedarikSiparis.countDocuments({ durum: "beklemede" }),
    Urun.countDocuments(),
    (await import("@/features/musteri/queries")).Musteri.countDocuments(),
    Siparis.countDocuments(),
  ]);

  const cards = [
    { title: "Toplam Ürün", value: toplamUrun, color: "text-blue-400" },
    { title: "Toplam Müşteri", value: toplamMusteri, color: "text-green-400" },
    { title: "Toplam Sipariş", value: toplamSiparis, color: "text-purple-400" },
    { title: "Bu Hafta Kurulum", value: buHaftaKurulum, color: "text-yellow-400" },
    { title: "Yaklaşan Garanti (30g)", value: yaklasanGaranti, color: "text-orange-400" },
    { title: "Bu Ay Sipariş", value: buAySiparis, color: "text-cyan-400" },
    { title: "Bu Ay Ciro", value: `${buAySiparisToplam.toLocaleString("tr-TR")} TL`, color: "text-emerald-400" },
    { title: "Kritik Stok (<5)", value: kritikStok, color: "text-red-400" },
    { title: "Bekleyen Tedarik", value: bekleyenTedarik, color: "text-pink-400" },
  ];

  // Roller: montaj sadece kurulum görsün
  const rolCards = rol === "montaj"
    ? cards.filter((c) => c.title.includes("Kurulum"))
    : cards;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">
          {user.name} — {rol}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rolCards.map((card) => (
          <div
            key={card.title}
            className="p-5 rounded-xl border border-zinc-800 bg-zinc-900"
          >
            <h3 className="text-sm text-zinc-400 font-medium">{card.title}</h3>
            <p className={`text-3xl font-bold mt-2 ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
