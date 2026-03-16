'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { Order } from '@/types'

const ALL_STATUSES = ['pending','payment_pending','payment_approved','processing','shipped','delivered','cancelled','refunded']

export default function OrderStatusSelect({ order }: { order: Order }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setLoading(true)
    await supabase.from('orders').update({ status: e.target.value }).eq('id', order.id)
    router.refresh()
    setLoading(false)
  }

  return (
    <select
      value={order.status}
      onChange={handleChange}
      disabled={loading}
      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer disabled:opacity-50 ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}
    >
      {ALL_STATUSES.map(s => (
        <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
      ))}
    </select>
  )
}
