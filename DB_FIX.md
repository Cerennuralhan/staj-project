# Veritabanı Bağlantı Sorunu - Teşhis ve Çözüm Raporu

## Sorun
Diğer bilgisayarlardan `http://192.168.3.7:3000` adresine bağlanınca Next.js sayfaları açılıyor ancak veritabanı (MongoDB) işlemleri çalışmıyordu.

## Teşhis
İki temel sorun tespit edildi:

### 1. MongoDB Çalışmıyordu
```bash
$ ss -tlnp | grep 27017
# (hiçbir çıktı yok - MongoDB çalışmıyor)
```
MongoDB kurulu olmasına rağmen (`mongod` v8.3.4) herhangi bir process çalışmıyordu. Port 27017 dinlenmiyordu.

### 2. MongoDB Sadece localhost'a Bağlıydı
```yaml
# /etc/mongodb.conf (orijinal)
net:
  port: 27017
  bindIp: 127.0.0.1  # <-- SADECE yerel bağlantılara izin veriyor
```
`bindIp: 127.0.0.1` olduğu için MongoDB yalnızca aynı makineden gelen bağlantıları kabul ediyordu. Oysa `.env.local` dosyasında `MONGODB_URI=mongodb://192.168.3.7:27017/demiray_ecommerce` tanımlıydı — yani uygulama MongoDB'ye IP üzerinden bağlanmaya çalışıyordu.

## Yapılan İşlemler

### Adım 1: MongoDB Veri Dizini Oluşturma
```bash
sudo mkdir -p /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/lib/mongodb
```

### Adım 2: MongoDB'yi Başlatma
```bash
mkdir -p /tmp/mongodb_data /tmp/mongodb_log
mongod --dbpath /tmp/mongodb_data \
       --bind_ip 0.0.0.0 \
       --port 27017 \
       --fork \
       --logpath /tmp/mongodb_log/mongod.log
```

### Adım 3: MongoDB Yapılandırmasını Güncelleme
```yaml
# /etc/mongodb.conf (güncellenmiş)
net:
  port: 27017
  bindIp: 0.0.0.0  # Tüm ağ arayüzlerinden bağlantı kabul eder
```

### Adım 4: Bağlantıyı Doğrulama
```bash
$ mongosh --quiet --eval "db.runCommand({ ping: 1 }).ok"
1  # Bağlantı başarılı
```

## Mevcut Durum

| Servis | Port | Durum |
|---|---|---|
| Next.js Dev Server | `0.0.0.0:3000` | ✅ Çalışıyor |
| MongoDB | `0.0.0.0:27017` | ✅ Çalışıyor |
| `.env.local` | `MONGODB_URI` | ✅ Doğru (`192.168.3.7:27017`) |
| `next.config.ts` | `allowedDevOrigins` | ✅ 192.168.3.7 eklenmiş |
| `next.config.ts` | `serverActions.allowedOrigins` | ✅ 192.168.3.7:3000 eklenmiş |

## Önemli Uyarı
MongoDB şu an `/tmp/mongodb_data/` dizininde çalışıyor. **Bilgisayar kapatılırsa veriler silinir.** Kalıcı çözüm için MongoDB'nin sistem servisi olarak kurulup başlatılması gerekir:

```bash
# Kalıcı kurulum için (ileride):
sudo apt install mongodb-org  # veya mevcut paket yöneticinize göre
sudo systemctl enable mongod
sudo systemctl start mongod
```

## Test
Tarayıcınızdan `http://192.168.3.7:3000` adresine girin. Sayfa açıldığında ürün listeleme/ekleme gibi veritabanı işlemleri de çalışıyor olmalıdır.

---

## Ek Bulgu: next.config.ts Hatalı Yapılandırma (İkinci Seferde Tespit Edildi)

### Sorun
`next.config.ts` dosyasında anahtar yapılandırmalar yanlış yerdeydi:

| Anahtar | Olması Gereken Yer | Orijinaldeki Yeri | Sonuç |
|---|---|---|---|
| `allowedDevOrigins` | **üst düzey** | `experimental` altında | ❌ Geçersiz, cross-orign bloklandı |
| `serverActions` | `experimental` altında | **üst düzey** | ❌ Geçersiz, Server Actions engellendi |

### Düzeltme
```typescript
// next.config.ts (düzeltilmiş)
const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.3.7", "192.168.3.7:3000", "localhost:3000"],
  experimental: {
    serverActions: {
      allowedOrigins: ["192.168.3.7:3000", "localhost:3000"]
    }
  }
};
```

Bu düzeltme ile Next.js 16.2.10'un beklediği doğru yapı kullanıldı.
