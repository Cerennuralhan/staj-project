import type { ObjectId } from "mongoose";

export interface Favori {
  _id: string;
  uyeId: string | ObjectId;
  urunId: string | ObjectId;
  tarih: string;
  createdAt: string;
  updatedAt: string;
}
