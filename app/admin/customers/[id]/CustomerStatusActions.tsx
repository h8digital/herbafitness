'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'

export default function CustomerStatusActions({ customer }: { customer: Profile }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function updateStatus(status: 'approved' | 'rejected' | 'pending') {
    setLoading(true)
    await supabase.from('profiles').update({ status }).eq('id', customer.id)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="space-y-2">
      {customer.status !== 'approved' && (
        <button onClick={() => updateStatus('approved')} disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 text-sm">
          ✅ Aprovar Cadastro
        </button>
      )}
      {customer.status !== 'rejected' && (
        <button onClick={() => updateStatus('rejected')} disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 text-sm">
          ❌ Rejeitar Cadastro
        </button>
      )}
      {customer.status !== 'pending' && (
        <button onClick={() => updateStatus('pending')} disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-semibold py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 text-sm">
          ⏳ Marcar como Pendente
        </button>
      )}
    </div>
  )
}
