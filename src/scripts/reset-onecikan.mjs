import mongoose from "mongoose";

const MONGODB_URI = "mongodb://100.123.162.125:27017/demiray_ecommerce";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  // 1) Mevcut öne çıkan ürünleri listele
  const onceOneCikan = await db.collection("uruns").find({ oneCikan: true }).toArray();
  console.log(`\nŞu an oneCikan=true olan ürünler (${onceOneCikan.length} adet):`);
  for (const u of onceOneCikan) {
    console.log(`  - ${u.urunAdi} (${u._id})`);
  }

  // 2) Hepsini sıfırla
  const result = await db.collection("uruns").updateMany(
    { oneCikan: true },
    { $set: { oneCikan: false } },
  );
  console.log(`\n✅ ${result.modifiedCount} ürünün oneCikan değeri false yapıldı.`);

  // 3) Doğrula
  const kalan = await db.collection("uruns").countDocuments({ oneCikan: true });
  console.log(`Kalan oneCikan=true ürün sayısı: ${kalan}`);

  await mongoose.disconnect();
}

main().catch(console.error);
