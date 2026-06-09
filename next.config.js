/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jibvorqudveqgankoeak.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'seinstalapro.com', 'seinstalapro.com.ar', 'seinstalapro.com.br'],
    },
  },
}

module.exports = nextConfig
