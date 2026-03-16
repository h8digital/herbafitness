'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { useCartStore } from '@/store/cart'

export default function ShopHeader({ profile }: { profile: Profile }) {
  const router = useRouter()
  const supabase = createClient()
  const itemCount = useCartStore(s => s.itemCount)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/shop" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold" style={{ fontFamily: 'var(--font-display)' }}>M</span>
            </div>
            <span className="font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Minha Loja</span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/shop" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Produtos</Link>
            <Link href="/shop/orders" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Meus Pedidos</Link>
            <Link href="/shop/profile" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Meu Perfil</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Carrinho */}
            <Link href="/shop/cart" className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 hidden sm:block">{profile.full_name?.split(' ')[0]}</span>
              <button onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                title="Sair">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
