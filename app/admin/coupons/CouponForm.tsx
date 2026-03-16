'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CouponForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    code: '', description: '', discount_type: 'percentage',
    discount_value: '', min_order_value: '', max_discount: '',
    usage_limit: '', expires_at: '', active: true,
  })

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.from('coupons').insert({
      code: form.code.toUpperCase(),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      min_order_value: parseFloat(form.min_order_value) || 0,
      max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      expires_at: form.expires_at || null,
      active: form.active,
    })
    setForm({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_value: '', max_discount: '', usage_limit: '', expires_at: '', active: true })
    router.refresh()
    setLoading(false)
  }

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Novo Cupom</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Código *</label>
          <input className={`${inputClass} uppercase`} value={form.code} onChange={e => set('code', e.target.value)} placeholder="PROMO10" required />
        </div>
        <div>
          <label className={labelClass}>Descrição</label>
          <input className={inputClass} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Desconto especial" />
        </div>
        <div>
          <label className={labelClass}>Tipo de Desconto</label>
          <select className={inputClass} value={form.discount_type} onChange={e => set('discount_type', e.target.value)}>
            <option value="percentage">Porcentagem (%)</option>
            <option value="fixed">Valor Fixo (R$)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Valor do Desconto *</label>
          <input className={inputClass} value={form.discount_value} onChange={e => set('discount_value', e.target.value)} type="number" step="0.01" min="0" placeholder={form.discount_type === 'percentage' ? '10' : '50.00'} required />
        </div>
        <div>
          <label className={labelClass}>Pedido Mínimo (R$)</label>
          <input className={inputClass} value={form.min_order_value} onChange={e => set('min_order_value', e.target.value)} type="number" step="0.01" min="0" placeholder="0" />
        </div>
        {form.discount_type === 'percentage' && (
          <div>
            <label className={labelClass}>Desconto Máximo (R$)</label>
            <input className={inputClass} value={form.max_discount} onChange={e => set('max_discount', e.target.value)} type="number" step="0.01" min="0" placeholder="Sem limite" />
          </div>
        )}
        <div>
          <label className={labelClass}>Limite de Uso</label>
          <input className={inputClass} value={form.usage_limit} onChange={e => set('usage_limit', e.target.value)} type="number" min="1" placeholder="Ilimitado" />
        </div>
        <div>
          <label className={labelClass}>Data de Expiração</label>
          <input className={inputClass} value={form.expires_at} onChange={e => set('expires_at', e.target.value)} type="datetime-local" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors">
          {loading ? 'Criando...' : '+ Criar Cupom'}
        </button>
      </form>
    </div>
  )
}
