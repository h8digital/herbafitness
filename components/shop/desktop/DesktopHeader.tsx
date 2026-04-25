'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { useCartStore, calcItemCount } from '@/store/cart'
import CartDrawer from '@/components/shop/CartDrawer'

interface DesktopHeaderProps {
  profile: Profile
  categories: any[]
}

export default function DesktopHeader({ profile, categories }: DesktopHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const items = useCartStore(s => s.items)
  const itemCount = calcItemCount(items)
  const [cartOpen, setCartOpen] = useState(false)
  const [search, setSearch] = useState('')

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const term = search.trim()
    if (term) router.push(`/shop?q=${encodeURIComponent(term)}`)
    else router.push('/shop')
  }

  const navLinks = [
    { href: '/shop', label: 'Produtos', exact: true },
    { href: '/shop/orders', label: 'Pedidos' },
    { href: '/shop/wishlist', label: 'Favoritos' },
  ]

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full border-b"
        style={{ background: '#1B5E20', borderColor: 'rgba(255,255,255,0.12)' }}
      >
        <div className="flex items-center gap-6 px-6 h-16">
          {/* Logo */}
          <Link href="/shop" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/20">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <ellipse cx="10" cy="10" rx="4" ry="7" fill="#A5D6A7" transform="rotate(-20 10 10)" />
                <ellipse cx="14" cy="8" rx="3.5" ry="6" fill="#C8E6C9" transform="rotate(20 14 8)" />
                <line x1="12" y1="14" x2="12" y2="22" stroke="#A5D6A7" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-black text-white text-base tracking-wider" style={{ fontFamily: 'Arial Black, sans-serif' }}>
              HERBA<span style={{ color: '#A5D6A7' }}>FIT</span>
            </span>
          </Link>

          {/* Busca */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="flex items-center bg-white/15 hover:bg-white/20 focus-within:bg-white/25 rounded-xl overflow-hidden transition-colors">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar produtos..."
                className="flex-1 px-4 py-2.5 text-sm text-white placeholder-white/60 outline-none bg-transparent"
              />
              <button type="submit" className="px-3 py-2.5 text-white/80 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={isActive
                    ? { background: 'rgba(255,255,255,0.2)', color: '#fff' }
                    : { color: 'rgba(255,255,255,0.75)' }
                  }
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Carrinho */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 rounded-xl transition-colors hover:bg-white/15"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#4CAF50' }}>
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>

          {/* Avatar + nome */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/shop/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.2)' }}>
                {(profile.full_name || profile.email || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-white/90 hidden xl:block">
                {profile.full_name?.split(' ')[0] || 'Perfil'}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl transition-colors hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.6)' }}
              title="Sair"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
