import type { NextConfig } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    const isProd = process.env.NODE_ENV === "production";

    if (!isProd) {
      return { beforeFiles: [] };
    }

    return {
      beforeFiles: [
        {
          source: "/api/app/:path*",
          destination: `${API_BASE}/api/app/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
