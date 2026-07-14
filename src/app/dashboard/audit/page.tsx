"use client";

import { useQuery } from "@tanstack/react-query";
import { getIslemKayitlariAction } from "@/features/auth/actions";

export default function AuditPage() {
  const { data: kayitlar = [] } = useQuery({ queryKey: ["islem-kayitlari"], queryFn: getIslemKayitlariAction });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">İşlem Kayıtları</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 text-left">
              <th className="pb-2 pr-4">Tarih</th>
              <th className="pb-2 pr-4">Kullanıcı</th>
              <th className="pb-2 pr-4">İşlem</th>
              <th className="pb-2 pr-4">Koleksiyon</th>
            </tr>
          </thead>
          <tbody>
            {kayitlar.map((k: any) => (
              <tr key={k._id} className="border-b border-zinc-800/50 text-zinc-300">
                <td className="py-2 pr-4 text-xs">{new Date(k.tarih).toLocaleString("tr-TR")}</td>
                <td className="py-2 pr-4">{k.kullaniciId?.adSoyad ?? "—"}</td>
                <td className="py-2 pr-4">{k.islem}</td>
                <td className="py-2 pr-4 text-zinc-500">{k.koleksiyon}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {kayitlar.length === 0 && <p className="text-zinc-500 text-sm mt-4">İşlem kaydı bulunamadı.</p>}
      </div>
    </div>
  );
}
