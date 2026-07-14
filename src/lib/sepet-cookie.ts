const COOKIE_NAME = "misafir_sepet_id";

export function getMisafirSepetIdFromCookie(): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setMisafirSepetIdCookie(id: string) {
  const maxAge = 60 * 60 * 24 * 30; // 30 gün
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(id)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearMisafirSepetIdCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function getOrCreateMisafirSepetId(): string {
  let id = getMisafirSepetIdFromCookie();
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    setMisafirSepetIdCookie(id);
  }
  return id;
}
