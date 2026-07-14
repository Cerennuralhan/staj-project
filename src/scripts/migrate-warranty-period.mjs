import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://100.123.162.125:27017/demiray_ecommerce";

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  console.log("✓ MongoDB bağlantısı başarılı");

  const db = mongoose.connection.db;
  if (!db) return;

  const uruns = db.collection("uruns");

  // Mevcut garantiSuresi (yıl) alanını warrantyPeriodMonths (ay) olarak dönüştür
  const result = await uruns.updateMany(
    { warrantyPeriodMonths: { $exists: false } },
    [
      {
        $set: {
          warrantyPeriodMonths: {
            $cond: {
              if: { $and: [
                { $ne: ["$garantiSuresi", null] },
                { $ne: ["$garantiSuresi", 0] },
              ]},
              then: { $multiply: ["$garantiSuresi", 12] },
              else: 24,
            },
          },
        },
      },
    ],
  );

  console.log(`✓ ${result.matchedCount} ürün eşleşti, ${result.modifiedCount} ürün güncellendi`);

  // warrantyPeriodMonths index ekle
  try {
    await uruns.createIndex({ warrantyPeriodMonths: 1 });
    console.log("✓ warrantyPeriodMonths index eklendi");
  } catch (e) {
    console.log("! Index zaten var");
  }

  await mongoose.disconnect();
  console.log("✓ Migration tamamlandı");
}

migrate().catch((err) => {
  console.error("Migration hatası:", err);
  process.exit(1);
});
