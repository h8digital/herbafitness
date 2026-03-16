'use client'

import { useCartStore } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'
import { Product } from '@/types'
import Link from 'next/link'
import { useState } from 'react'

interface FrequentlyBoughtTogetherProps {
  currentProduct: Product
  suggestions: Array<{
    product: Product
    bundle_price: number | null
    bundle_label: string | null
    times_bought_together?: number
    source: 'manual' | 'automatic'
  }>
}

export default function FrequentlyBoughtTogether({ currentProduct, suggestions }: FrequentlyBoughtTogetherProps) {
  const addItem = useCartStore(s => s.addItem)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [added, setAdded] = useState(false)

  if (suggestions.length === 0) return null

  function toggle(productId: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(productId) ? next.delete(productId) : next.add(productId)
      return next
    })
  }

  function addSelected() {
    addItem(currentProduct, 1)
    suggestions.filter(s => selected.has(s.product.id)).forEach(s => addItem(s.product, 1))
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const totalPrice = currentProduct.price + suggestions
    .filter(s => selected.has(s.product.id))
    .reduce((sum, s) => sum + s.product.price, 0)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100" style={{ background: '#f1f8f1' }}>
        <p className="font-black text-sm text-slate-900" style={{ fontFamily: 'Arial Black, sans-serif' }}>
          🛍️ Frequentemente comprados juntos
        </p>
      </div>

      <div className="p-4 space-y-3">
        {/* Produto atual (sempre incluído) */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-green-600 bg-green-600">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-50">
            {currentProduct.images?.[0]?.url
              ? <img src={currentProduct.images[0].url} alt={currentProduct.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-lg">🌿</div>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-900 line-clamp-1">{currentProduct.name}</p>
            <p className="text-xs font-bold mt-0.5" style={{ color: '#1B5E20' }}>{formatCurrency(currentProduct.price)}</p>
          </div>
        </div>

        {/* Sugestões */}
        {suggestions.slice(0, 3).map(({ product, bundle_price, bundle_label, source }) => (
          <div key={product.id} className="flex items-center gap-3">
            {/* Separador + */}
            <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
              <span className="text-slate-300 font-bold">+</span>
            </div>

            {/* Checkbox */}
            <div
              onClick={() => toggle(product.id)}
              className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer relative border-2 transition-colors ${selected.has(product.id) ? 'border-green-500' : 'border-transparent'}`}>
              {product.images?.[0]?.url
                ? <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-slate-50 flex items-center justify-center text-lg">🌿</div>}
              {selected.has(product.id) && (
                <div className="absolute inset-0 bg-green-600/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link href={`/shop/products/${product.slug}`}>
                <p className="text-xs font-medium text-slate-900 line-clamp-1 hover:underline">{product.name}</p>
              </Link>
              {bundle_label && <p className="text-[10px] text-green-600 font-semibold">{bundle_label}</p>}
              {source === 'automatic' && (
                <p className="text-[10px] text-slate-400">Comprado junto frequentemente</p>
              )}
              <div className="flex items-center gap-1.5 mt-0.5">
                {bundle_price && bundle_price < product.price && (
                  <p className="text-[10px] text-slate-400 line-through">{formatCurrency(product.price)}</p>
                )}
                <p className="text-xs font-bold" style={{ color: '#1B5E20' }}>
                  {formatCurrency(bundle_price || product.price)}
                </p>
              </div>
            </div>

            <div
              onClick={() => toggle(product.id)}
              className={`w-5 h-5 rounded border-2 flex-shrink-0 cursor-pointer flex items-center justify-center transition-colors ${selected.has(product.id) ? 'bg-green-600 border-green-600' : 'border-slate-300'}`}>
              {selected.has(product.id) && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        ))}

        {/* Total e botão */}
        {selected.size > 0 && (
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-500">Total ({1 + selected.size} produtos)</p>
              <p className="font-black text-lg" style={{ color: '#1B5E20', fontFamily: 'Arial Black, sans-serif' }}>
                {formatCurrency(totalPrice)}
              </p>
            </div>
            <button onClick={addSelected}
              className="w-full font-black text-white py-3 rounded-xl text-sm transition-all"
              style={{ background: added ? '#16a34a' : 'linear-gradient(135deg, #1B5E20, #4CAF50)' }}>
              {added ? '✓ Adicionados!' : `Adicionar ${1 + selected.size} produtos ao carrinho`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
