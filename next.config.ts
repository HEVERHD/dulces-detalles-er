import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // opcionalmente podrías afinar aún más:
        // pathname: "/dmfcu3tnj/image/upload/**",
      },
    ],
  },
};

export default nextConfig;
