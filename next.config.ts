// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      // súbelo a lo que necesites: 5mb, 10mb, 20mb...
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
