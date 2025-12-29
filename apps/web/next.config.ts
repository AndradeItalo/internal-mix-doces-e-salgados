import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.NODE_ENV === 'production' 
          ? "https://internal-mix-doces-e-salgados.vercel.app/api/:path*"
          : "http://localhost:4000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
