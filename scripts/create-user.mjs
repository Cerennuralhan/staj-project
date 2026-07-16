import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://100.123.162.125:27017/demiray_ecommerce";

const KullaniciSchema = new mongoose.Schema(
  {
    adSoyad: { type: String, required: true },
    eposta: { type: String, required: true, unique: true },
    sifre: { type: String, required: true },
    rol: { type: String, enum: ["admin", "satis", "montaj"], default: "satis" },
    aktifMi: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Kullanici = mongoose.model("Kullanici", KullaniciSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB'ye bağlandı");

  const existing = await Kullanici.findOne({ eposta: "melike@demiray.com" });
  if (existing) {
    console.log("Bu e-posta zaten kayıtlı, şifre güncelleniyor...");
    existing.sifre = await bcrypt.hash("melike 123", 12);
    await existing.save();
    console.log("Şifre güncellendi");
  } else {
    const hash = await bcrypt.hash("melike 123", 12);
    await Kullanici.create({
      adSoyad: "Melike Demiray",
      eposta: "melike@demiray.com",
      sifre: hash,
      rol: "admin",
      aktifMi: true,
    });
    console.log("Kullanıcı oluşturuldu: melike@demiray.com / şifre: melike 123 (rol: admin)");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Hata:", err);
  process.exit(1);
});
