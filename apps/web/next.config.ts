import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.NODE_ENV === 'production' 
          ? "https://mix-doces-internal.vercel.app/:path*"
          : "http://localhost:4000/:path*",
      },
    ];
  },
};

export default nextConfig;
