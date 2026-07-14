import jwt from "jsonwebtoken";

const UYE_JWT_SECRET = process.env.UYE_JWT_SECRET || "uye-jwt-secret-change-in-prod";

export function uyeTokenOlustur(payload: { uyeId: string; eposta: string }) {
  return jwt.sign(payload, UYE_JWT_SECRET, { expiresIn: "7d" });
}

export function uyeTokenDogrula(token: string) {
  try {
    return jwt.verify(token, UYE_JWT_SECRET) as { uyeId: string; eposta: string };
  } catch {
    return null;
  }
}

export function sifirlaTokeniOlustur() {
  const crypto = require("crypto");
  return crypto.randomBytes(32).toString("hex");
}
