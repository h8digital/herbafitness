'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/types'

const DELETABLE_STATUSES = ['pending', 'payment_pending', 'cancelled']

export default function DeleteOrderButton({ order }: { order: Order }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  if (!DELETABLE_STATUSES.includes(order.status)) return null

  async function handleDelete() {
    if (!confirm(`Excluir o pedido ${order.order_number}?\n\nEsta ação não pode ser desfeita.`)) return
    setLoading(true)

    // Excluir itens primeiro, depois o pedido
    await supabase.from('order_items').delete().eq('order_id', order.id)
    await supabase.from('orders').delete().eq('id', order.id)

    router.push('/admin/orders')
    router.refresh()
    setLoading(false)
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      {loading ? 'Excluindo...' : 'Excluir Pedido'}
    </button>
  )
}
