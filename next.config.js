/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['firebase'],
  images: {
    remotePatterns: [
      // Allow any HTTPS image source — event covers can come from any host
      { protocol: 'https', hostname: '**' },
    ],
  },
}

module.exports = nextConfig
