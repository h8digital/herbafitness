'use client'

import { useState, useEffect } from 'react'
import { useShippingZip } from '@/store/shippingZip'
import { formatCurrency } from '@/lib/utils'
import { Product } from '@/types'

export default function ShippingEstimate({ product }: { product: Product }) {
  const { zip, city, state } = useShippingZip()
  const [options, setOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    if (!zip || fetched) return
    calculate()
  }, [zip])

  async function calculate() {
    if (!zip) return
    setLoading(true)
    try {
      const res = await fetch('/api/superfrete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: { zip },
          items: [{
            weight: product.weight || 0.5,
            height: product.height || 10,
            width: product.width || 15,
            length: product.length || 20,
            quantity: 1,
          }]
        })
      })
      const data = await res.json()
      setOptions((data.options || []).slice(0, 3))
      setFetched(true)
    } catch { }
    setLoading(false)
  }

  if (!zip) return null

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🚚</span>
        <p className="text-sm font-bold text-slate-900">
          Frete para <span style={{ color: '#1B5E20' }}>{city}/{state}</span>
        </p>
        <button onClick={() => { setFetched(false); setOptions([]); calculate() }}
          className="ml-auto text-xs underline" style={{ color: '#4CAF50' }}>
          Recalcular
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Calculando...
        </div>
      ) : options.length > 0 ? (
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-700">{opt.name}</p>
                <p className="text-[11px] text-slate-400">{opt.days} dias úteis</p>
              </div>
              <p className="font-bold text-sm" style={{ color: '#1B5E20' }}>
                {opt.price === 0 ? 'Grátis' : formatCurrency(opt.price)}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
