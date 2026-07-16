"use server";

import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db";
import { Tedarikci } from "@/features/tedarikci/queries";
import { Magaza } from "@/features/magaza/queries";
import { Fatura, FaturaSayac } from "./queries";
import { faturaSchema } from "./schema";
import type { Fatura as FaturaType } from "./types";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import InvoicePdfDocument from "@/components/pdf/InvoicePdfDocument";
import { uploadBase64 } from "@/lib/cloudinary";
import { logIslem } from "@/lib/audit";
import { revalidatePath } from "next/cache";

const KDV_ORANLARI = [0, 1, 10, 20] as const;

/* ---------- Yardımcı: kuruş bazında para hesaplama ---------- */

function toKurus(tl: number): number {
  return Math.round(tl * 100);
}

function tlFromKurus(k: number): number {
  return k / 100;
}

function calcKalem(
  adet: number,
  birimFiyat: number,
  kdvOrani: number,
) {
  const kAdet = toKurus(birimFiyat);
  const araToplamKurus = kAdet * adet;
  const kdvTutariKurus = Math.round(araToplamKurus * kdvOrani / 100);
  return {
    araToplam: tlFromKurus(araToplamKurus),
    kdvTutari: tlFromKurus(kdvTutariKurus),
    araToplamKurus,
    kdvTutariKurus,
  };
}

/* ---------- Fatura Numarası Üretme ---------- */

async function siradakiFaturaNo(): Promise<string> {
  const yil = new Date().getFullYear();
  const key = `fatura-${yil}`;

  const sayac = await FaturaSayac.findByIdAndUpdate(
    key,
    { $inc: { sira: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const sira = String(sayac.sira).padStart(4, "0");
  return `FTR-${yil}-${sira}`;
}

/* ---------- Fatura Oluşturma ---------- */

export async function createFaturaAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Oturum gerekli" };
  }

  const parsed = faturaSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Doğrulama hatası", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { tedarikciId, kalemler, odemeSekli, vadeTarihi, teslimatNotu } = parsed.data;

  try {
    await connectDB();

    /* Tedarikçi bilgilerini çek - eksik alan kontrolü */
    const tedarikci = await Tedarikci.findById(tedarikciId).lean();
    if (!tedarikci) {
      return { success: false, error: "Tedarikçi bulunamadı" };
    }

    const eksikAlanlar: string[] = [];
    if (!tedarikci.firmaAdi) eksikAlanlar.push("Firma Adı");
    if (!tedarikci.adres) eksikAlanlar.push("Adres");
    if (!tedarikci.telefon) eksikAlanlar.push("Telefon");
    if (!tedarikci.vergiDairesi) eksikAlanlar.push("Vergi Dairesi");
    if (!tedarikci.vergiNo) eksikAlanlar.push("Vergi No");

    if (eksikAlanlar.length > 0) {
      return {
        success: false,
        error: `Tedarikçi bilgileri eksik: ${eksikAlanlar.join(", ")}`,
      };
    }

    /* Mağaza bilgilerini çek */
    const magaza = await Magaza.findOne().lean();

    /* Backend'de hesaplamaları yeniden yap */
    let genelAraToplamKurus = 0;
    let genelKdvTutariKurus = 0;
    const hesaplananKalemler = kalemler.map((k) => {
      const { araToplam, kdvTutari, araToplamKurus, kdvTutariKurus } = calcKalem(
        k.adet,
        k.birimFiyat,
        k.kdvOrani,
      );
      genelAraToplamKurus += araToplamKurus;
      genelKdvTutariKurus += kdvTutariKurus;
      return {
        urunAdi: k.urunAdi,
        adet: k.adet,
        birimFiyat: k.birimFiyat,
        kdvOrani: k.kdvOrani,
        araToplam,
        kdvTutari,
      };
    });

    const araToplam = tlFromKurus(genelAraToplamKurus);
    const kdvTutari = tlFromKurus(genelKdvTutariKurus);
    const genelToplam = tlFromKurus(genelAraToplamKurus + genelKdvTutariKurus);

    /* Fatura numarası üret */
    const faturaNo = await siradakiFaturaNo();

    /* Tarih formatı */
    const bugun = new Date().toLocaleDateString("tr-TR", {
      day: "numeric", month: "long", year: "numeric",
    });

    const vadeStr = vadeTarihi
      ? new Date(vadeTarihi).toLocaleDateString("tr-TR", {
          day: "numeric", month: "long", year: "numeric",
        })
      : undefined;

    /* PDF oluştur */
    const pdfBuffer = await renderToBuffer(
      <InvoicePdfDocument
        faturaNo={faturaNo}
        tedarikci={{
          firmaAdi: tedarikci.firmaAdi,
          adres: tedarikci.adres || "",
          telefon: tedarikci.telefon || "",
          eposta: tedarikci.eposta || "",
          vergiDairesi: tedarikci.vergiDairesi || "",
          vergiNo: tedarikci.vergiNo || "",
        }}
        alici={{
          firmaAdi: magaza?.magazaAdi ?? "Demiray Mobilya",
          adres: magaza?.adres ?? "",
          telefon: magaza?.telefon ?? "",
          eposta: magaza?.eposta ?? "",
          vergiDairesi: magaza?.vergiDairesi ?? "",
          vergiNo: magaza?.vergiNo ?? "",
        }}
        kalemler={hesaplananKalemler}
        odemeSekli={odemeSekli}
        vadeTarihi={vadeStr}
        teslimatNotu={teslimatNotu}
        araToplam={araToplam}
        kdvTutari={kdvTutari}
        genelToplam={genelToplam}
        tarih={bugun}
      />,
    );

    /* PDF'i Base64'e çevir ve Cloudinary'e yükle */
    const pdfBase64 = `data:application/pdf;base64,${Buffer.from(pdfBuffer).toString("base64")}`;
    const dosyaUrl = await uploadBase64(pdfBase64, "tedarikci-belgeler");

    /* Fatura kaydını oluştur */
    const faturaDoc = await Fatura.create({
      faturaNo,
      tedarikciId,
      tedarikciBilgi: {
        firmaAdi: tedarikci.firmaAdi,
        adres: tedarikci.adres,
        telefon: tedarikci.telefon,
        eposta: tedarikci.eposta,
        vergiDairesi: tedarikci.vergiDairesi,
        vergiNo: tedarikci.vergiNo,
      },
      aliciBilgi: {
        firmaAdi: magaza?.magazaAdi ?? "Demiray Mobilya",
        adres: magaza?.adres ?? "",
        telefon: magaza?.telefon ?? "",
        eposta: magaza?.eposta ?? "",
        vergiDairesi: magaza?.vergiDairesi ?? "",
        vergiNo: magaza?.vergiNo ?? "",
      },
      kalemler: hesaplananKalemler,
      odemeSekli,
      vadeTarihi: vadeTarihi ? new Date(vadeTarihi) : undefined,
      teslimatNotu,
      araToplam,
      kdvTutari,
      genelToplam,
      dosyaUrl,
    });

    /* Tedarikçinin belgelerine ekle */
    await Tedarikci.findByIdAndUpdate(tedarikciId, {
      $push: {
        tedarikciBelgeleri: {
          url: dosyaUrl,
          aciklama: `Fatura ${faturaNo}`,
          tur: "fatura",
          yuklemeTarihi: new Date().toISOString(),
        },
      },
    });

    await logIslem(session.user.id, "ekle", "faturalar", tedarikciId);
    revalidatePath(`/dashboard/tedarikci/${tedarikciId}`);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(faturaDoc)),
    };
  } catch (e: any) {
    return { success: false, error: e.message || "Fatura oluşturulamadı" };
  }
}

/* ---------- Fatura Sorgulama ---------- */

export async function getFaturaByTedarikciAction(tedarikciId: string): Promise<FaturaType[]> {
  await connectDB();
  const docs = await Fatura.find({ tedarikciId }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function getFaturaByIdAction(id: string): Promise<FaturaType | null> {
  await connectDB();
  const doc = await Fatura.findById(id).lean();
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}
