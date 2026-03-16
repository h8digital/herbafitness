'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const DELETABLE_STATUSES = ['pending', 'payment_pending', 'cancelled']

export default function DeleteOrderRowButton({ orderId, orderNumber, status }: {
  orderId: string
  orderNumber: string
  status: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  if (!DELETABLE_STATUSES.includes(status)) return null

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Excluir o pedido ${orderNumber}?`)) return
    setLoading(true)
    await supabase.from('order_items').delete().eq('order_id', orderId)
    await supabase.from('orders').delete().eq('id', orderId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
      title="Excluir pedido">
      {loading ? '...' : '🗑️'}
    </button>
  )
}
