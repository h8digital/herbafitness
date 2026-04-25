import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MobileHeader from '@/components/shop/mobile/MobileHeader'
import BottomNav from '@/components/shop/mobile/BottomNav'
import DesktopHeader from '@/components/shop/desktop/DesktopHeader'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: categories } = await supabase.from('categories').select('*').eq('active', true).order('sort_order')

  return (
    <div className="min-h-screen" style={{ background: '#f8fdf8' }}>
      {/* Header mobile — visível só em telas < lg */}
      <div className="lg:hidden">
        <MobileHeader profile={profile} />
      </div>

      {/* Header desktop — visível só em telas >= lg */}
      <div className="hidden lg:block">
        <DesktopHeader profile={profile} categories={categories || []} />
      </div>

      {/* Conteúdo principal */}
      <main className="
        pb-20 lg:pb-8
        max-w-lg mx-auto
        lg:max-w-none lg:mx-0
        lg:flex lg:min-h-[calc(100vh-64px)]
      ">
        {children}
      </main>

      {/* Bottom nav — só no mobile */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
