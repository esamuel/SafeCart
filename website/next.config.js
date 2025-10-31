/** @type {import('next').NextConfig} */
const nextConfig = {
  // For static export (Namecheap), we can't use built-in i18n routing
  // We'll handle multi-language support client-side
  output: 'export', // Static export for Namecheap hosting
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true, // Better for static hosting
}

module.exports = nextConfig
