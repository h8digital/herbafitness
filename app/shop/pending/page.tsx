import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PendingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('status, full_name').eq('id', user.id).single()
  if (profile?.status === 'approved') redirect('/shop')

  async function logout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f1f8f1 0%, #e8f5e9 100%)' }}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border p-8 text-center" style={{ borderColor: '#c8e6c9' }}>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
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

        {profile?.status === 'rejected' ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#1B5E20' }}>Cadastro Rejeitado</h2>
            <p className="text-slate-500 mb-6">Entre em contato com nossa equipe para mais informações.</p>
            <a href="mailto:contato@herbafit.com.br"
              className="inline-block text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              style={{ background: '#1B5E20' }}>
              Entrar em Contato
            </a>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#e8f5e9' }}>
              <svg className="w-8 h-8 animate-spin" style={{ color: '#4CAF50' }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#1B5E20' }}>Aguardando Aprovação</h2>
            <p className="text-slate-500 mb-2">
              Olá, <strong>{profile?.full_name?.split(' ')[0] || 'cliente'}</strong>!
            </p>
            <p className="text-slate-500 mb-6">
              Seu cadastro está sendo analisado. Você receberá acesso em breve.
            </p>
            <div className="rounded-2xl p-4 mb-6 text-left space-y-3" style={{ background: '#f1f8f1' }}>
              <p className="text-sm flex items-center gap-2" style={{ color: '#2E7D32' }}>
                <span className="text-green-500 font-bold">✓</span> Cadastro enviado
              </p>
              <p className="text-sm flex items-center gap-2" style={{ color: '#4CAF50' }}>
                <span>⏳</span> Análise em andamento
              </p>
              <p className="text-sm flex items-center gap-2 text-slate-400">
                <span>○</span> Acesso liberado
              </p>
            </div>
          </>
        )}

        <form action={logout}>
          <button type="submit" className="text-sm transition-colors hover:opacity-70" style={{ color: '#5a8a5a' }}>
            Sair da conta
          </button>
        </form>
      </div>
    </div>
  )
}
