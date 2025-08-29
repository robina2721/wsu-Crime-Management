/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    // Disable type checking during build (we'll handle it separately)
    ignoreBuildErrors: false,
  },
  eslint: {
    // Disable ESLint during builds (we'll handle it separately)
    ignoreDuringBuilds: false,
  },
  // Enable standalone output for deployment
  output: "standalone",
  // Image optimization
  images: {
    domains: ["placeholder.svg"],
  },
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
