/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Next.js 16+ config
  serverExternalPackages: ['@supabase/supabase-js'],
}

module.exports = nextConfig
