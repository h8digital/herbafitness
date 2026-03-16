'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Coupon } from '@/types'

export default function CouponActions({ coupon }: { coupon: Coupon }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function toggleActive() {
    setLoading(true)
    await supabase.from('coupons').update({ active: !coupon.active }).eq('id', coupon.id)
    router.refresh()
    setLoading(false)
  }

  async function deleteCoupon() {
    if (!confirm(`Excluir o cupom "${coupon.code}"?`)) return
    setLoading(true)
    await supabase.from('coupons').delete().eq('id', coupon.id)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      <button onClick={toggleActive} disabled={loading}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${coupon.active ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' : 'bg-green-100 hover:bg-green-200 text-green-700'}`}>
        {coupon.active ? 'Desativar' : 'Ativar'}
      </button>
      <button onClick={deleteCoupon} disabled={loading}
        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
        🗑️
      </button>
    </div>
  )
}
