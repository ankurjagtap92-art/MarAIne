/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Silence Turbopack warning about custom webpack config
  turbopack: {},
};

module.exports = nextConfig;