import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const cached = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

async function ensureIndexes() {
  const db = mongoose.connection.db;
  if (!db) return;

  const collections = await db.listCollections().toArray();
  const names = collections.map((c) => c.name);

  // urunler
  if (names.includes("uruns")) {
    await db.collection("uruns").createIndex({ kategoriId: 1 });
    await db.collection("uruns").createIndex({ yayinlandiMi: 1 });
    await db.collection("uruns").createIndex({ renk: 1 });
    await db.collection("uruns").createIndex({ materyal: 1 });
    await db.collection("uruns").createIndex({ warrantyPeriodMonths: 1 });
  }

  // siparisler
  if (names.includes("siparis")) {
    await db.collection("siparis").createIndex({ musteriId: 1 });
    await db.collection("siparis").createIndex({ siparisNo: 1 }, { unique: true });
  }

  // kurulumlar
  if (names.includes("kurulums")) {
    await db.collection("kurulums").createIndex({ siparisId: 1 });
    await db.collection("kurulums").createIndex({ montajKullaniciId: 1 });
  }

  // garantiler
  if (names.includes("garantis")) {
    await db.collection("garantis").createIndex({ siparisId: 1 });
    await db.collection("garantis").createIndex({ garantiBitis: 1 });
  }

  // kullanicilar
  if (names.includes("kullanicis")) {
    await db.collection("kullanicis").createIndex({ eposta: 1 }, { unique: true });
  }

  // sayfalar
  if (names.includes("sayfas")) {
    await db.collection("sayfas").createIndex({ slug: 1 }, { unique: true });
  }

  // bildirimler
  if (names.includes("bildirims")) {
    await db.collection("bildirims").createIndex({ kullaniciId: 1, okunduMu: 1 });
  }

  // uyeler
  if (names.includes("uyes")) {
    await db.collection("uyes").createIndex({ eposta: 1 }, { unique: true });
  }
  // musteriler
  if (names.includes("musteris")) {
    await db.collection("musteris").createIndex({ uyeId: 1 }, { sparse: true });
  }
  if (names.includes("septs")) {
    await db.collection("septs").createIndex({ uyeId: 1 });
    await db.collection("septs").createIndex({ misafirSepetId: 1 });
  }
  if (names.includes("favoris")) {
    await db.collection("favoris").createIndex({ uyeId: 1, urunId: 1 }, { unique: true });
  }
  if (names.includes("banners")) {
    await db.collection("banners").createIndex({ sira: 1 });
  }
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then(async (m) => {
      console.log("✓ MongoDB bağlantısı başarılı");
      await ensureIndexes();
      return m;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
