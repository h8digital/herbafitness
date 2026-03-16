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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        {profile?.status === 'rejected' ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Cadastro Rejeitado
            </h2>
            <p className="text-slate-500 mb-6">
              Seu cadastro foi rejeitado. Entre em contato com nossa equipe para mais informações.
            </p>
            <a href="mailto:contato@minhaloja.com.br"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors mb-3">
              Entrar em Contato
            </a>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Aguardando Aprovação
            </h2>
            <p className="text-slate-500 mb-2">
              Olá, <strong>{profile?.full_name?.split(' ')[0] || 'cliente'}</strong>!
            </p>
            <p className="text-slate-500 mb-6">
              Seu cadastro está sendo analisado pela nossa equipe. Você receberá um email assim que for aprovado.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2">
              <p className="text-sm text-slate-600 flex items-center gap-2">
                <span className="text-green-500">✓</span> Cadastro enviado
              </p>
              <p className="text-sm text-slate-600 flex items-center gap-2">
                <span className="text-yellow-500">⏳</span> Análise em andamento
              </p>
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <span>○</span> Acesso liberado
              </p>
            </div>
          </>
        )}
        <form action={logout}>
          <button type="submit" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            Sair da conta
          </button>
        </form>
      </div>
    </div>
  )
}
