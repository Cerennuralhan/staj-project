import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: "#1e3a5f",
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  storeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e3a5f",
    marginBottom: 2,
  },
  storeInfo: {
    fontSize: 7,
    color: "#555",
  },
  faturaNo: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e3a5f",
    marginBottom: 4,
  },
  faturaTarih: {
    fontSize: 7,
    color: "#666",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e3a5f",
    marginBottom: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  infoGrid: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  infoBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
  },
  infoTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#1e3a5f",
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  infoLabel: {
    width: 80,
    fontSize: 7,
    color: "#888",
  },
  infoValue: {
    flex: 1,
    fontSize: 7,
    color: "#333",
  },
  table: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f4f8",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#1e3a5f",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  tableCell: {
    fontSize: 7,
    color: "#333",
  },
  tableCellRight: {
    fontSize: 7,
    color: "#333",
    textAlign: "right",
  },
  colUrunAdi: { width: "30%" },
  colAdet: { width: "10%", textAlign: "center" },
  colBirimFiyat: { width: "18%", textAlign: "right" },
  colKdv: { width: "10%", textAlign: "center" },
  colAraToplam: { width: "15%", textAlign: "right" },
  colKdvTutar: { width: "17%", textAlign: "right" },
  summarySection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  summaryBox: {
    width: "45%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  summaryLabel: {
    flex: 1,
    fontSize: 7,
    color: "#666",
  },
  summaryValue: {
    width: 100,
    fontSize: 7,
    color: "#333",
    textAlign: "right",
  },
  summaryTotal: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#f0f4f8",
  },
  summaryTotalLabel: {
    flex: 1,
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e3a5f",
  },
  summaryTotalValue: {
    width: 100,
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e3a5f",
    textAlign: "right",
  },
  odemeSection: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 16,
  },
  odemeBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
  },
  odemeTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#1e3a5f",
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 4,
  },
  odemeText: {
    fontSize: 7,
    color: "#555",
  },
  notBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    marginBottom: 20,
  },
  notTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#1e3a5f",
    marginBottom: 4,
  },
  notText: {
    fontSize: 7,
    color: "#555",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 8,
    fontSize: 7,
    color: "#888",
  },
});

interface FaturaKalemData {
  urunAdi: string;
  adet: number;
  birimFiyat: number;
  kdvOrani: number;
  araToplam: number;
  kdvTutari: number;
}

interface TedarikciBilgi {
  firmaAdi: string;
  adres: string;
  telefon: string;
  eposta: string;
  vergiDairesi: string;
  vergiNo: string;
}

interface AliciBilgi {
  firmaAdi: string;
  adres: string;
  telefon: string;
  eposta: string;
  vergiDairesi: string;
  vergiNo: string;
}

interface InvoicePdfDocumentProps {
  faturaNo: string;
  tedarikci: TedarikciBilgi;
  alici: AliciBilgi;
  kalemler: FaturaKalemData[];
  odemeSekli: string;
  vadeTarihi?: string;
  teslimatNotu: string;
  araToplam: number;
  kdvTutari: number;
  genelToplam: number;
  tarih: string;
}

function formatCur(amount: number): string {
  return `₺${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function InvoicePdfDocument({
  faturaNo,
  tedarikci,
  alici,
  kalemler,
  odemeSekli,
  vadeTarihi,
  teslimatNotu,
  araToplam,
  kdvTutari,
  genelToplam,
  tarih,
}: InvoicePdfDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.storeName}>{alici.firmaAdi}</Text>
            <Text style={styles.storeInfo}>{alici.adres}</Text>
            <Text style={styles.storeInfo}>Tel: {alici.telefon} / E-posta: {alici.eposta}</Text>
            <Text style={styles.storeInfo}>Vergi Dairesi: {alici.vergiDairesi} / Vergi No: {alici.vergiNo}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.faturaNo}>{faturaNo}</Text>
            <Text style={styles.faturaTarih}>Tarih: {tarih}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>FATURA</Text>

        {/* Info Grid: Seller / Buyer */}
        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>SATICI</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Firma:</Text>
              <Text style={styles.infoValue}>{tedarikci.firmaAdi}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Adres:</Text>
              <Text style={styles.infoValue}>{tedarikci.adres}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tel:</Text>
              <Text style={styles.infoValue}>{tedarikci.telefon}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>E-posta:</Text>
              <Text style={styles.infoValue}>{tedarikci.eposta}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vergi Dairesi:</Text>
              <Text style={styles.infoValue}>{tedarikci.vergiDairesi}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vergi No:</Text>
              <Text style={styles.infoValue}>{tedarikci.vergiNo}</Text>
            </View>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>ALICI</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Firma:</Text>
              <Text style={styles.infoValue}>{alici.firmaAdi}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Adres:</Text>
              <Text style={styles.infoValue}>{alici.adres}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tel:</Text>
              <Text style={styles.infoValue}>{alici.telefon}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>E-posta:</Text>
              <Text style={styles.infoValue}>{alici.eposta}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vergi Dairesi:</Text>
              <Text style={styles.infoValue}>{alici.vergiDairesi}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vergi No:</Text>
              <Text style={styles.infoValue}>{alici.vergiNo}</Text>
            </View>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colUrunAdi]}>Ürün Adı</Text>
            <Text style={[styles.tableHeaderCell, styles.colAdet]}>Adet</Text>
            <Text style={[styles.tableHeaderCell, styles.colBirimFiyat]}>Birim Fiyat</Text>
            <Text style={[styles.tableHeaderCell, styles.colKdv]}>KDV %</Text>
            <Text style={[styles.tableHeaderCell, styles.colAraToplam]}>Ara Toplam</Text>
            <Text style={[styles.tableHeaderCell, styles.colKdvTutar]}>KDV Tutarı</Text>
          </View>
          {kalemler.map((k, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tableCell, styles.colUrunAdi]}>{k.urunAdi}</Text>
              <Text style={[styles.tableCell, styles.colAdet]}>{k.adet}</Text>
              <Text style={[styles.tableCellRight, styles.colBirimFiyat]}>{formatCur(k.birimFiyat)}</Text>
              <Text style={[styles.tableCell, styles.colKdv]}>{k.kdvOrani}%</Text>
              <Text style={[styles.tableCellRight, styles.colAraToplam]}>{formatCur(k.araToplam)}</Text>
              <Text style={[styles.tableCellRight, styles.colKdvTutar]}>{formatCur(k.kdvTutari)}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ara Toplam</Text>
              <Text style={styles.summaryValue}>{formatCur(araToplam)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Toplam KDV</Text>
              <Text style={styles.summaryValue}>{formatCur(kdvTutari)}</Text>
            </View>
            <View style={styles.summaryTotal}>
              <Text style={styles.summaryTotalLabel}>Genel Toplam</Text>
              <Text style={styles.summaryTotalValue}>{formatCur(genelToplam)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.odemeSection}>
          <View style={styles.odemeBox}>
            <Text style={styles.odemeTitle}>Ödeme Bilgileri</Text>
            <Text style={styles.odemeText}>Ödeme Şekli: {odemeSekli}</Text>
            {vadeTarihi && <Text style={styles.odemeText}>Vade Tarihi: {vadeTarihi}</Text>}
          </View>
          {teslimatNotu && (
            <View style={styles.odemeBox}>
              <Text style={styles.odemeTitle}>Teslimat Notu</Text>
              <Text style={styles.odemeText}>{teslimatNotu}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Fatura Tarihi: {tarih}</Text>
          <Text style={{ textAlign: "right" }} render={({ pageNumber, totalPages }) => `Sayfa ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export default InvoicePdfDocument;
