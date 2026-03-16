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
  { href: '/admin/import', label: 'Importar Preços', icon: '📥' },
  { href: '/admin/settings', label: 'Configurações', icon: '⚙️' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 flex flex-col flex-shrink-0" style={{ background: '#0d2e0d' }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b" style={{ borderColor: '#1a4a1a' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#2d6a2d' }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <ellipse cx="10" cy="10" rx="4" ry="7" fill="#4CAF50" transform="rotate(-20 10 10)" />
              <ellipse cx="14" cy="8" rx="3.5" ry="6" fill="#66BB6A" transform="rotate(20 14 8)" />
              <line x1="12" y1="14" x2="12" y2="22" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="font-black text-sm tracking-wider" style={{ color: '#e8f5e9', fontFamily: 'Arial Black, sans-serif' }}>
              HERBA<span style={{ color: '#66BB6A' }}>FIT</span>
            </p>
            <p className="text-xs" style={{ color: '#4a7a4a' }}>Painel Admin</p>
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
                  ? 'font-medium'
                  : 'hover:opacity-80'
              }`}
              style={isActive
                ? { background: '#2d6a2d', color: '#e8f5e9' }
                : { color: '#7ab87a' }
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid #1a4a1a' }}>
        <form action="/api/auth/logout" method="post">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm w-full hover:opacity-80" style={{ color: '#7ab87a' }}>
            <span>🚪</span>
            <span>Sair</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
