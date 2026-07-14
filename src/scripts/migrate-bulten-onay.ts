/**
 * Migrasyon: uyeler koleksiyonundaki bultenOnay değerlerini, ilgili musteriler
 * kayıtlarına senkronize et. Hem mevcut (uyeId eşleşmesi olan) hem de eposta ile
 * eşleşen müşteri kayıtlarını günceller.
 *
 * Kullanım: npx tsx src/scripts/migrate-bulten-onay.ts
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

  let guncellenen = 0;
  let bulunamayan = 0;

  for (const uye of uyeler) {
    const uyeId = uye._id;
    const bultenOnay = uye.bultenOnay ?? false;

    // uyeId ile eşleşen musteri kaydını bul
    let musteri = await db.collection("musteris").findOne({ uyeId });

    if (!musteri) {
      // eposta ile eşleşen musteri kaydını bul
      musteri = await db.collection("musteris").findOne({ eposta: uye.eposta });
    }

    if (musteri) {
      await db.collection("musteris").updateOne(
        { _id: musteri._id },
        { $set: { bultenOnay } },
      );
      guncellenen++;
      console.log(`  Güncellendi: ${uye.eposta} → bultenOnay: ${bultenOnay}`);
    } else {
      bulunamayan++;
      console.log(`  Atlanıyor (müşteri kaydı yok): ${uye.eposta}`);
    }
  }

  console.log(`\n✓ Tamamlandı: ${guncellenen} kayıt güncellendi, ${bulunamayan} atlandı (müşteri kaydı yok)`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Hata:", err);
  process.exit(1);
});
