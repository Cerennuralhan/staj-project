import type { ObjectId } from "mongoose";

export interface SepetUrun {
  urunId: string | ObjectId;
  adet: number;
}

export interface Sepet {
  _id: string;
  uyeId?: string | ObjectId;
  misafirSepetId?: string;
  urunler: SepetUrun[];
  guncellemeTarihi: string;
  createdAt: string;
  updatedAt: string;
}
