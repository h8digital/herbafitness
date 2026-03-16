import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: 'standalone',
  // Pages que usam Supabase não devem ser pré-renderizadas estaticamente
  experimental: {
    // força dynamic rendering para todas as páginas com auth
  },
}

export default nextConfig
