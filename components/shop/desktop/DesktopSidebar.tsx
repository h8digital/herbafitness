'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
}

interface DesktopSidebarProps {
  categories: Category[]
  currentCategory?: string
  currentSearch?: string
}

export default function DesktopSidebar({ categories, currentCategory, currentSearch }: DesktopSidebarProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('shop-sidebar-collapsed')
    if (saved !== null) setCollapsed(saved === 'true')
  }, [])

  function toggleCollapse() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('shop-sidebar-collapsed', String(next))
  }

  function navigate(href: string) {
    router.push(href)
  }

  const isAllActive = !currentCategory && !currentSearch

  return (
    <aside
      className="flex-shrink-0 sticky top-16 self-start h-[calc(100vh-64px)] overflow-y-auto border-r transition-all duration-200"
      style={{
        width: collapsed ? 56 : 220,
        borderColor: '#e5f5e5',
        background: '#f0faf0',
      }}
    >
      {/* Botão colapsar */}
      <div className="flex items-center justify-end px-3 py-3 border-b" style={{ borderColor: '#e5f5e5' }}>
        <button
          onClick={toggleCollapse}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-green-100"
          style={{ color: '#1B5E20' }}
          title={collapsed ? 'Expandir categorias' : 'Recolher categorias'}
        >
          <svg
            className="w-4 h-4 transition-transform duration-200"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Label seção */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#4CAF50' }}>
            Categorias
          </p>
        </div>
      )}

      {/* Links */}
      <nav className={`py-2 space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
        <button
          onClick={() => navigate('/shop')}
          title={collapsed ? 'Todos os Produtos' : undefined}
          className={`w-full flex items-center gap-2.5 rounded-xl transition-all text-sm font-medium ${
            collapsed ? 'justify-center py-2.5 px-0' : 'px-3 py-2'
          }`}
          style={isAllActive
            ? { background: '#1B5E20', color: '#fff' }
            : { color: '#374151' }
          }
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isAllActive ? 2.5 : 1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          {!collapsed && <span className="truncate">Todos</span>}
        </button>

        {categories.map(cat => {
          const isActive = currentCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => navigate(`/shop?category=${cat.id}`)}
              title={collapsed ? cat.name : undefined}
              className={`w-full flex items-center gap-2.5 rounded-xl transition-all text-sm ${
                collapsed ? 'justify-center py-2.5 px-0' : 'px-3 py-2'
              }`}
              style={isActive
                ? { background: '#1B5E20', color: '#fff', fontWeight: 600 }
                : { color: '#374151', fontWeight: 400 }
              }
            >
              <span
                className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                style={isActive
                  ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                  : { background: '#d4edda', color: '#1B5E20' }
                }
              >
                {cat.name.charAt(0).toUpperCase()}
              </span>
              {!collapsed && <span className="truncate">{cat.name}</span>}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
