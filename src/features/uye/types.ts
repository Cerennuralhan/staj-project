import type { ObjectId } from "mongoose";

export interface Uye {
  _id: string;
  ad: string;
  soyad: string;
  eposta: string;
  cepTelefonu: string;
  sifre: string;
  kvkkOnay: boolean;
  bultenOnay: boolean;
  sifreSifirlamaTokeni?: string;
  sifreSifirlamaSonTarih?: string;
  olusturmaTarihi: string;
  createdAt: string;
  updatedAt: string;
}
