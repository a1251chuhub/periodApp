/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // next-intl configuration
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
}

module.exports = nextConfig
