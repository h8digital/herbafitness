'use client'

import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/orders': 'Pedidos',
  '/admin/customers': 'Clientes',
  '/admin/products': 'Produtos',
  '/admin/categories': 'Categorias',
  '/admin/coupons': 'Cupons',
  '/admin/stock': 'Estoque',
  '/admin/import': 'Importar Preços',
  '/admin/settings': 'Configurações',
}

export default function AdminHeader({ profile }: { profile: Profile }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Encontrar título da página atual
  const title = Object.entries(PAGE_TITLES)
    .filter(([path]) => pathname.startsWith(path))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] || 'Admin'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-8"
      style={{ height: 64 }}>

      {/* Título da página */}
      <h1 className="font-bold text-slate-900 text-lg"
        style={{ fontFamily: 'var(--font-display)' }}>
        {title}
      </h1>

      {/* Direita: info + ações */}
      <div className="flex items-center gap-3">
        {/* Badge ambiente */}
        <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: '#e8f5e9', color: '#1B5E20' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Produção
        </span>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200" />

        {/* Info do usuário */}
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-900 leading-tight">
            {profile.full_name || 'Admin'}
          </p>
          <p className="text-xs text-slate-400 leading-tight">{profile.email}</p>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
          style={{ background: '#1B5E20' }}>
          {(profile.full_name || profile.email || 'A').charAt(0).toUpperCase()}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200" />

        {/* Logout */}
        <button onClick={handleLogout} title="Sair"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-red-50 group flex-shrink-0">
          <svg className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  )
}
