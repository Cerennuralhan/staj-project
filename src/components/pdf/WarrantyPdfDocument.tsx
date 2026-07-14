import React from "react";
import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica", fontWeight: "normal" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#1e3a5f",
    paddingBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginRight: 20,
    objectFit: "contain",
  },
  headerText: {
    flex: 1,
  },
  storeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e3a5f",
    marginBottom: 4,
  },
  storeInfo: {
    fontSize: 8,
    color: "#555",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e3a5f",
    marginBottom: 25,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e3a5f",
    marginBottom: 8,
    backgroundColor: "#f0f4f8",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: 140,
    fontWeight: "bold",
    color: "#444",
    fontSize: 9,
  },
  value: {
    flex: 1,
    color: "#1a1a1a",
    fontSize: 9,
  },
  grid2: {
    flexDirection: "row",
    gap: 20,
  },
  gridCol: {
    flex: 1,
  },
  conditionsBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 4,
    backgroundColor: "#fafafa",
    fontSize: 8,
    color: "#333",
    lineHeight: 1.6,
  },
  conditionsTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e3a5f",
    marginBottom: 6,
  },
  conditionsText: {
    fontSize: 8,
    color: "#444",
    lineHeight: 1.6,
  },
  signatureArea: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 15,
  },
  signatureBox: {
    width: "40%",
  },
  signatureLine: {
    marginTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    width: "100%",
  },
  signatureLabel: {
    fontSize: 8,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  stampBox: {
    width: "30%",
    alignItems: "center",
  },
  stampCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#999",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  stampText: {
    fontSize: 6,
    color: "#999",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 8,
    fontSize: 7,
    color: "#888",
  },
  pageNumber: {
    textAlign: "right",
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginVertical: 8,
  },
});

interface WarrantyPdfDocumentProps {
  storeName: string;
  storePhone: string;
  storeAddress: string;
  logoUrl?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  productName: string;
  productCode?: string;
  quantity: number;
  saleDate: string;
  warrantyDuration: number;
  warrantyDurationLabel: string;
  warrantyStart: string;
  warrantyEnd: string;
  serialNo?: string;
  installationDate?: string;
  installationTeam?: string;
  documentDate: string;
}

const WARRANTY_CONDITIONS = `1. Garanti süresi, ürünün teslim tarihinden itibaren başlar.
2. Garanti kapsamındaki ürünler, malzeme ve işçilik hatalarına karşı korunmaktadır.
3. Yetkisiz müdahale, yanlış kullanım, darbe, sıvı teması, doğal afet gibi durumlar garanti kapsamı dışındadır.
4. Garanti süresi boyunca oluşan arızalar, firma tarafından ücretsiz olarak onarılır.
5. Garanti belgesi ile birlikte fatura ibrazı zorunludur.
6. Yedek parça bulunamaması durumunda, ürün benzer özellikteki bir ürün ile değiştirilebilir.
7. Garanti hizmetinden yararlanmak için müşteri hizmetlerine başvurulması gerekmektedir.`;

function WarrantyPdfDocument({
  storeName,
  storePhone,
  storeAddress,
  logoUrl,
  customerName,
  customerPhone,
  customerAddress,
  productName,
  productCode,
  quantity,
  saleDate,
  warrantyDuration,
  warrantyStart,
  warrantyEnd,
  serialNo,
  installationDate,
  installationTeam,
  documentDate,
  warrantyDurationLabel,
}: WarrantyPdfDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {logoUrl && <Image style={styles.logo} source={logoUrl} />}
          <View style={styles.headerText}>
            <Text style={styles.storeName}>{storeName}</Text>
            <Text style={styles.storeInfo}>Tel: {storePhone}</Text>
            <Text style={styles.storeInfo}>{storeAddress}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>GARANTİ BELGESİ</Text>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MÜŞTERİ BİLGİLERİ</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Ad Soyad:</Text>
            <Text style={styles.value}>{customerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Telefon:</Text>
            <Text style={styles.value}>{customerPhone}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Adres:</Text>
            <Text style={styles.value}>{customerAddress}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Product Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ÜRÜN BİLGİLERİ</Text>
          <View style={styles.grid2}>
            <View style={styles.gridCol}>
              <View style={styles.row}>
                <Text style={styles.label}>Ürün Adı:</Text>
                <Text style={styles.value}>{productName}</Text>
              </View>
              {productCode && (
                <View style={styles.row}>
                  <Text style={styles.label}>Model/Kod:</Text>
                  <Text style={styles.value}>{productCode}</Text>
                </View>
              )}
              <View style={styles.row}>
                <Text style={styles.label}>Adet:</Text>
                <Text style={styles.value}>{quantity}</Text>
              </View>
            </View>
            <View style={styles.gridCol}>
              <View style={styles.row}>
                <Text style={styles.label}>Satış Tarihi:</Text>
                <Text style={styles.value}>{saleDate}</Text>
              </View>
              {serialNo && (
                <View style={styles.row}>
                  <Text style={styles.label}>Seri No:</Text>
                  <Text style={styles.value}>{serialNo}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Warranty Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GARANTİ BİLGİLERİ</Text>
          <View style={styles.grid2}>
            <View style={styles.gridCol}>
              <View style={styles.row}>
                  <Text style={styles.label}>Garanti Süresi:</Text>
                <Text style={styles.value}>{warrantyDurationLabel}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Başlangıç Tarihi:</Text>
                <Text style={styles.value}>{warrantyStart}</Text>
              </View>
            </View>
            <View style={styles.gridCol}>
              <View style={styles.row}>
                <Text style={styles.label}>Bitiş Tarihi:</Text>
                <Text style={styles.value}>{warrantyEnd}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Installation Info */}
        {(installationDate || installationTeam) && (
          <>
            <View style={styles.separator} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>KURULUM BİLGİLERİ</Text>
              {installationDate && (
                <View style={styles.row}>
                  <Text style={styles.label}>Kurulum Tarihi:</Text>
                  <Text style={styles.value}>{installationDate}</Text>
                </View>
              )}
              {installationTeam && (
                <View style={styles.row}>
                  <Text style={styles.label}>Kurulum Ekibi:</Text>
                  <Text style={styles.value}>{installationTeam}</Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Warranty Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GARANTİ ŞARTLARI</Text>
          <View style={styles.conditionsBox}>
            <Text style={styles.conditionsText}>{WARRANTY_CONDITIONS}</Text>
          </View>
        </View>

        {/* Signature / Stamp Area */}
        <View style={styles.signatureArea}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Yetkili Satıcı Kaşe / İmza</Text>
          </View>
          <View style={styles.stampBox}>
            <View style={styles.stampCircle}>
              <Text style={styles.stampText}>KAŞE</Text>
              <Text style={styles.stampText}>ALANI</Text>
            </View>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Müşteri İmza</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Belge Oluşturulma Tarihi: {documentDate}</Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Sayfa ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export default WarrantyPdfDocument;
