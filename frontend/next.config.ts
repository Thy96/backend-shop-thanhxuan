import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000', // cổng API backend của bạn
        pathname: '/**', // cho phép tất cả đường dẫn
      },
      {
        protocol: "https",
        hostname: "backend-shop-thanhxuan.onrender.com",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/:path*`,
        },
      ],
    };
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
