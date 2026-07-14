import type { ObjectId } from "mongoose";

export interface Garanti {
  _id: string;
  siparisId: string | ObjectId;
  musteriId: string | ObjectId;
  urunId: string | ObjectId;
  seriNo?: string;
  garantiBaslangic: string;
  garantiBitis: string;
  durum: "aktif" | "suresi_doldu";
  createdAt: string;
  updatedAt: string;
}

export interface GarantiTalebi {
  _id: string;
  garantiId: string | ObjectId;
  aciklama: string;
  durum: "acik" | "inceleniyor" | "cozuldu";
  cozumTuru?: "urun_incelendi" | "kullanici_hatasi";
  createdAt: string;
  updatedAt: string;
}
