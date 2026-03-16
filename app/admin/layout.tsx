import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/shop')

  return (
    <>
      {/* Bloqueio mobile — só aparece em telas < lg */}
      <div className="flex lg:hidden min-h-screen items-center justify-center bg-slate-900 p-8">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: '#1B5E20' }}>
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-white font-black text-xl mb-2" style={{ fontFamily: 'Arial Black, sans-serif' }}>
            Painel Administrativo
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            O painel admin é otimizado para <strong className="text-slate-300">desktop</strong>.
            Acesse pelo computador para uma melhor experiência.
          </p>
          <div className="bg-slate-800 rounded-2xl p-4 text-left space-y-2">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Acesse pelo computador</p>
            <p className="text-green-400 text-sm font-mono break-all">herbafitness.vercel.app/admin</p>
          </div>
        </div>
      </div>

      {/* Layout desktop — só aparece em telas >= lg */}
      <div className="hidden lg:flex h-screen bg-slate-50 overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <AdminHeader profile={profile} />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
