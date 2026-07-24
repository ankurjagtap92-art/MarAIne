/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Silence Turbopack warning about custom webpack config
  turbopack: {},
};

module.exports = nextConfig;