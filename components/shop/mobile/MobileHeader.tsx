'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'

interface MobileHeaderProps {
  profile: Profile
  onCartOpen?: () => void
}

export default function MobileHeader({ profile, onCartOpen }: MobileHeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [search, setSearch] = useState('')

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) router.push(`/shop?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <header className="sticky top-0 z-40 w-full" style={{ background: '#1B5E20' }}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        {/* Logo compacta */}
        <Link href="/shop" className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/20">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <ellipse cx="10" cy="10" rx="4" ry="7" fill="#A5D6A7" transform="rotate(-20 10 10)" />
              <ellipse cx="14" cy="8" rx="3.5" ry="6" fill="#C8E6C9" transform="rotate(20 14 8)" />
              <line x1="12" y1="14" x2="12" y2="22" stroke="#A5D6A7" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-black text-white text-sm tracking-wider" style={{ fontFamily: 'Arial Black, sans-serif' }}>
            HERBA<span style={{ color: '#A5D6A7' }}>FIT</span>
          </span>
        </Link>

        {/* Barra de busca */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="flex items-center bg-white rounded-xl overflow-hidden">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar produtos..."
              className="flex-1 px-3 py-2 text-sm text-slate-800 outline-none bg-transparent"
            />
            <button type="submit" className="px-3 py-2" style={{ color: '#1B5E20' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Avatar / sair */}
        <button onClick={handleLogout}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 flex-shrink-0">
          <span className="text-white font-bold text-xs">
            {profile.full_name?.charAt(0).toUpperCase() || 'U'}
          </span>
        </button>
      </div>

      {/* Saudação */}
      <div className="px-4 pb-3">
        <p className="text-white/80 text-xs">
          Olá, <span className="text-white font-semibold">{profile.full_name?.split(' ')[0] || 'cliente'}</span> 👋
        </p>
      </div>
    </header>
  )
}
