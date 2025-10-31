/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config')

const nextConfig = {
  i18n,
  output: 'export', // Static export for Namecheap hosting
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true, // Better for static hosting
}

module.exports = nextConfig
