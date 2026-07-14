export type Rol = "admin" | "satis" | "montaj";
export type Modul =
  | "urun" | "musteri" | "siparis" | "kurulum"
  | "garanti" | "magaza" | "auth" | "tedarikci"
  | "kategori" | "mesaj";

const allModules: Modul[] = [
  "urun", "musteri", "siparis", "kurulum",
  "garanti", "magaza", "auth", "tedarikci", "kategori",
  "mesaj",
];

const roleModules: Record<Rol, Modul[]> = {
  admin: allModules,
  satis: ["urun", "musteri", "siparis", "tedarikci", "kategori", "mesaj"],
  montaj: ["kurulum"],
};

export function hasPermission(rol: Rol, modul: Modul): boolean {
  return roleModules[rol]?.includes(modul) ?? false;
}

export function getAllowedModules(rol: Rol): Modul[] {
  return roleModules[rol] ?? [];
}
