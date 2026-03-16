'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function ResetForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Supabase envia o token como hash fragment (#access_token=...)
    // Precisamos deixar o cliente processar o hash automaticamente
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
      if (event === 'SIGNED_IN' && session) {
        setReady(true)
      }
    })

    // Verificar se há código na URL (fluxo PKCE)
    const code = searchParams.get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) setReady(true)
        else setError('Link inválido ou expirado. Solicite um novo.')
      })
    }

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Erro ao redefinir senha. Solicite um novo link.')
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
    setTimeout(() => router.push('/auth/login'), 3000)
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#e8f5e9' }}>
          <svg className="w-8 h-8" style={{ color: '#4CAF50' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#1B5E20' }}>Senha Redefinida!</h2>
        <p className="text-slate-500 mb-6">Redirecionando para o login...</p>
        <Link href="/auth/login"
          className="inline-block text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          style={{ background: '#1B5E20' }}>
          Ir para o Login
        </Link>
      </div>
    )
  }

  if (!ready && !error) {
    return (
      <div className="text-center py-8">
        <svg className="w-8 h-8 mx-auto mb-3 animate-spin" style={{ color: '#4CAF50' }} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-slate-500 text-sm">Verificando link...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#2E7D32' }}>Nova Senha</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-3 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 transition"
          style={{ borderColor: '#c8e6c9' }}
          placeholder="Mínimo 6 caracteres"
          minLength={6}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#2E7D32' }}>Confirmar Nova Senha</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className="w-full px-4 py-3 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 transition"
          style={{ borderColor: '#c8e6c9' }}
          placeholder="Repita a nova senha"
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}{' '}
          <Link href="/auth/forgot" className="underline font-medium">Solicitar novo link</Link>
        </div>
      )}

      <button type="submit" disabled={loading || !!error}
        className="w-full text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #1B5E20, #388E3C)' }}>
        {loading ? 'Salvando...' : 'Redefinir Senha'}
      </button>

      <p className="text-center text-sm text-slate-500">
        <Link href="/auth/login" className="font-medium hover:opacity-70 transition-colors" style={{ color: '#4CAF50' }}>
          Voltar ao login
        </Link>
      </p>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f1f8f1, #e8f5e9)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
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
          </Link>
          <h1 className="text-2xl font-bold mt-4" style={{ color: '#1B5E20' }}>Nova Senha</h1>
          <p className="text-slate-500 text-sm mt-1">Digite sua nova senha abaixo</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8" style={{ borderColor: '#c8e6c9' }}>
          <Suspense fallback={<div className="text-center py-4 text-slate-400">Carregando...</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
