import crypto from "crypto";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
const API_KEY = process.env.CLOUDINARY_API_KEY || "";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

export function getCloudinaryConfig() {
  return { cloudName: CLOUD_NAME, apiKey: API_KEY };
}

export function generateSignature(params: Record<string, string | number>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha256").update(sorted + API_SECRET).digest("hex");
}

export function getUploadParams() {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder: "demiray" };
  return { ...params, signature: generateSignature(params), apiKey: API_KEY, cloudName: CLOUD_NAME };
}

export async function uploadBase64(base64: string, folder = "tedarikci-belgeler") {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error("Cloudinary yapılandırması eksik");
  }

  const formData = new URLSearchParams();
  formData.append("file", base64);
  formData.append("folder", folder);
  formData.append("upload_preset", "ml_default");
  formData.append("api_key", API_KEY);
  formData.append("timestamp", String(Math.floor(Date.now() / 1000)));

  const toSign = [...formData.entries()]
    .filter(([k]) => k !== "signature" && k !== "api_key")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const signature = crypto.createHash("sha1").update(toSign + API_SECRET).digest("hex");
  formData.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary hatası: ${err}`);
  }

  const data = await res.json();
  return data.secure_url as string;
}

export async function deleteImage(url: string) {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) return;
  const publicId = url.split("/").pop()?.split(".")[0];
  if (!publicId) return;

  const timestamp = String(Math.floor(Date.now() / 1000));
  const toSign = `public_id=${folderPrefix(url)}/${publicId}&timestamp=${timestamp}${API_SECRET}`;
  const signature = crypto.createHash("sha1").update(toSign).digest("hex");

  const formData = new URLSearchParams();
  formData.append("public_id", `${folderPrefix(url)}/${publicId}`);
  formData.append("api_key", API_KEY);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);

  await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`, {
    method: "POST",
    body: formData,
  });
}

function folderPrefix(url: string): string {
  const parts = url.split("/");
  const idx = parts.indexOf("upload");
  return idx >= 0 && idx + 2 < parts.length ? parts.slice(idx + 2, -1).join("/") : "tedarikci-belgeler";
}
