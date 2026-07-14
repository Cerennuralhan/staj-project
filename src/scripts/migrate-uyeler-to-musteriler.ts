/**
 * Migrasyon: uyeler koleksiyonundaki, musteriler'de karşılığı olmayan
 * (uyeId ile eşleşmeyen) üyeleri bul ve her biri için musteriler koleksiyonuna
 * eksik kaydı oluştur.
 *
 * Kullanım: npx tsx src/scripts/migrate-uyeler-to-musteriler.ts
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  console.error("MONGODB_URI ortam değişkeni tanımlı değil");
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("✓ MongoDB bağlantısı başarılı");

  const db = mongoose.connection.db!;

  const uyeler = await db.collection("uyes").find({}).toArray();
  console.log(`Toplam üye: ${uyeler.length}`);

  let olusturulan = 0;
  let atlanan = 0;

  for (const uye of uyeler) {
    const uyeId = uye._id;

    // Bu uyeId'ye sahip bir musteri kaydı var mı?
    const mevcutMusteri = await db.collection("musteris").findOne({ uyeId });

    if (mevcutMusteri) {
      atlanan++;
      continue;
    }

    // Eposta ile eşleşen musteri var mı? (checkout'ta eposta ile oluşturulmuş olabilir)
    const epostaIleMusteri = await db
      .collection("musteris")
      .findOne({ eposta: uye.eposta });

    if (epostaIleMusteri) {
      // uyeId alanını ekle
      await db
        .collection("musteris")
        .updateOne({ _id: epostaIleMusteri._id }, { $set: { uyeId } });
      console.log(`  Güncellendi (eposta eşleşti): ${uye.eposta}`);
    } else {
      // Yeni musteri kaydı oluştur
      await db.collection("musteris").insertOne({
        adSoyad: `${uye.ad} ${uye.soyad}`,
        telefon: uye.cepTelefonu || "",
        eposta: uye.eposta,
        adres: "",
        uyeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`  Oluşturuldu: ${uye.eposta}`);
    }

    olusturulan++;
  }

  console.log(`\n✓ Tamamlandı: ${olusturulan} kayıt eklendi/güncellendi, ${atlanan} atlandı (zaten vardı)`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Hata:", err);
  process.exit(1);
});
