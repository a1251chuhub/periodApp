/** @type {import('next').NextConfig} */
const nextConfig = {
  // next-intl configuration
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
}

module.exports = nextConfig
