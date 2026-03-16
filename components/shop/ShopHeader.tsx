'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { useCartStore } from '@/store/cart'
import CartDrawer from './CartDrawer'

export default function ShopHeader({ profile }: { profile: Profile }) {
  const router = useRouter()
  const supabase = createClient()
  const itemCount = useCartStore(s => s.itemCount)
  const [cartOpen, setCartOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <>
      <header className="bg-white border-b sticky top-0 z-40" style={{ borderColor: '#e8f5e9' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/shop" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#1B5E20' }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <ellipse cx="10" cy="10" rx="4" ry="7" fill="#4CAF50" transform="rotate(-20 10 10)" />
                  <ellipse cx="14" cy="8" rx="3.5" ry="6" fill="#66BB6A" transform="rotate(20 14 8)" />
                  <line x1="12" y1="14" x2="12" y2="22" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-black tracking-wider text-lg" style={{ color: '#1B5E20', fontFamily: 'Arial Black, sans-serif' }}>
                HERBA<span style={{ color: '#4CAF50' }}>FIT</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/shop" className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: '#1B5E20' }}>Produtos</Link>
              <Link href="/shop/orders" className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: '#1B5E20' }}>Meus Pedidos</Link>
              <Link href="/shop/profile" className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: '#1B5E20' }}>Meu Perfil</Link>
            </nav>

            <div className="flex items-center gap-3">
              <button onClick={() => setCartOpen(true)} className="relative p-2 transition-colors hover:opacity-70" style={{ color: '#1B5E20' }}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#4CAF50' }}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium hidden sm:block" style={{ color: '#1B5E20' }}>{profile.full_name?.split(' ')[0]}</span>
                <button onClick={handleLogout} className="p-2 transition-colors hover:opacity-70" style={{ color: '#4CAF50' }} title="Sair">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
