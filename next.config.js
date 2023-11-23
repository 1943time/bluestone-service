/** @type {import('next').NextConfig} */
const nextConfig = {
  crossOrigin: 'anonymous',
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: ['superagent']
  }
}

module.exports = nextConfig
