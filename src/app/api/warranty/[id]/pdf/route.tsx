import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db";
import { Garanti } from "@/features/garanti/queries";
import { Musteri } from "@/features/musteri/queries";
import { Urun } from "@/features/urun/queries";
import { Siparis } from "@/features/siparis/queries";
import { Magaza } from "@/features/magaza/queries";
import { Kurulum } from "@/features/kurulum/queries";
import { hasPermission } from "@/lib/auth/permissions";
import WarrantyPdfDocument from "@/components/pdf/WarrantyPdfDocument";
import { formatWarrantyPeriod } from "@/lib/warranty/calculateWarrantyEndDate";
import React from "react";

const paramsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Geçersiz garanti ID"),
});

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const parsed = paramsSchema.safeParse({ id });
    if (!parsed.success) {
      return NextResponse.json({ error: "Geçersiz garanti ID" }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
    }

    const userRol = (session.user as any).rol as string;
    if (!hasPermission(userRol as any, "garanti")) {
      return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });
    }

    await connectDB();

    const garanti = await Garanti.findById(id).lean();
    if (!garanti) {
      return NextResponse.json({ error: "Garanti bulunamadı" }, { status: 404 });
    }

    const [musteri, urun, siparis, magaza] = await Promise.all([
      Musteri.findById(garanti.musteriId).lean(),
      Urun.findById(garanti.urunId).lean(),
      Siparis.findById(garanti.siparisId).lean(),
      Magaza.findOne().lean(),
    ]);

    let kurulum = null;
    if (garanti.siparisId && garanti.urunId) {
      kurulum = await Kurulum.findOne({
        siparisId: garanti.siparisId,
        urunId: garanti.urunId,
      }).populate("montajKullaniciId", "adSoyad").lean();
    }

    const storeName = magaza?.magazaAdi ?? "Demiray Mobilya";
    const storePhone = magaza?.telefon ?? "";
    const storeAddress = magaza?.adres ?? "";
    const logoUrl = magaza?.logo || undefined;

    const customerName = musteri?.adSoyad ?? "—";
    const customerPhone = musteri?.telefon ?? "—";
    const customerAddress = musteri?.adres ?? "—";

    const productName = urun?.urunAdi ?? "—";
    const productCode = urun?._id ? String(urun._id).slice(-6).toUpperCase() : undefined;
    const warrantyDurationMonths = urun?.warrantyPeriodMonths ?? 24;

    const siparisUrun = siparis?.urunler?.find(
      (u: any) => String(u.urunId) === String(garanti.urunId),
    );
    const quantity = siparisUrun?.adet ?? 1;

    const saleDate = siparis?.siparisTarihi
      ? formatDate(siparis.siparisTarihi)
      : "—";

    const installationTeam = kurulum?.montajKullaniciId
      ? (kurulum.montajKullaniciId as any).adSoyad
      : undefined;
    const installationDate = kurulum?.kurulumTarihi
      ? formatDate(kurulum.kurulumTarihi)
      : undefined;

    const documentDate = formatDate(new Date());

    const { renderToBuffer } = await import("@react-pdf/renderer");

    const pdfBuffer = await renderToBuffer(
      <WarrantyPdfDocument
        storeName={storeName}
        storePhone={storePhone}
        storeAddress={storeAddress}
        logoUrl={logoUrl}
        customerName={customerName}
        customerPhone={customerPhone}
        customerAddress={customerAddress}
        productName={productName}
        productCode={productCode}
        quantity={quantity}
        saleDate={saleDate}
        warrantyDuration={warrantyDurationMonths}
        warrantyDurationLabel={formatWarrantyPeriod(warrantyDurationMonths)}
        warrantyStart={formatDate(garanti.garantiBaslangic)}
        warrantyEnd={formatDate(garanti.garantiBitis)}
        serialNo={garanti.seriNo || undefined}
        installationDate={installationDate}
        installationTeam={installationTeam}
        documentDate={documentDate}
      />,
    );

    const safeName = customerName
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ-]/g, "")
      .toLocaleLowerCase("tr-TR")
      .slice(0, 40) || "musteri";

    const today = new Date().toISOString().slice(0, 10);
    const filename = `garanti-belgesi-${safeName}-${today}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error("PDF oluşturma hatası:", error);
    return NextResponse.json({ error: "PDF oluşturulamadı" }, { status: 500 });
  }
}
