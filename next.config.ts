import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.3.7", "192.168.3.7:3000",
    "localhost:3000",
    "100.123.162.125", "100.123.162.125:3000",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "192.168.3.7:3000",
        "localhost:3000",
        "100.123.162.125:3000",
      ],
    },
  },
};

export default nextConfig;
