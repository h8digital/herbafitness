'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/admin',           label: 'Dashboard',      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', exact: true },
  { href: '/admin/orders',    label: 'Pedidos',         icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { href: '/admin/customers', label: 'Clientes',        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { href: '/admin/products',  label: 'Produtos',        icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { href: '/admin/categories',label: 'Categorias',      icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { href: '/admin/coupons',   label: 'Cupons',          icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
  { href: '/admin/stock',     label: 'Estoque',         icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { href: '/admin/import',    label: 'Importar Preços', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  { href: '/admin/settings',  label: 'Configurações',   icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className="flex flex-col flex-shrink-0 transition-all duration-300 select-none"
      style={{
        width: collapsed ? 64 : 240,
        background: '#0d2e0d',
        borderRight: '1px solid #1a4a1a',
      }}>

      {/* Logo + toggle */}
      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid #1a4a1a', minHeight: 64 }}>
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#2d6a2d' }}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                <ellipse cx="10" cy="10" rx="4" ry="7" fill="#4CAF50" transform="rotate(-20 10 10)" />
                <ellipse cx="14" cy="8" rx="3.5" ry="6" fill="#66BB6A" transform="rotate(20 14 8)" />
                <line x1="12" y1="14" x2="12" y2="22" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-black text-sm tracking-wider whitespace-nowrap"
                style={{ color: '#e8f5e9', fontFamily: 'Arial Black, sans-serif' }}>
                HERBA<span style={{ color: '#66BB6A' }}>FIT</span>
              </p>
              <p className="text-xs truncate" style={{ color: '#4a7a4a' }}>Painel Admin</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto" style={{ background: '#2d6a2d' }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <ellipse cx="10" cy="10" rx="4" ry="7" fill="#4CAF50" transform="rotate(-20 10 10)" />
              <ellipse cx="14" cy="8" rx="3.5" ry="6" fill="#66BB6A" transform="rotate(20 14 8)" />
              <line x1="12" y1="14" x2="12" y2="22" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
          style={{ background: '#1a4a1a', color: '#7ab87a', marginLeft: collapsed ? 'auto' : 4 }}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}>
          <svg className="w-3.5 h-3.5 transition-transform" style={{ transform: collapsed ? 'rotate(180deg)' : '' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map(item => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl transition-all text-sm group relative ${
                collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'
              }`}
              style={isActive
                ? { background: '#2d6a2d', color: '#e8f5e9' }
                : { color: '#7ab87a' }}>
              <svg className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2 : 1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {!collapsed && (
                <span className="truncate font-medium text-sm">{item.label}</span>
              )}
              {/* Tooltip no modo collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                  style={{ background: '#0d2e0d', color: '#e8f5e9', border: '1px solid #2d6a2d' }}>
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Divider + ver loja */}
      <div className="px-2 py-2 space-y-0.5" style={{ borderTop: '1px solid #1a4a1a' }}>
        <Link href="/shop" target="_blank"
          title={collapsed ? 'Ver Loja' : undefined}
          className={`flex items-center gap-3 rounded-xl transition-all text-sm group relative hover:opacity-80 ${
            collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
          }`}
          style={{ color: '#4a8a4a' }}>
          <svg className="flex-shrink-0" style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {!collapsed && <span className="truncate text-sm">Ver Loja</span>}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
              style={{ background: '#0d2e0d', color: '#e8f5e9', border: '1px solid #2d6a2d' }}>
              Ver Loja
            </div>
          )}
        </Link>
      </div>
    </aside>
  )
}
