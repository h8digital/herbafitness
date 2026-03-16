'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/orders', label: 'Pedidos', icon: '📦' },
  { href: '/admin/customers', label: 'Clientes', icon: '👥' },
  { href: '/admin/products', label: 'Produtos', icon: '🏷️' },
  { href: '/admin/categories', label: 'Categorias', icon: '📂' },
  { href: '/admin/coupons', label: 'Cupons', icon: '🎟️' },
  { href: '/admin/stock', label: 'Estoque', icon: '📋' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-slate-900 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>M</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm" style={{ fontFamily: 'var(--font-display)' }}>Minha Loja</p>
            <p className="text-slate-400 text-xs">Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(item => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                isActive
                  ? 'bg-orange-500 text-white font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-800">
        <form action="/api/auth/logout" method="post">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm w-full">
            <span>🚪</span>
            <span>Sair</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
