import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MobileHeader from '@/components/shop/mobile/MobileHeader'
import BottomNav from '@/components/shop/mobile/BottomNav'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="min-h-screen" style={{ background: '#f8fdf8' }}>
      <MobileHeader profile={profile} />
      <main className="pb-20 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
