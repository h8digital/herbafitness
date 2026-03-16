'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'
import { Product } from '@/types'

interface Bundle {
  id: string
  quantity: number
  price: number
  label: string | null
}

interface BundleSelectorProps {
  product: Product
  bundles: Bundle[]
}

export default function BundleSelector({ product, bundles }: BundleSelectorProps) {
  const [selected, setSelected] = useState<'unit' | string>('unit')
  const addItem = useCartStore(s => s.addItem)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    if (selected === 'unit') {
      addItem(product, 1)
    } else {
      const bundle = bundles.find(b => b.id === selected)
      if (bundle) {
        // Adiciona a quantidade do pacote com o preço unitário do pacote
        const bundleProduct = {
          ...product,
          price: bundle.price / bundle.quantity, // preço unitário do pacote
          name: `${product.name} (${bundle.quantity}x)`,
        }
        addItem(bundleProduct as Product, bundle.quantity)
      }
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const unitPricePerItem = (bundle: Bundle) => bundle.price / bundle.quantity
  const savings = (bundle: Bundle) => (product.price * bundle.quantity) - bundle.price

  if (bundles.length === 0) {
    return (
      <button onClick={handleAdd}
        className="w-full font-black text-white py-4 rounded-2xl text-sm transition-all"
        style={{ background: added ? '#16a34a' : 'linear-gradient(135deg, #1B5E20, #4CAF50)' }}>
        {added ? '✓ Adicionado ao carrinho!' : 'Adicionar ao Carrinho'}
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-slate-900">Escolha a quantidade:</p>

      {/* Opção unitária */}
      <label
        onClick={() => setSelected('unit')}
        className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selected === 'unit' ? 'border-green-600 bg-green-50' : 'border-slate-200 bg-white hover:border-green-300'}`}>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected === 'unit' ? 'border-green-600' : 'border-slate-300'}`}>
          {selected === 'unit' && <div className="w-2.5 h-2.5 rounded-full bg-green-600" />}
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm text-slate-900">1 unidade</p>
          <p className="text-xs text-slate-400">Preço unitário</p>
        </div>
        <p className="font-black text-base" style={{ color: '#1B5E20' }}>
          {formatCurrency(product.price)}
        </p>
      </label>

      {/* Pacotes com desconto */}
      {bundles.map(bundle => {
        const saving = savings(bundle)
        const isSelected = selected === bundle.id
        return (
          <label key={bundle.id}
            onClick={() => setSelected(bundle.id)}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${isSelected ? 'border-green-600 bg-green-50' : 'border-slate-200 bg-white hover:border-green-300'}`}>

            {/* Badge de economia */}
            {saving > 0 && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl">
                -{Math.round((saving / (product.price * bundle.quantity)) * 100)}%
              </div>
            )}

            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-green-600' : 'border-slate-300'}`}>
              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-green-600" />}
            </div>

            <div className="flex-1 min-w-0 pr-8">
              <p className="font-bold text-sm text-slate-900">
                {bundle.quantity} unidades
                {bundle.label && <span className="text-xs font-normal text-slate-400 ml-1">· {bundle.label}</span>}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-slate-400 line-through">{formatCurrency(product.price * bundle.quantity)}</p>
                {saving > 0 && (
                  <p className="text-xs font-semibold text-green-600">Economize {formatCurrency(saving)}</p>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {formatCurrency(unitPricePerItem(bundle))} cada
              </p>
            </div>

            <p className="font-black text-base flex-shrink-0" style={{ color: '#1B5E20' }}>
              {formatCurrency(bundle.price)}
            </p>
          </label>
        )
      })}

      {/* Botão adicionar */}
      <button onClick={handleAdd} disabled={product.stock === 0}
        className="w-full font-black text-white py-4 rounded-2xl text-sm transition-all disabled:opacity-50"
        style={{ background: added ? '#16a34a' : 'linear-gradient(135deg, #1B5E20, #4CAF50)' }}>
        {product.stock === 0 ? 'Sem estoque' : added ? '✓ Adicionado ao carrinho!' : 'Adicionar ao Carrinho'}
      </button>
    </div>
  )
}
