'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
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

  const title = Object.entries(PAGE_TITLES)
    .filter(([path]) => pathname.startsWith(path))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] || 'Admin'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200 flex-shrink-0">
      <h1 className="font-bold text-slate-900 text-base" style={{ fontFamily: 'var(--font-display)' }}>
        {title}
      </h1>

      <div className="flex items-center gap-3">
        {/* ── Botão Ver Loja ── */}
        <Link
          href="/shop"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-green-50"
          style={{ color: '#1B5E20', borderColor: '#c8e6c9' }}
          title="Ver a loja como cliente"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Ver Loja
        </Link>

        {/* Perfil + sair */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white"
            style={{ background: 'linear-gradient(135deg, #1B5E20, #4CAF50)' }}>
            {(profile.full_name || profile.email || 'A').charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-slate-700 font-medium hidden xl:block">
            {profile.full_name?.split(' ')[0] || 'Admin'}
          </span>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Sair"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
