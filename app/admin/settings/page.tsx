import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('settings').select('*').eq('id', 'default').single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
          Configurações
        </h1>
        <p className="text-slate-500 text-sm mt-1">Configure os parâmetros do sistema</p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  )
}
