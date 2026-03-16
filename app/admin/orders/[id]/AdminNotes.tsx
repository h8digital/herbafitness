'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminNotes({ orderId, initialNotes }: { orderId: string; initialNotes: string | null }) {
  const [notes, setNotes] = useState(initialNotes || '')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function save() {
    setSaving(true)
    await supabase.from('orders').update({ admin_notes: notes }).eq('id', orderId)
    router.refresh()
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Notas Internas</h3>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={4}
        placeholder="Adicione notas internas sobre este pedido..."
        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
      />
      <button onClick={save} disabled={saving}
        className="mt-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-medium text-sm py-2 px-5 rounded-xl transition-colors">
        {saving ? 'Salvando...' : 'Salvar Nota'}
      </button>
    </div>
  )
}
