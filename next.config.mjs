/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // Kept so legacy URLs still resolve if any slip through; new fixtures use /public/rugs.
      { protocol: "https", hostname: "isberian.com" },
      { protocol: "https", hostname: "cdn.isberian.com" },
    ],
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1600, 1920],
  },
  experimental: {
    optimizePackageImports: ["clsx", "@anthropic-ai/sdk"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
