'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useCartStore, calcItemCount } from '@/store/cart'
import { createClient } from '@/lib/supabase/client'

// ─── Ícones SVG inline ────────────────────────────────────────────────────────
function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}
function IconCategories({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}
function IconCart() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}
function IconOrders({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}
function IconMore({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" strokeWidth={active ? 2.5 : 1.8} />
      <line x1="3" y1="12" x2="21" y2="12" strokeWidth={active ? 2.5 : 1.8} />
      <line x1="3" y1="18" x2="21" y2="18" strokeWidth={active ? 2.5 : 1.8} />
    </svg>
  )
}

// ─── Menu items do drawer "Mais" ──────────────────────────────────────────────
const moreItems = [
  {
    href: '/shop/wishlist',
    label: 'Favoritos',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: '/shop/profile',
    label: 'Meu Perfil',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href: '/shop/categories',
    label: 'Categorias',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
]

// ─── Componente principal ─────────────────────────────────────────────────────
export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const items = useCartStore(s => s.items)
  const itemCount = calcItemCount(items)
  const [moreOpen, setMoreOpen] = useState(false)
  const [profile, setProfile] = useState<{ full_name?: string; email?: string } | null>(null)

  // Fecha drawer ao mudar de rota
  useEffect(() => { setMoreOpen(false) }, [pathname])

  // Carregar nome do usuário para o drawer
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('full_name, email').eq('id', user.id).single()
          .then(({ data }) => setProfile(data))
      }
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const navItems = [
    { href: '/shop', label: 'Início',  exact: true, icon: (a: boolean) => <IconHome active={a} /> },
    { href: '/shop/categories', label: 'Categorias', icon: (a: boolean) => <IconCategories active={a} /> },
    // carrinho — posição central (tratado separadamente)
    { href: '/shop/orders', label: 'Pedidos', icon: (a: boolean) => <IconOrders active={a} /> },
  ]

  const isMoreActive = moreOpen || ['/shop/wishlist', '/shop/profile'].some(p => pathname.startsWith(p))

  return (
    <>
      {/* Overlay do drawer "Mais" */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setMoreOpen(false)} />
      )}

      {/* Drawer "Mais" — slide up */}
      <div
        className="fixed left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out"
        style={{
          bottom: 0,
          transform: moreOpen ? 'translateY(0)' : 'translateY(100%)',
        }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header do drawer com perfil */}
        {profile && (
          <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1B5E20, #4CAF50)' }}>
              {(profile.full_name || profile.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-900 truncate" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                {profile.full_name || 'Meu perfil'}
              </p>
              <p className="text-xs text-slate-400 truncate">{profile.email}</p>
            </div>
            <Link href="/shop/profile" onClick={() => setMoreOpen(false)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border"
              style={{ color: '#1B5E20', borderColor: '#c8e6c9' }}>
              Ver perfil &rsaquo;
            </Link>
          </div>
        )}

        {/* Itens do menu */}
        <div className="px-4 py-2">
          {moreItems.map(item => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-4 px-3 py-4 rounded-2xl transition-colors"
                style={{ color: isActive ? '#1B5E20' : '#374151',
                  background: isActive ? '#f1f8f1' : 'transparent' }}>
                <div style={{ color: isActive ? '#1B5E20' : '#6b7280' }}>{item.icon}</div>
                <span className={`text-sm ${isActive ? 'font-black' : 'font-medium'}`}
                  style={isActive ? { fontFamily: 'Arial Black, sans-serif' } : {}}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#1B5E20' }} />
                )}
              </Link>
            )
          })}
        </div>

        {/* Divider + sair */}
        <div className="px-4 pb-8 pt-1 border-t border-slate-100 mx-4">
          <button onClick={handleLogout}
            className="flex items-center gap-4 px-3 py-4 rounded-2xl w-full text-left transition-colors hover:bg-red-50">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium text-red-500">Sair</span>
          </button>
        </div>
      </div>

      {/* Barra de navegação principal */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white"
        style={{ boxShadow: '0 -1px 0 rgba(0,0,0,0.06), 0 -4px 20px rgba(0,0,0,0.06)' }}>
        <div className="flex items-end max-w-lg mx-auto" style={{ height: 64 }}>

          {/* Lado esquerdo: Início + Categorias */}
          {navItems.slice(0, 2).map(item => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                className="flex-1 flex flex-col items-center justify-center h-full gap-0.5 transition-colors"
                style={{ color: isActive ? '#1B5E20' : '#9ca3af' }}>
                {item.icon(isActive)}
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && <div className="absolute bottom-0 w-1 h-1 rounded-full" style={{ background: '#1B5E20' }} />}
              </Link>
            )
          })}

          {/* Centro: Carrinho elevado (estilo Mercado Livre) */}
          <div className="flex flex-col items-center justify-end flex-1 pb-1">
            <Link href="/shop/cart"
              className="relative flex items-center justify-center rounded-full transition-all active:scale-90"
              style={{
                width: 54,
                height: 54,
                marginBottom: 2,
                background: pathname === '/shop/cart'
                  ? 'linear-gradient(135deg, #155a15, #2e7d2e)'
                  : 'linear-gradient(135deg, #1B5E20, #4CAF50)',
                boxShadow: '0 4px 16px rgba(27,94,32,0.45)',
              }}>
              <IconCart />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
            <span className="text-[10px] font-medium" style={{ color: pathname === '/shop/cart' ? '#1B5E20' : '#9ca3af' }}>
              Carrinho
            </span>
          </div>

          {/* Lado direito: Pedidos + Mais */}
          {navItems.slice(2).map(item => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                className="flex-1 flex flex-col items-center justify-center h-full gap-0.5 transition-colors"
                style={{ color: isActive ? '#1B5E20' : '#9ca3af' }}>
                {item.icon(isActive)}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}

          {/* Mais */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex-1 flex flex-col items-center justify-center h-full gap-0.5 transition-colors"
            style={{ color: isMoreActive ? '#1B5E20' : '#9ca3af' }}>
            <IconMore active={isMoreActive} />
            <span className="text-[10px] font-medium">Mais</span>
          </button>

        </div>
      </nav>

      {/* Espaçador para o conteúdo não ficar atrás da nav */}
      <div style={{ height: 64 }} />
    </>
  )
}
