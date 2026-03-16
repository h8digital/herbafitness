'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou senha incorretos.'); setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (profile?.role === 'admin') router.push('/admin')
    else router.push('/shop')
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - decorativo */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)' }}>
        {/* Círculos decorativos */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full opacity-10" style={{ background: '#4CAF50' }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full opacity-10" style={{ background: '#66BB6A' }} />

        <div className="relative z-10 text-center">
          {/* Logo grande */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
                <ellipse cx="10" cy="10" rx="4" ry="7" fill="#A5D6A7" transform="rotate(-20 10 10)" />
                <ellipse cx="14" cy="8" rx="3.5" ry="6" fill="#C8E6C9" transform="rotate(20 14 8)" />
                <line x1="12" y1="14" x2="12" y2="22" stroke="#A5D6A7" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-black text-4xl tracking-wider text-white" style={{ fontFamily: 'Arial Black, sans-serif' }}>
              HERBA<span style={{ color: '#A5D6A7' }}>FIT</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">Bem-vindo de volta!</h2>
          <p className="text-green-200 text-lg leading-relaxed max-w-sm">
            Acesse sua conta e confira nossos produtos naturais e suplementos de qualidade.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {['🌿 Natural', '💪 Qualidade', '🚚 Entrega Rápida'].map(item => (
              <div key={item} className="rounded-2xl p-3 text-center text-sm font-medium text-green-100" style={{ background: 'rgba(255,255,255,0.1)' }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lado direito - formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#1B5E20' }}>
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                <ellipse cx="10" cy="10" rx="4" ry="7" fill="#4CAF50" transform="rotate(-20 10 10)" />
                <ellipse cx="14" cy="8" rx="3.5" ry="6" fill="#66BB6A" transform="rotate(20 14 8)" />
                <line x1="12" y1="14" x2="12" y2="22" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-black text-2xl tracking-wider" style={{ color: '#1B5E20', fontFamily: 'Arial Black, sans-serif' }}>
              HERBA<span style={{ color: '#4CAF50' }}>FIT</span>
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B5E20' }}>Entrar</h1>
          <p className="text-slate-500 mb-8">Acesse sua conta Herbafit</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2E7D32' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 transition"
                style={{ borderColor: '#c8e6c9', '--tw-ring-color': '#4CAF50' } as any}
                placeholder="seu@email.com" required />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium" style={{ color: '#2E7D32' }}>Senha</label>
                <Link href="/auth/forgot" className="text-xs font-medium transition-colors hover:opacity-70" style={{ color: '#4CAF50' }}>
                  Esqueci minha senha
                </Link>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 transition"
                style={{ borderColor: '#c8e6c9' }}
                placeholder="••••••••" required />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full font-semibold py-3 px-4 rounded-xl transition-all text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #1B5E20, #388E3C)' }}>
              {loading ? 'Entrando...' : 'Entrar na conta'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Não tem conta?{' '}
            <Link href="/auth/register" className="font-semibold transition-colors hover:opacity-70" style={{ color: '#2E7D32' }}>
              Solicitar cadastro
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
