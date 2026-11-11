import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Audio de hasta 30 MiB más la envoltura multipart.
  experimental: { proxyClientMaxBodySize: "31mb" },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${
          process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000"
        }/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
