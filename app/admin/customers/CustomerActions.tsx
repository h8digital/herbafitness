'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'

export default function CustomerActions({ customer }: { customer: Profile }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function updateStatus(status: 'approved' | 'rejected') {
    setLoading(true)
    await supabase.from('profiles').update({ status }).eq('id', customer.id)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      {customer.status !== 'approved' && (
        <button
          onClick={() => updateStatus('approved')}
          disabled={loading}
          className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          ✅ Aprovar
        </button>
      )}
      {customer.status !== 'rejected' && (
        <button
          onClick={() => updateStatus('rejected')}
          disabled={loading}
          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          ❌ Rejeitar
        </button>
      )}
      <a
        href={`/admin/customers/${customer.id}`}
        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
      >
        Ver
      </a>
    </div>
  )
}
