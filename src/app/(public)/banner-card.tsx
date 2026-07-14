import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  baslik: string;
  aciklama?: string;
  butonYazisi?: string;
  butonLinki?: string;
  resim?: string;
}

export function BannerCard({ baslik, aciklama, butonYazisi, butonLinki, resim }: Props) {
  return (
    <Link
      href={butonLinki || "#"}
      className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-surface-alt shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
    >
      {resim && (
        <img
          src={resim}
          alt={baslik}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700"
        />
      )}

      {/* Buzlu cam panel — alt üçte birlik bölüm */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 min-h-[100px] rounded-t-2xl p-5 flex flex-col justify-center"
        style={{ backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
        <h3 className="text-lg font-bold text-[#2D2A27] leading-snug">{baslik}</h3>
        {aciklama && (
          <p className="text-sm mt-0.5" style={{ color: "#374151" }}>{aciklama}</p>
        )}
        {butonYazisi && (
          <span className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-primary group-hover:text-primary-hover transition-colors">
            {butonYazisi}
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
        )}
      </div>
    </Link>
  );
}
