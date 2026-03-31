import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel serverless: increase body size limit
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Оптимизация изображений
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 дней
  },
  // Сжатие
  compress: true,
  // Кэширование заголовки
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|png|webp|avif|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
