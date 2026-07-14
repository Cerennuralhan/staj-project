import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://100.123.162.125:27017/demiray_ecommerce";

const UrunResimSchema = new mongoose.Schema(
  { resim: String, sira: Number },
  { _id: false },
);

const KategoriSchema = new mongoose.Schema(
  { kategoriAdi: { type: String, required: true }, resim: { type: String, default: "" }, sira: { type: Number, default: 0 } },
  { timestamps: true },
);

const UrunSchema = new mongoose.Schema(
  {
    kategoriId: { type: mongoose.Schema.Types.ObjectId, ref: "Kategori", required: true },
    urunAdi: { type: String, required: true, trim: true },
    aciklama: { type: String, default: "" },
    fiyat: { type: Number, required: true, min: 0 },
    stok: { type: Number, required: true, min: 0, default: 0 },
    kapakResmi: { type: String, default: "" },
    warrantyPeriodMonths: { type: Number, default: 24 },
    yayinlandiMi: { type: Boolean, default: true },
    resimler: { type: [UrunResimSchema], default: [] },
    renk: { type: [String], default: [] },
    materyal: { type: [String], default: [] },
    satisSayisi: { type: Number, default: 0 },
    oneCikan: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const MusteriSchema = new mongoose.Schema(
  { adSoyad: { type: String, required: true }, telefon: { type: String, default: "" }, eposta: { type: String, default: "" }, adres: { type: String, default: "" }, notlar: { type: String, default: "" } },
  { timestamps: true },
);

const SiparisUrunSchema = new mongoose.Schema(
  { urunId: { type: mongoose.Schema.Types.ObjectId, ref: "Urun", required: true }, urunAdi: String, kapakResmi: String, adet: { type: Number, required: true }, fiyat: { type: Number, required: true, min: 0 } },
  { _id: false },
);

const SiparisSchema = new mongoose.Schema(
  {
    musteriId: { type: mongoose.Schema.Types.ObjectId, ref: "Musteri", required: true },
    siparisNo: { type: String, required: true, unique: true },
    durum: { type: String, enum: ["beklemede", "onaylandi", "hazirlaniyor", "kargoda", "teslim_edildi", "iptal"], default: "beklemede" },
    toplamTutar: { type: Number, required: true, min: 0 },
    siparisTarihi: { type: Date, default: Date.now },
    dinamikTeslimatAdresi: { type: String, required: true },
    dinamikFaturaAdresi: { type: String, required: true },
    urunler: { type: [SiparisUrunSchema], default: [] },
  },
  { timestamps: true },
);

const BankaBilgileriSchema = new mongoose.Schema(
  { banka: { type: String, default: "" }, iban: { type: String, default: "" }, sube: { type: String, default: "" }, hesapNo: { type: String, default: "" }, paraBirimi: { type: String, default: "" } },
  { _id: false },
);

const TedarikciBelgeSchema = new mongoose.Schema(
  { url: { type: String, default: "" }, aciklama: { type: String, default: "" }, tur: { type: String, default: "" }, yuklemeTarihi: { type: Date, default: Date.now } },
  { _id: false },
);

const TedarikciSchema = new mongoose.Schema(
  { firmaAdi: { type: String, required: true }, telefon: String, eposta: String, logo: { type: String, default: "" }, aktifMi: { type: Boolean, default: true }, adres: { type: String, default: "" }, vergiNo: { type: String, default: "" }, vergiDairesi: { type: String, default: "" }, mersisNo: { type: String, default: "" }, kurulusYili: { type: String, default: "" }, yetkiliKisi: { type: String, default: "" }, calismaSaatleri: { type: String, default: "" }, aciklama: { type: String, default: "" }, bankaBilgileri: { type: BankaBilgileriSchema, default: {} }, tedarikciBelgeleri: { type: [TedarikciBelgeSchema], default: [] } },
  { timestamps: true },
);

const TedarikSiparisUrunSchema = new mongoose.Schema(
  { urunId: { type: mongoose.Schema.Types.ObjectId, ref: "Urun" }, urunAdi: String, adet: { type: Number, required: true }, birimFiyat: { type: Number, default: 0 }, toplamTutar: { type: Number, default: 0 } },
  { _id: false },
);

const DurumGecisiSchema = new mongoose.Schema(
  { durum: String, tarih: { type: Date, default: Date.now } },
  { _id: false },
);

const TeslimatBilgileriSchema = new mongoose.Schema(
  { adres: { type: String, default: "" }, yontem: { type: String, default: "" }, kargoPlaka: { type: String, default: "" }, aciklama: { type: String, default: "" } },
  { _id: false },
);

const OdemeBilgileriSchema = new mongoose.Schema(
  { odemeYontemi: { type: String, default: "" }, odemeTarihi: Date, odemeTutari: { type: Number, default: 0 }, paraBirimi: { type: String, default: "TRY" }, odemeDurumu: { type: String, default: "beklemede" }, bankaAdi: { type: String, default: "" }, referansNo: { type: String, default: "" } },
  { _id: false },
);

const TedarikSiparisSchema = new mongoose.Schema(
  {
    tedarikciId: { type: mongoose.Schema.Types.ObjectId, ref: "Tedarikci", required: true },
    siparisNo: { type: String, required: true },
    durum: { type: String, enum: ["beklemede", "yolda", "teslim_alindi"], default: "beklemede" },
    siparisTarihi: { type: Date, default: Date.now },
    tahminiTeslimatTarihi: Date,
    teslimAlmaTarihi: Date,
    urunler: { type: [TedarikSiparisUrunSchema], default: [] },
    durumGecmisi: { type: [DurumGecisiSchema], default: [] },
    teslimatBilgileri: { type: TeslimatBilgileriSchema, default: {} },
    odemeBilgileri: { type: OdemeBilgileriSchema, default: {} },
  },
  { timestamps: true },
);

const KurulumSchema = new mongoose.Schema(
  {
    siparisId: { type: mongoose.Schema.Types.ObjectId, ref: "Siparis", required: true },
    urunId: { type: mongoose.Schema.Types.ObjectId, ref: "Urun", required: true },
    montajKullaniciId: { type: mongoose.Schema.Types.ObjectId, ref: "Kullanici", default: null },
    kurulumTarihi: { type: Date, required: true },
    durum: { type: String, enum: ["planlandi", "tamamlandi", "iptal"], default: "planlandi" },
  },
  { timestamps: true },
);

const KurulumFotografiSchema = new mongoose.Schema(
  { kurulumId: { type: mongoose.Schema.Types.ObjectId, ref: "Kurulum", required: true }, resim: { type: String, required: true }, aciklama: String },
  { timestamps: true },
);

const GarantiSchema = new mongoose.Schema(
  {
    siparisId: { type: mongoose.Schema.Types.ObjectId, ref: "Siparis", required: true },
    musteriId: { type: mongoose.Schema.Types.ObjectId, ref: "Musteri", required: true },
    urunId: { type: mongoose.Schema.Types.ObjectId, ref: "Urun", required: true },
    seriNo: String,
    garantiBaslangic: { type: Date, required: true },
    garantiBitis: { type: Date, required: true },
  },
  { timestamps: true },
);

const GarantiTalebiSchema = new mongoose.Schema(
  {
    garantiId: { type: mongoose.Schema.Types.ObjectId, ref: "Garanti", required: true },
    aciklama: { type: String, required: true },
    durum: { type: String, enum: ["acik", "inceleniyor", "cozuldu"], default: "acik" },
    cozumTuru: { type: String, enum: ["urun_incelendi", "kullanici_hatasi"], default: undefined },
  },
  { timestamps: true },
);

const SliderSchema = new mongoose.Schema(
  { baslik: String, resim: String, butonYazisi: String, butonLinki: String, sira: { type: Number, default: 0 } },
  { timestamps: true },
);

const GaleriSchema = new mongoose.Schema(
  { baslik: String, resim: String, tur: String, sira: { type: Number, default: 0 } },
  { timestamps: true },
);

const SayfaSchema = new mongoose.Schema(
  { baslik: { type: String, required: true }, slug: { type: String, required: true, unique: true }, icerik: String },
  { timestamps: true },
);

const IletisimMesajiSchema = new mongoose.Schema(
  { adSoyad: { type: String, required: true }, telefon: String, eposta: String, mesaj: { type: String, required: true }, tarih: { type: Date, default: Date.now } },
  { timestamps: true },
);

const MagazaSchema = new mongoose.Schema(
  {
    magazaAdi: { type: String, required: true },
    telefon: String,
    adres: String,
    logo: String,
    koordinat: { lat: { type: Number, default: 0 }, lng: { type: Number, default: 0 } },
    disGorunusFotograflari: [String],
  },
  { timestamps: true },
);

const BannerSchema = new mongoose.Schema(
  { baslik: String, aciklama: String, butonYazisi: String, butonLinki: String, resim: String, sira: { type: Number, default: 0 } },
  { timestamps: true },
);

const SabitSchema = new mongoose.Schema(
  { anahtar: { type: String, required: true, unique: true }, deger: mongoose.Schema.Types.Mixed },
);

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

const BildirimSchema = new mongoose.Schema(
  { kullaniciId: { type: mongoose.Schema.Types.ObjectId, ref: "Kullanici", required: true }, baslik: { type: String, required: true }, mesaj: { type: String, required: true }, okunduMu: { type: Boolean, default: false }, tarih: { type: Date, default: Date.now } },
  { timestamps: true },
);

const UyeSchema = new mongoose.Schema(
  { ad: String, soyad: String, eposta: { type: String, unique: true }, cepTelefonu: String, sifre: String, kvkkOnay: Boolean, bultenOnay: { type: Boolean, default: false }, sifreSifirlamaTokeni: String, sifreSifirlamaSonTarih: Date, olusturmaTarihi: { type: Date, default: Date.now } },
  { timestamps: true },
);

const FavoriSchema = new mongoose.Schema(
  { uyeId: { type: mongoose.Schema.Types.ObjectId, ref: "Uye", required: true }, urunId: { type: mongoose.Schema.Types.ObjectId, ref: "Urun", required: true }, tarih: { type: Date, default: Date.now } },
  { timestamps: true },
);

const SepetUrunSchema = new mongoose.Schema(
  { urunId: { type: mongoose.Schema.Types.ObjectId, ref: "Urun", required: true }, adet: { type: Number, required: true, min: 1 } },
  { _id: false },
);

const SepetSchema = new mongoose.Schema(
  { uyeId: { type: mongoose.Schema.Types.ObjectId, ref: "Uye", default: null }, misafirSepetId: String, urunler: [SepetUrunSchema], guncellemeTarihi: { type: Date, default: Date.now } },
  { timestamps: true },
);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✓ MongoDB bağlantısı başarılı");

  const db = mongoose.connection.db;
  if (!db) return;

  const collections = await db.listCollections().toArray();
  const names = collections.map((c) => c.name);

  // Drop all existing data
  for (const name of names) {
    await db.collection(name).deleteMany({});
  }
  console.log("✓ Tüm koleksiyonlar temizlendi");

  // ---------- Kategoriler ----------
  const Kategori = mongoose.model("Kategori", KategoriSchema);
  const kategoriler = await Kategori.insertMany([
    { kategoriAdi: "Oturma Odası", resim: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400", sira: 1 },
    { kategoriAdi: "Yatak Odası", resim: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400", sira: 2 },
    { kategoriAdi: "Yemek Odası", resim: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=400", sira: 3 },
    { kategoriAdi: "Mutfak", resim: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400", sira: 4 },
    { kategoriAdi: "Ofis", resim: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400", sira: 5 },
    { kategoriAdi: "Bahçe", resim: "https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=400", sira: 6 },
  ]);
  console.log(`✓ ${kategoriler.length} kategori eklendi`);

  // ---------- Ürünler ----------
  const Urun = mongoose.model("Urun", UrunSchema);

  const urunData = [
    { urunAdi: "Modern Köşe Takımı", aciklama: "3+2+1 koltuk takımı, lüks kumaş döşeme, konforlu oturum", fiyat: 24999, stok: 12, warrantyPeriodMonths: 36, oneCikan: true, kategoriIdx: 0, renk: ["Gri", "Bej", "Lacivert"], materyal: ["Kumaş", "Sünger"] },
    { urunAdi: "Deri L Koltuk", aciklama: "Hakiki deri, 5 kişilik L koltuk, ayaklı tasarım", fiyat: 32999, stok: 8, warrantyPeriodMonths: 60, oneCikan: true, kategoriIdx: 0, renk: ["Siyah", "Kahverengi"], materyal: ["Deri"] },
    { urunAdi: "İkili Kanepe", aciklama: "Küçük alanlar için ideal, sade ve şık tasarım", fiyat: 8999, stok: 25, warrantyPeriodMonths: 24, oneCikan: false, kategoriIdx: 0, renk: ["Gri", "Mavi", "Yeşil"], materyal: ["Kumaş"] },
    { urunAdi: "Çift Kişilik Yatak", aciklama: "160x200 cm, ortopedik sünger yatak, yerli üretim", fiyat: 12999, stok: 15, warrantyPeriodMonths: 36, oneCikan: true, kategoriIdx: 1, renk: ["Beyaz"], materyal: ["Sünger", "Pamuk"] },
    { urunAdi: "Gardırop 5 Kapılı", aciklama: "5 kapılı sürgülü gardırop, aynalı kapak seçeneği", fiyat: 15999, stok: 10, warrantyPeriodMonths: 24, oneCikan: false, kategoriIdx: 1, renk: ["Beyaz", "Meşe", "Ceviz"], materyal: ["MDF", "Melamin"] },
    { urunAdi: "Karyola Başlıklı", aciklama: "Led aydınlatmalı, sünger kaplı başlık, 160x200", fiyat: 6999, stok: 20, warrantyPeriodMonths: 24, oneCikan: false, kategoriIdx: 1, renk: ["Gri", "Bej"], materyal: ["Kumaş", "Metal"] },
    { urunAdi: "Yemek Masası 6 Kişilik", aciklama: "6 sandalyeli yemek takımı, cam masa tablası", fiyat: 18999, stok: 7, warrantyPeriodMonths: 24, oneCikan: true, kategoriIdx: 2, renk: ["Siyah", "Beyaz"], materyal: ["Cam", "Metal"] },
    { urunAdi: "Yemek Sandalyesi", aciklama: "Modern tasarım, pelüş döşeme, 4'lü set", fiyat: 7999, stok: 30, warrantyPeriodMonths: 24, oneCikan: false, kategoriIdx: 2, renk: ["Gri", "Bordo", "Koyu Yeşil"], materyal: ["Kumaş", "Metal"] },
    { urunAdi: "Mutfak Dolabı Modüler", aciklama: "3 üniteli modüler mutfak dolabı, paslanmaz kulplar", fiyat: 21999, stok: 5, warrantyPeriodMonths: 36, oneCikan: false, kategoriIdx: 3, renk: ["Beyaz", "Gri"], materyal: ["MDF", "Sunta"] },
    { urunAdi: "Baza + Komodin Seti", aciklama: "2 komodinli baza seti, yumuşak kumaş kaplama", fiyat: 10999, stok: 14, warrantyPeriodMonths: 24, oneCikan: false, kategoriIdx: 1, renk: ["Gri", "Bej"], materyal: ["Kumaş", "Ahşap"] },
    { urunAdi: "Çalışma Masası", aciklama: "Geniş çalışma alanı, çekmeceli, kablolama kanalı", fiyat: 5999, stok: 18, warrantyPeriodMonths: 24, oneCikan: true, kategoriIdx: 4, renk: ["Beyaz", "Ceviz"], materyal: ["MDF", "Metal"] },
    { urunAdi: "Ofis Koltuğu", aciklama: "Bel destekli, yükseklik ayarlı, tekerlekli", fiyat: 4499, stok: 22, warrantyPeriodMonths: 36, oneCikan: false, kategoriIdx: 4, renk: ["Siyah"], materyal: ["Deri", "Plastik"] },
    { urunAdi: "Bahçe Masa Takımı", aciklama: "4 sandalyeli bahçe masası, rattan görünüm", fiyat: 13999, stok: 9, warrantyPeriodMonths: 12, oneCikan: false, kategoriIdx: 5, renk: ["Kahverengi", "Gri"], materyal: ["Rattan", "Alüminyum"] },
    { urunAdi: "Şezlong", aciklama: "Ayarlanabilir sırt dayanağı, havlu askılı", fiyat: 3499, stok: 16, warrantyPeriodMonths: 12, oneCikan: false, kategoriIdx: 5, renk: ["Bej", "Kahverengi"], materyal: ["Tekstil", "Metal"] },
    { urunAdi: "Bebek Odası Takımı", aciklama: "Beşik + şifonyer + alt değiştirme ünitesi, sağlıklı malzemeler", fiyat: 18999, stok: 6, warrantyPeriodMonths: 36, oneCikan: true, kategoriIdx: 1, renk: ["Beyaz", "Krem"], materyal: ["Ahşap", "MDF"] },
    { urunAdi: "Berjer Koltuk", aciklama: "Tek kişilik berjer, pelüş kumaş, dönme mekanizmalı", fiyat: 5999, stok: 12, warrantyPeriodMonths: 24, oneCikan: false, kategoriIdx: 0, renk: ["Gri", "Pembe", "Mint"], materyal: ["Kumaş"] },
    { urunAdi: "Kitaplıklı Duvar Ünitesi", aciklama: "3 üniteli kitaplık, LED aydınlatmalı, kapalı dolaplı", fiyat: 24999, stok: 4, warrantyPeriodMonths: 24, oneCikan: false, kategoriIdx: 0, renk: ["Ceviz", "Beyaz"], materyal: ["MDF", "Metal"] },
  ];

  const urunler = await Urun.insertMany(
    urunData.map((u) => ({
      kategoriId: kategoriler[u.kategoriIdx]._id,
      urunAdi: u.urunAdi,
      aciklama: u.aciklama,
      fiyat: u.fiyat,
      stok: u.stok,
      warrantyPeriodMonths: u.warrantyPeriodMonths,
      oneCikan: u.oneCikan,
      yayinlandiMi: true,
      renk: u.renk,
      materyal: u.materyal,
      kapakResmi: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
      satisSayisi: Math.floor(Math.random() * 50),
      resimler: [
        { resim: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600", sira: 0 },
        { resim: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600", sira: 1 },
      ],
    })),
  );
  console.log(`✓ ${urunler.length} ürün eklendi`);

  // ---------- Müşteriler ----------
  const Musteri = mongoose.model("Musteri", MusteriSchema);
  const musteriler = await Musteri.insertMany([
    { adSoyad: "Ahmet Yılmaz", telefon: "0532 111 22 33", eposta: "ahmet@example.com", adres: "Kadıköy/İstanbul", notlar: "2. kat, asansör var" },
    { adSoyad: "Ayşe Demir", telefon: "0533 444 55 66", eposta: "ayse@example.com", adres: "Beşiktaş/İstanbul", notlar: "" },
    { adSoyad: "Mehmet Kaya", telefon: "0544 777 88 99", eposta: "mehmet@example.com", adres: "Çankaya/Ankara", notlar: "Hafta içi teslimat tercih ediyor" },
    { adSoyad: "Zeynep Şahin", telefon: "0555 111 22 33", eposta: "zeynep@example.com", adres: "Bornova/İzmir", notlar: "" },
    { adSoyad: "Mustafa Aydın", telefon: "0532 333 44 55", eposta: "mustafa@example.com", adres: "Merkez/Antalya", notlar: "Daha önce 2 kez alışveriş yaptı" },
    { adSoyad: "Elif Yıldız", telefon: "0533 777 88 99", eposta: "elif.yildiz@example.com", adres: "Osmangazi/Bursa", notlar: "VIP müşteri" },
    { adSoyad: "Ali Öztürk", telefon: "0541 222 33 44", eposta: "ali.ozturk@example.com", adres: "Sarıyer/İstanbul", notlar: "" },
    { adSoyad: "Fatma Korkmaz", telefon: "0543 555 66 77", eposta: "fatma@example.com", adres: "Selçuklu/Konya", notlar: "Teslimat öncesi aranacak" },
  ]);
  console.log(`✓ ${musteriler.length} müşteri eklendi`);

  // ---------- Siparişler ----------
  const Siparis = mongoose.model("Siparis", SiparisSchema);
  const siparisler = await Siparis.insertMany([
    {
      musteriId: musteriler[0]._id, siparisNo: "SIP-2026-0001", durum: "teslim_edildi", toplamTutar: 37998,
      siparisTarihi: new Date("2026-01-15"), dinamikTeslimatAdresi: "Kadıköy/İstanbul", dinamikFaturaAdresi: "Kadıköy/İstanbul",
      urunler: [{ urunId: urunler[0]._id, urunAdi: urunler[0].urunAdi, kapakResmi: urunler[0].kapakResmi, adet: 1, fiyat: urunler[0].fiyat }, { urunId: urunler[2]._id, urunAdi: urunler[2].urunAdi, kapakResmi: urunler[2].kapakResmi, adet: 1, fiyat: urunler[2].fiyat }],
    },
    {
      musteriId: musteriler[1]._id, siparisNo: "SIP-2026-0002", durum: "onaylandi", toplamTutar: 32999,
      siparisTarihi: new Date("2026-02-20"), dinamikTeslimatAdresi: "Beşiktaş/İstanbul", dinamikFaturaAdresi: "Beşiktaş/İstanbul",
      urunler: [{ urunId: urunler[1]._id, urunAdi: urunler[1].urunAdi, kapakResmi: urunler[1].kapakResmi, adet: 1, fiyat: urunler[1].fiyat }],
    },
    {
      musteriId: musteriler[2]._id, siparisNo: "SIP-2026-0003", durum: "beklemede", toplamTutar: 26998,
      siparisTarihi: new Date("2026-03-05"), dinamikTeslimatAdresi: "Çankaya/Ankara", dinamikFaturaAdresi: "Çankaya/Ankara",
      urunler: [{ urunId: urunler[6]._id, urunAdi: urunler[6].urunAdi, kapakResmi: urunler[6].kapakResmi, adet: 1, fiyat: urunler[6].fiyat }, { urunId: urunler[7]._id, urunAdi: urunler[7].urunAdi, kapakResmi: urunler[7].kapakResmi, adet: 2, fiyat: urunler[7].fiyat }],
    },
    {
      musteriId: musteriler[3]._id, siparisNo: "SIP-2026-0004", durum: "hazirlaniyor", toplamTutar: 10498,
      siparisTarihi: new Date("2026-06-28"), dinamikTeslimatAdresi: "Bornova/İzmir", dinamikFaturaAdresi: "Bornova/İzmir",
      urunler: [{ urunId: urunler[10]._id, urunAdi: urunler[10].urunAdi, kapakResmi: urunler[10].kapakResmi, adet: 1, fiyat: urunler[10].fiyat }, { urunId: urunler[11]._id, urunAdi: urunler[11].urunAdi, kapakResmi: urunler[11].kapakResmi, adet: 1, fiyat: urunler[11].fiyat }],
    },
    {
      musteriId: musteriler[4]._id, siparisNo: "SIP-2026-0005", durum: "kargoda", toplamTutar: 44997,
      siparisTarihi: new Date("2026-07-01"), dinamikTeslimatAdresi: "Merkez/Antalya", dinamikFaturaAdresi: "Merkez/Antalya",
      urunler: [{ urunId: urunler[1]._id, urunAdi: urunler[1].urunAdi, kapakResmi: urunler[1].kapakResmi, adet: 1, fiyat: urunler[1].fiyat }, { urunId: urunler[12]._id, urunAdi: urunler[12].urunAdi, kapakResmi: urunler[12].kapakResmi, adet: 1, fiyat: urunler[12].fiyat }],
    },
    {
      musteriId: musteriler[5]._id, siparisNo: "SIP-2026-0006", durum: "beklemede", toplamTutar: 18999,
      siparisTarihi: new Date("2026-07-10"), dinamikTeslimatAdresi: "Osmangazi/Bursa", dinamikFaturaAdresi: "Osmangazi/Bursa",
      urunler: [{ urunId: urunler[14]._id, urunAdi: urunler[14].urunAdi, kapakResmi: urunler[14].kapakResmi, adet: 1, fiyat: urunler[14].fiyat }],
    },
  ]);
  console.log(`✓ ${siparisler.length} sipariş eklendi`);

  // ---------- Tedarikçiler ----------
  const Tedarikci = mongoose.model("Tedarikci", TedarikciSchema);
  const tedarikciler = await Tedarikci.insertMany([
    { firmaAdi: "Mobilya Sanayi A.Ş.", telefon: "0212 555 10 10", eposta: "info@mobilyasanayi.com", adres: "İkitelli OSB / İstanbul", vergiNo: "1234567890", vergiDairesi: "İkitelli V.D.", mersisNo: "0123456789000010", kurulusYili: "2005", yetkiliKisi: "Ali Yönetici", calismaSaatleri: "09:00 - 18:00", aciklama: "Ana tedarikçimiz, uzun süredir çalışıyoruz", bankaBilgileri: { banka: "Ziraat Bankası", iban: "TR12 0001 0012 3456 7890 1234 56", sube: "İkitelli Şubesi", hesapNo: "12345678", paraBirimi: "TRY" } },
    { firmaAdi: "Ahşap Dünyası Ltd.", telefon: "0216 555 20 20", eposta: "siparis@ahsapdunyasi.com", adres: "Dudullu / İstanbul", vergiNo: "9988776655", vergiDairesi: "Dudullu V.D.", mersisNo: "0123456789000021", kurulusYili: "2010", yetkiliKisi: "Ayşe Müdür", calismaSaatleri: "08:30 - 17:30", aciklama: "Ahşap ürünlerde uzman", bankaBilgileri: { banka: "İş Bankası", iban: "TR34 0006 7001 2345 6789 0123 45", sube: "Dudullu Şubesi", hesapNo: "98765432", paraBirimi: "TRY" } },
    { firmaAdi: "İthal Mobilya", telefon: "0232 555 30 30", eposta: "info@ithalmobilya.com", adres: "Kemalpaşa / İzmir", vergiNo: "5566778899", vergiDairesi: "Kemalpaşa V.D.", mersisNo: "0123456789000032", kurulusYili: "2015", yetkiliKisi: "Mehmet İthalatçı", calismaSaatleri: "09:00 - 18:00", aciklama: "İtalyan ve İskandinav mobilya ithalatı" },
    { firmaAdi: "Yerli Mobilya Üretim", telefon: "0312 555 40 40", eposta: "info@yerlimobilya.com", adres: "Sincan / Ankara", vergiNo: "1122334455", vergiDairesi: "Sincan V.D.", mersisNo: "0123456789000043", kurulusYili: "2020", yetkiliKisi: "Fatih Üretici", calismaSaatleri: "08:00 - 17:00", aciklama: "Uygun fiyatlı yerli üretim" },
  ]);
  console.log(`✓ ${tedarikciler.length} tedarikçi eklendi`);

  // ---------- Tedarik Siparişleri ----------
  const TedarikSiparis = mongoose.model("TedarikSiparis", TedarikSiparisSchema);
  await TedarikSiparis.insertMany([
    { tedarikciId: tedarikciler[0]._id, siparisNo: "TS-2026-0001", durum: "teslim_alindi", siparisTarihi: new Date("2026-04-01"), tahminiTeslimatTarihi: new Date("2026-04-10"), teslimAlmaTarihi: new Date("2026-04-08"), urunler: [{ urunId: urunler[0]._id, urunAdi: urunler[0].urunAdi, adet: 10, birimFiyat: 12000, toplamTutar: 120000 }, { urunId: urunler[1]._id, urunAdi: urunler[1].urunAdi, adet: 5, birimFiyat: 18000, toplamTutar: 90000 }], durumGecmisi: [{ durum: "beklemede", tarih: new Date("2026-04-01") }, { durum: "yolda", tarih: new Date("2026-04-05") }, { durum: "teslim_alindi", tarih: new Date("2026-04-08") }], teslimatBilgileri: { adres: "İkitelli OSB / İstanbul", yontem: "Kamyon", kargoPlaka: "34 ABC 123", aciklama: "" }, odemeBilgileri: { odemeYontemi: "Havale", odemeTarihi: new Date("2026-04-10"), odemeTutari: 210000, paraBirimi: "TRY", odemeDurumu: "odendi", bankaAdi: "Ziraat Bankası", referansNo: "REF-2026-001" } },
    { tedarikciId: tedarikciler[1]._id, siparisNo: "TS-2026-0002", durum: "yolda", siparisTarihi: new Date("2026-07-01"), tahminiTeslimatTarihi: new Date("2026-07-15"), urunler: [{ urunId: urunler[3]._id, urunAdi: urunler[3].urunAdi, adet: 15, birimFiyat: 7000, toplamTutar: 105000 }, { urunId: urunler[4]._id, urunAdi: urunler[4].urunAdi, adet: 8, birimFiyat: 9000, toplamTutar: 72000 }], durumGecmisi: [{ durum: "beklemede", tarih: new Date("2026-07-01") }, { durum: "yolda", tarih: new Date("2026-07-10") }], teslimatBilgileri: { adres: "Dudullu / İstanbul", yontem: "Kargo", kargoPlaka: "", aciklama: "Dikkatli taşınmalı" }, odemeBilgileri: { odemeYontemi: "Kredi Kartı", odemeTutari: 177000, paraBirimi: "TRY", odemeDurumu: "beklemede" } },
    { tedarikciId: tedarikciler[2]._id, siparisNo: "TS-2026-0003", durum: "beklemede", siparisTarihi: new Date("2026-07-10"), tahminiTeslimatTarihi: new Date("2026-07-25"), urunler: [{ urunId: urunler[6]._id, urunAdi: urunler[6].urunAdi, adet: 6, birimFiyat: 11000, toplamTutar: 66000 }], durumGecmisi: [{ durum: "beklemede", tarih: new Date("2026-07-10") }], odemeBilgileri: { odemeYontemi: "Havale", odemeTutari: 66000, paraBirimi: "TRY", odemeDurumu: "beklemede" } },
    { tedarikciId: tedarikciler[3]._id, siparisNo: "TS-2026-0004", durum: "yolda", siparisTarihi: new Date("2026-07-12"), tahminiTeslimatTarihi: new Date("2026-07-20"), urunler: [{ urunId: urunler[15]._id, urunAdi: urunler[15].urunAdi, adet: 12, birimFiyat: 3500, toplamTutar: 42000 }], durumGecmisi: [{ durum: "beklemede", tarih: new Date("2026-07-12") }, { durum: "yolda", tarih: new Date("2026-07-13") }], teslimatBilgileri: { adres: "Sincan / Ankara", yontem: "Kargo" } },
    { tedarikciId: tedarikciler[0]._id, siparisNo: "TS-2026-0005", durum: "beklemede", siparisTarihi: new Date("2026-07-13"), tahminiTeslimatTarihi: new Date("2026-07-30"), urunler: [{ urunId: urunler[9]._id, urunAdi: urunler[9].urunAdi, adet: 20, birimFiyat: 6000, toplamTutar: 120000 }], durumGecmisi: [{ durum: "beklemede", tarih: new Date("2026-07-13") }] },
  ]);
  console.log("✓ 5 tedarik siparişi eklendi");

  // ---------- Kullanıcılar (Admin) ----------
  const Kullanici = mongoose.model("Kullanici", KullaniciSchema);
  const adminPassword = await bcrypt.hash("admin123", 12);
  const satisPassword = await bcrypt.hash("satis123", 12);
  const montajPassword = await bcrypt.hash("montaj123", 12);

  const kullanicilar = await Kullanici.insertMany([
    { adSoyad: "Admin Kullanıcı", eposta: "admin@demiray.com", sifre: adminPassword, rol: "admin", aktifMi: true },
    { adSoyad: "Satış Temsilcisi", eposta: "satis@demiray.com", sifre: satisPassword, rol: "satis", aktifMi: true },
    { adSoyad: "Montaj Ekibi", eposta: "montaj@demiray.com", sifre: montajPassword, rol: "montaj", aktifMi: true },
  ]);
  console.log(`✓ ${kullanicilar.length} kullanıcı eklendi`);

  // ---------- Kurulum ----------
  const Kurulum = mongoose.model("Kurulum", KurulumSchema);
  const kurulumlar = await Kurulum.insertMany([
    { siparisId: siparisler[0]._id, urunId: urunler[0]._id, montajKullaniciId: kullanicilar[2]._id, kurulumTarihi: new Date("2026-01-20"), durum: "tamamlandi" },
    { siparisId: siparisler[0]._id, urunId: urunler[2]._id, montajKullaniciId: kullanicilar[2]._id, kurulumTarihi: new Date("2026-01-20"), durum: "tamamlandi" },
    { siparisId: siparisler[1]._id, urunId: urunler[1]._id, montajKullaniciId: kullanicilar[2]._id, kurulumTarihi: new Date("2026-02-25"), durum: "planlandi" },
    { siparisId: siparisler[3]._id, urunId: urunler[10]._id, montajKullaniciId: null, kurulumTarihi: new Date("2026-07-14"), durum: "planlandi" },
    { siparisId: siparisler[4]._id, urunId: urunler[1]._id, montajKullaniciId: kullanicilar[2]._id, kurulumTarihi: new Date("2026-07-05"), durum: "tamamlandi" },
    { siparisId: siparisler[5]._id, urunId: urunler[14]._id, montajKullaniciId: null, kurulumTarihi: new Date("2026-07-18"), durum: "planlandi" },
  ]);
  console.log(`✓ ${kurulumlar.length} kurulum kaydı eklendi`);

  // ---------- Kurulum Fotoğrafları ----------
  const KurulumFotografi = mongoose.model("KurulumFotografi", KurulumFotografiSchema);
  await KurulumFotografi.insertMany([
    { kurulumId: kurulumlar[0]._id, resim: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600", aciklama: "Oturma odası kurulum sonrası" },
    { kurulumId: kurulumlar[0]._id, resim: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600", aciklama: "Köşe takımı detay" },
    { kurulumId: kurulumlar[4]._id, resim: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600", aciklama: "Deri L koltuk kurulumu" },
  ]);
  console.log("✓ 3 kurulum fotoğrafı eklendi");

  // ---------- Garanti ----------
  const Garanti = mongoose.model("Garanti", GarantiSchema);
  const now = new Date();
  const garantiler = await Garanti.insertMany([
    { siparisId: siparisler[0]._id, musteriId: musteriler[0]._id, urunId: urunler[0]._id, seriNo: "SR-2026-001", garantiBaslangic: new Date("2026-01-20"), garantiBitis: new Date("2029-01-20") },
    { siparisId: siparisler[0]._id, musteriId: musteriler[0]._id, urunId: urunler[2]._id, seriNo: "SR-2026-002", garantiBaslangic: new Date("2026-01-20"), garantiBitis: new Date("2028-01-20") },
    { siparisId: siparisler[1]._id, musteriId: musteriler[1]._id, urunId: urunler[1]._id, seriNo: "SR-2026-003", garantiBaslangic: new Date("2026-02-25"), garantiBitis: new Date("2031-02-25") },
    { siparisId: siparisler[4]._id, musteriId: musteriler[4]._id, urunId: urunler[1]._id, seriNo: "SR-2026-004", garantiBaslangic: new Date("2026-07-05"), garantiBitis: new Date("2031-07-05") },
    { siparisId: siparisler[4]._id, musteriId: musteriler[4]._id, urunId: urunler[12]._id, seriNo: "SR-2026-005", garantiBaslangic: new Date("2026-07-05"), garantiBitis: new Date("2027-07-05") },
  ]);
  console.log(`✓ ${garantiler.length} garanti kaydı eklendi`);

  // ---------- Garanti Talepleri ----------
  const GarantiTalebi = mongoose.model("GarantiTalebi", GarantiTalebiSchema);
  await GarantiTalebi.insertMany([
    { garantiId: garantiler[0]._id, aciklama: "Koltuk menteşesinde gıcırdama var", durum: "cozuldu", cozumTuru: "urun_incelendi" },
    { garantiId: garantiler[2]._id, aciklama: "Deri döşemede küçük bir yırtık fark ettik", durum: "inceleniyor" },
    { garantiId: garantiler[1]._id, aciklama: "İkili kanepe ayaklarında sallanma sorunu", durum: "acik" },
  ]);
  console.log("✓ 3 garanti talebi eklendi");

  // ---------- Slider ----------
  const Slider = mongoose.model("Slider", SliderSchema);
  await Slider.insertMany([
    { baslik: "Yeni Sezon Koleksiyonu", resim: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80", butonYazisi: "Keşfet", butonLinki: "/urunler", sira: 1 },
    { baslik: "%50'ye Varan İndirimler", resim: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80", butonYazisi: "Fırsatları Gör", butonLinki: "/urunler", sira: 2 },
    { baslik: "Yaz Koleksiyonu", resim: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80", butonYazisi: "İncele", butonLinki: "/urunler", sira: 3 },
    { baslik: "Yeni Ürünler Geldi", resim: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80", butonYazisi: "Alışverişe Başla", butonLinki: "/urunler", sira: 4 },
  ]);
  console.log("✓ 4 slider eklendi");

  // ---------- Banner ----------
  const Banner = mongoose.model("Banner", BannerSchema);
  await Banner.insertMany([
    { baslik: "Yeni Ürünler", aciklama: "2026 yaz koleksiyonu", butonYazisi: "İncele", butonLinki: "/urunler", resim: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80", sira: 1 },
    { baslik: "Özel Tasarım", aciklama: "Size özel mobilya çözümleri", butonYazisi: "Bilgi Al", butonLinki: "/iletisim", resim: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", sira: 2 },
    { baslik: "Kampanya", aciklama: "Seçili ürünlerde %30 indirim", butonYazisi: "Kaçırma", butonLinki: "/urunler", resim: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80", sira: 3 },
  ]);
  console.log("✓ 3 banner eklendi");

  // ---------- Sayfa (Hakkımızda) ----------
  const SayfaModel = mongoose.model("Sayfa", SayfaSchema);
  await SayfaModel.create({
    baslik: "Hakkımızda",
    slug: "hakkimizda",
    icerik: "DEMİRAY Mobilya, 1995 yılında İstanbul'da kurulmuş, kaliteli ve şık mobilyaları uygun fiyatlarla sunmayı hedefleyen bir aile şirketidir.\n\n30 yılı aşkın tecrübemizle, modern ve klasik tasarımları bir araya getirerek her zevke hitap eden geniş bir ürün yelpazesi sunuyoruz.\n\nMisyonumuz: Yaşam alanlarınızı güzelleştirecek, kaliteli ve uzun ömürlü mobilyaları en iyi fiyat-performans oranıyla sizlere ulaştırmak.\n\nVizyonumuz: Türkiye'nin lider mobilya markalarından biri olmak ve sürdürülebilir üretim anlayışıyla sektörde fark yaratmak.",
  });
  console.log("✓ Hakkımızda sayfası eklendi");

  // ---------- Magaza ----------
  const Magaza = mongoose.model("Magaza", MagazaSchema);
  await Magaza.create({
    magazaAdi: "DEMİRAY Mobilya Mağazası",
    telefon: "+90 (212) 555 01 23",
    adres: "Bağdat Caddesi No: 123, Caddebostan, Kadıköy / İstanbul",
    logo: "",
    koordinat: { lat: 40.9669, lng: 29.0883 },
    disGorunusFotograflari: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600",
    ],
    defaultWarrantyPeriodMonths: 24,
  });
  console.log("✓ Mağaza bilgisi eklendi");

  // ---------- Galeri ----------
  const Galeri = mongoose.model("Galeri", GaleriSchema);
  await Galeri.insertMany([
    { baslik: "Vitrin Düzenlemesi", resim: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600", tur: "magaza", sira: 1 },
    { baslik: "Oturma Odası Tasarımı", resim: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600", tur: "tasarim", sira: 2 },
    { baslik: "Yatak Odası Takımı", resim: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600", tur: "tasarim", sira: 3 },
    { baslik: "Yemek Odası Koleksiyonu", resim: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600", tur: "tasarim", sira: 4 },
  ]);
  console.log("✓ 4 galeri görseli eklendi");

  // ---------- Sabitler ----------
  const Sabit = mongoose.model("Sabit", SabitSchema);
  await Sabit.create({
    anahtar: "guven_seridi",
    deger: [
      { icon: "truck", label: "Ücretsiz Kargo", desc: "2500 TL üzeri ücretsiz" },
      { icon: "undo", label: "Kolay İade", desc: "30 gün içinde iade" },
      { icon: "shield", label: "Garanti", desc: "2 yıl garantili ürünler" },
      { icon: "card", label: "Güvenli Ödeme", desc: "256-bit SSL sertifikası" },
      { icon: "headphones", label: "7/24 Destek", desc: "Canlı destek hattı" },
    ],
  });
  console.log("✓ Güven şeridi verisi eklendi");

  // ---------- Üyeler ----------
  const Uye = mongoose.model("Uye", UyeSchema);
  const uyePassword = await bcrypt.hash("uye123", 12);
  const uyeler = await Uye.insertMany([
    { ad: "Ali", soyad: "Yıldız", eposta: "ali@example.com", cepTelefonu: "0532 111 11 11", sifre: uyePassword, kvkkOnay: true, bultenOnay: true, olusturmaTarihi: new Date() },
    { ad: "Elif", soyad: "Kara", eposta: "elif@example.com", cepTelefonu: "0533 222 22 22", sifre: uyePassword, kvkkOnay: true, bultenOnay: false, olusturmaTarihi: new Date() },
  ]);
  console.log(`✓ ${uyeler.length} üye eklendi`);

  // ---------- Favoriler ----------
  const Favori = mongoose.model("Favori", FavoriSchema);
  await Favori.insertMany([
    { uyeId: uyeler[0]._id, urunId: urunler[0]._id, tarih: new Date() },
    { uyeId: uyeler[0]._id, urunId: urunler[6]._id, tarih: new Date() },
    { uyeId: uyeler[1]._id, urunId: urunler[3]._id, tarih: new Date() },
  ]);
  console.log("✓ 3 favori eklendi");

  // ---------- Sepet ----------
  const Sepet = mongoose.model("Sepet", SepetSchema);
  await Sepet.insertMany([
    { uyeId: uyeler[0]._id, urunler: [{ urunId: urunler[5]._id, adet: 1 }, { urunId: urunler[9]._id, adet: 2 }], guncellemeTarihi: new Date() },
    { uyeId: uyeler[1]._id, urunler: [{ urunId: urunler[3]._id, adet: 1 }], guncellemeTarihi: new Date() },
    { misafirSepetId: "guest-sepet-001", urunler: [{ urunId: urunler[0]._id, adet: 1 }], guncellemeTarihi: new Date() },
  ]);
  console.log("✓ 3 sepet kaydı eklendi");

  // ---------- Bildirimler ----------
  const Bildirim = mongoose.model("Bildirim", BildirimSchema);
  await Bildirim.insertMany([
    { kullaniciId: kullanicilar[0]._id, baslik: "Yeni Sipariş", mesaj: "SIP-2026-0004 numaralı yeni sipariş alındı.", okunduMu: false, tarih: new Date() },
    { kullaniciId: kullanicilar[0]._id, baslik: "Kurulum Planlandı", mesaj: "Bornova/İzmir adresine kurulum planlandı.", okunduMu: false, tarih: new Date() },
    { kullaniciId: kullanicilar[0]._id, baslik: "Yeni Tedarik Siparişi", mesaj: "TS-2026-0005 numaralı tedarik siparişi oluşturuldu.", okunduMu: false, tarih: new Date() },
    { kullaniciId: kullanicilar[1]._id, baslik: "Stok Uyarısı", mesaj: "Modern Köşe Takımı stokta 12 adet kaldı.", okunduMu: false, tarih: new Date() },
    { kullaniciId: kullanicilar[1]._id, baslik: "Yeni Sipariş", mesaj: "SIP-2026-0006 siparişi beklemede, müşteri ile iletişime geçin.", okunduMu: false, tarih: new Date() },
    { kullaniciId: kullanicilar[2]._id, baslik: "Kurulum Atandı", mesaj: "Beşiktaş/İstanbul adresine kurulum atandı.", okunduMu: false, tarih: new Date() },
    { kullaniciId: kullanicilar[2]._id, baslik: "Kurulum Atandı", mesaj: "Antalya/ Merkez adresine kurulum atandı.", okunduMu: false, tarih: new Date() },
    { kullaniciId: kullanicilar[0]._id, baslik: "Garanti Talebi", mesaj: "İkili kanepe için yeni garanti talebi oluşturuldu.", okunduMu: false, tarih: new Date() },
  ]);
  console.log("✓ 8 bildirim eklendi");

  // ---------- İletişim Mesajları ----------
  const IletisimMesaji = mongoose.model("IletisimMesaji", IletisimMesajiSchema);
  await IletisimMesaji.insertMany([
    { adSoyad: "Can Öz", telefon: "0535 333 44 55", eposta: "can@example.com", mesaj: "Fiyat bilgisi almak istiyorum.", tarih: new Date() },
    { adSoyad: "Sema Taş", telefon: "0536 666 77 88", eposta: "sema@example.com", mesaj: "Ürünlerin kalitesi hakkında bilgi alabilir miyim?", tarih: new Date() },
  ]);
  console.log("✓ 2 iletişim mesajı eklendi");

  console.log("\n========================================");
  console.log("✅ TÜM ÖRNEK VERİLER BAŞARIYLA EKLENDİ");
  console.log("========================================");
  console.log("\n📋 Kullanıcı Giriş Bilgileri:");
  console.log("   Admin:  admin@demiray.com / admin123");
  console.log("   Satış:  satis@demiray.com  / satis123");
  console.log("   Montaj: montaj@demiray.com / montaj123");
  console.log("   Üye:    ali@example.com    / uye123");
  console.log("   Üye:    elif@example.com   / uye123");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Hata:", err.message);
  process.exit(1);
});
