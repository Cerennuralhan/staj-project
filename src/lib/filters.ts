export const FIYAT_ARALIKLARI = [
  { label: "0 - 5.000₺", min: 0, max: 5000 },
  { label: "5.000₺ - 15.000₺", min: 5000, max: 15000 },
  { label: "15.000₺ - 30.000₺", min: 15000, max: 30000 },
  { label: "30.000₺ ve üzeri", min: 30000, max: null as number | null },
] as const;

export const SIRALAMA_SECENEKLERI = [
  { value: "cok_satan", label: "Çok Satanlar" },
  { value: "dusuk_butce", label: "Düşük Bütçe" },
  { value: "populer", label: "Popüler" },
  { value: "kampanyali", label: "Kampanyalı" },
] as const;
