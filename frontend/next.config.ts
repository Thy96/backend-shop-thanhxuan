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
    ],
  },
};

export default nextConfig;
