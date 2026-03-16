'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function StockAdjust({ productId, currentStock }: { productId: string; currentStock: number }) {
  const [open, setOpen] = useState(false)
  const [qty, setQty] = useState('')
  const [type, setType] = useState<'in' | 'out' | 'adjustment'>('in')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSave() {
    const quantity = parseInt(qty)
    if (!quantity || quantity <= 0) return
    setLoading(true)

    const newStock = type === 'in'
      ? currentStock + quantity
      : type === 'out'
      ? Math.max(0, currentStock - quantity)
      : quantity

    await Promise.all([
      supabase.from('products').update({ stock: newStock }).eq('id', productId),
      supabase.from('stock_movements').insert({ product_id: productId, type, quantity, reason: reason || null }),
    ])

    setOpen(false)
    setQty('')
    setReason('')
    router.refresh()
    setLoading(false)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors">
        Ajustar
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Ajustar Estoque</h3>
        <p className="text-sm text-slate-500 mb-4">Estoque atual: <strong className="text-slate-900">{currentStock}</strong></p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="in">Entrada</option>
              <option value="out">Saída</option>
              <option value="adjustment">Ajuste (definir valor)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {type === 'adjustment' ? 'Novo valor' : 'Quantidade'}
            </label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={e => setQty(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Motivo</label>
            <input
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Ex: Reposição de estoque"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setOpen(false)}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition-colors text-sm">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={loading || !qty}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
