# Demiray Mobilya — Yönetim Paneli

Next.js 16 (App Router) + TypeScript + TailwindCSS + MongoDB tabanlı mobilya mağazası yönetim sistemi.

## Gereksinimler

- Node.js 20+
- MongoDB (>=6.0)
- Cloudinary hesabı (resim yönetimi için)

## Kurulum

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Ortam değişkenlerini ayarla
cp .env.example .env.local
# .env.local dosyasını düzenleyin (aşağıdaki değişkenleri doldurun)

# 3. MongoDB'yi başlat
mongod --dbpath ~/mongodb_data --bind_ip 0.0.0.0 --port 27017 --fork

# 4. Geliştirme sunucusunu başlat
npm run dev
```

## Ortam Değişkenleri

```
MONGODB_URI=mongodb://localhost:27017/demiray
AUTH_SECRET=<random-64-chars>
AUTH_URL=http://192.168.3.7:3000
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud-name>
```

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu (port 3000) |
| `npm run build` | Production build |
| `npm start` | Production sunucu |

## Roller

| Rol | Erişim |
|---|---|
| **admin** | Tüm modüller |
| **satis** | Ürünler, Müşteriler, Siparişler, Tedarikçiler, Kategoriler |
| **montaj** | Kurulumlar (kendi atananları) |

## Modüller / Koleksiyonlar

### kullanicilar
| Alan | Tip | Açıklama |
|---|---|---|
| adSoyad | String | Kullanıcı adı |
| eposta | String (unique) | E-posta |
| sifre | String (hashed) | bcrypt şifre |
| rol | enum | admin / satis / montaj |
| aktifMi | Boolean | Hesap durumu |

### kategoriler
| Alan | Tip | Açıklama |
|---|---|---|
| kategoriAdi | String | Kategori adı |
| resim | String | Görsel URL |
| sira | Number | Sıralama |

### urunler
| Alan | Tip | Açıklama |
|---|---|---|
| kategoriId | ObjectId (ref) | Kategori |
| urunAdi | String | Ürün adı |
| fiyat | Number | Birim fiyat |
| stok | Number | Stok miktarı |
| garantiSuresi | Number | Garanti süresi (yıl) |
| kapakResmi | String | Kapak görseli |
| resimler | [UrunResim] | Çoklu görsel |
| yayinlandiMi | Boolean | Yayında mı |

### musteriler
| Alan | Tip | Açıklama |
|---|---|---|
| adSoyad | String | Müşteri adı |
| telefon | String | Telefon |
| eposta | String | E-posta |
| adres | String | Adres |

### siparisler
| Alan | Tip | Açıklama |
|---|---|---|
| musteriId | ObjectId (ref) | Müşteri |
| siparisNo | String (unique) | `SIP-YYYY-NNNN` |
| durum | enum | beklemede → onaylandi → hazirlaniyor → kargoda → teslim_edildi / iptal |
| urunler | [SiparisUrun] | Sipariş edilen ürünler (snapshot) |
| toplamTutar | Number | Toplam tutar |
| dinamikTeslimatAdresi | String | Teslimat adresi |
| dinamikFaturaAdresi | String | Fatura adresi |

### kurulumlar
| Alan | Tip | Açıklama |
|---|---|---|
| siparisId | ObjectId (ref) | Sipariş |
| urunId | ObjectId (ref) | Ürün |
| montajKullaniciId | ObjectId (ref) | Atanan montaj personeli |
| kurulumTarihi | Date | Planlanan tarih |
| durum | enum | planlandi / tamamlandi / iptal |

### kurulum_fotograflari
| Alan | Tip | Açıklama |
|---|---|---|
| kurulumId | ObjectId (ref) | Kurulum |
| resim | String | Cloudinary URL |
| aciklama | String | Açıklama |

### garantiler
| Alan | Tip | Açıklama |
|---|---|---|
| siparisId | ObjectId (ref) | Sipariş |
| musteriId | ObjectId (ref) | Müşteri |
| urunId | ObjectId (ref) | Ürün |
| garantiBaslangic | Date | Başlangıç tarihi |
| garantiBitis | Date | Bitiş tarihi |
| *(durum)* | *(hesaplanan)* | `aktif` / `suresi_doldu` (sorgu anında `garantiBitis`'e göre) |

### garanti_talepleri
| Alan | Tip | Açıklama |
|---|---|---|
| garantiId | ObjectId (ref) | Garanti |
| aciklama | String | Şikayet açıklaması |
| durum | enum | acik / inceleniyor / cozuldu |

### tedarikciler
| Alan | Tip | Açıklama |
|---|---|---|
| firmaAdi | String | Firma adı |
| telefon | String | Telefon |
| eposta | String | E-posta |

### tedarik_siparisleri
| Alan | Tip | Açıklama |
|---|---|---|
| tedarikciId | ObjectId (ref) | Tedarikçi |
| siparisNo | String | Sipariş no |
| durum | enum | beklemede / yolda / teslim_alindi |
| urunler | [TedarikSiparisUrun] | Ürün + adet |

### slider, galeri
| Alan | Tip | Açıklama |
|---|---|---|
| baslik | String | Başlık |
| resim | String | Görsel URL |
| sira | Number | Sıralama |
| *(galeri)* tur | String | Galeri türü |

### sayfalar
| Alan | Tip | Açıklama |
|---|---|---|
| baslik | String | Sayfa başlığı |
| slug | String (unique) | URL slug |
| icerik | String | HTML içerik |

### magaza
| Alan | Tip | Açıklama |
|---|---|---|
| magazaAdi | String | Mağaza adı |
| telefon / adres / logo | String | İletişim |
| koordinat | { lat, lng } | Harita koordinatları |

### bildirimler
| Alan | Tip | Açıklama |
|---|---|---|
| kullaniciId | ObjectId (ref) | Alıcı kullanıcı |
| baslik | String | Bildirim başlığı |
| mesaj | String | Bildirim metni |
| okunduMu | Boolean | Okunma durumu |

### islem_kayitlari (audit log)
| Alan | Tip | Açıklama |
|---|---|---|
| kullaniciId | ObjectId (ref) | İşlemi yapan |
| islem | String | ekle / guncelle / sil |
| koleksiyon | String | Koleksiyon adı |
