'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'
import { Product } from '@/types'

interface VariationType {
  id: string
  name: string
  options: VariationOption[]
}

interface VariationOption {
  id: string
  value: string
  price_modifier: number
  stock: number
  active: boolean
}

interface VariationSelectorProps {
  product: Product
  variationTypes: VariationType[]
  bundles?: any[]
}

export default function VariationSelector({ product, variationTypes, bundles = [] }: VariationSelectorProps) {
  const addItem = useCartStore(s => s.addItem)
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [selectedBundle, setSelectedBundle] = useState<'unit' | string>('unit')
  const [added, setAdded] = useState(false)

  // Calcular preço com base nas variações selecionadas
  const priceModifier = variationTypes.reduce((sum, type) => {
    const optId = selected[type.id]
    const opt = type.options.find(o => o.id === optId)
    return sum + (opt?.price_modifier || 0)
  }, 0)

  const finalPrice = product.price + priceModifier

  // Verificar se todas as variações foram selecionadas
  const allSelected = variationTypes.every(t => selected[t.id])

  // Estoque da combinação selecionada (menor estoque entre opções)
  const variantStock = variationTypes.length > 0
    ? Math.min(...variationTypes.map(t => {
        const opt = t.options.find(o => o.id === selected[t.id])
        return opt?.stock ?? product.stock
      }))
    : product.stock

  function handleAdd() {
    if (!allSelected && variationTypes.length > 0) return

    const variantName = variationTypes.length > 0
      ? `${product.name} (${variationTypes.map(t => {
          const opt = t.options.find(o => o.id === selected[t.id])
          return opt?.value || ''
        }).join(', ')})`
      : product.name

    const productVariant = {
      ...product,
      name: variantName,
      price: finalPrice,
    }

    const qty = selectedBundle !== 'unit'
      ? bundles.find((b: any) => b.id === selectedBundle)?.quantity || 1
      : 1

    addItem(productVariant as Product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="space-y-4">
      {/* Seletores de variação */}
      {variationTypes.map(type => (
        <div key={type.id}>
          <p className="text-sm font-bold text-slate-900 mb-2">
            {type.name}
            {!selected[type.id] && <span className="text-red-400 text-xs font-normal ml-1">— selecione</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {type.options.filter(o => o.active).map(opt => {
              const isSelected = selected[type.id] === opt.id
              const outOfStock = opt.stock === 0
              return (
                <button
                  key={opt.id}
                  onClick={() => !outOfStock && setSelected(prev => ({ ...prev, [type.id]: opt.id }))}
                  disabled={outOfStock}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all relative ${
                    outOfStock ? 'opacity-40 cursor-not-allowed' :
                    isSelected ? 'border-green-600 text-white' : 'border-slate-200 text-slate-700 hover:border-green-400'
                  }`}
                  style={isSelected ? { background: '#1B5E20', borderColor: '#1B5E20' } : {}}>
                  {opt.value}
                  {opt.price_modifier !== 0 && (
                    <span className={`ml-1 text-[10px] ${isSelected ? 'text-green-200' : 'text-slate-400'}`}>
                      {opt.price_modifier > 0 ? '+' : ''}{formatCurrency(opt.price_modifier)}
                    </span>
                  )}
                  {outOfStock && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[9px] text-slate-400">Esgotado</span>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Preço final atualizado */}
      {variationTypes.length > 0 && priceModifier !== 0 && (
        <div className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-2 border border-green-100">
          <span className="text-sm text-slate-500">Preço para esta opção:</span>
          <span className="font-black text-lg" style={{ color: '#1B5E20', fontFamily: 'Arial Black, sans-serif' }}>
            {formatCurrency(finalPrice)}
          </span>
        </div>
      )}

      {/* Pacotes */}
      {bundles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-bold text-slate-900">Quantidade:</p>

          <label onClick={() => setSelectedBundle('unit')}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedBundle === 'unit' ? 'border-green-600 bg-green-50' : 'border-slate-200'}`}>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedBundle === 'unit' ? 'border-green-600' : 'border-slate-300'}`}>
              {selectedBundle === 'unit' && <div className="w-2 h-2 rounded-full bg-green-600" />}
            </div>
            <span className="text-sm font-semibold text-slate-900 flex-1">1 unidade</span>
            <span className="font-black text-sm" style={{ color: '#1B5E20' }}>{formatCurrency(finalPrice)}</span>
          </label>

          {bundles.map((bundle: any) => {
            const saving = (finalPrice * bundle.quantity) - bundle.price
            return (
              <label key={bundle.id} onClick={() => setSelectedBundle(bundle.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden ${selectedBundle === bundle.id ? 'border-green-600 bg-green-50' : 'border-slate-200'}`}>
                {saving > 0 && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg">
                    -{Math.round((saving / (finalPrice * bundle.quantity)) * 100)}%
                  </div>
                )}
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedBundle === bundle.id ? 'border-green-600' : 'border-slate-300'}`}>
                  {selectedBundle === bundle.id && <div className="w-2 h-2 rounded-full bg-green-600" />}
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <span className="text-sm font-semibold text-slate-900">{bundle.quantity} unidades</span>
                  {saving > 0 && <span className="text-xs text-green-600 ml-2">Economize {formatCurrency(saving)}</span>}
                </div>
                <span className="font-black text-sm flex-shrink-0" style={{ color: '#1B5E20' }}>{formatCurrency(bundle.price)}</span>
              </label>
            )
          })}
        </div>
      )}

      {/* Botão */}
      <button onClick={handleAdd}
        disabled={variantStock === 0 || (!allSelected && variationTypes.length > 0)}
        className="w-full font-black text-white py-4 rounded-2xl text-sm transition-all disabled:opacity-50"
        style={{ background: added ? '#16a34a' : 'linear-gradient(135deg, #1B5E20, #4CAF50)' }}>
        {variantStock === 0 ? 'Sem estoque' :
         !allSelected && variationTypes.length > 0 ? `Selecione ${variationTypes.filter(t => !selected[t.id]).map(t => t.name).join(' e ')}` :
         added ? '✓ Adicionado ao carrinho!' : 'Adicionar ao Carrinho'}
      </button>
    </div>
  )
}
