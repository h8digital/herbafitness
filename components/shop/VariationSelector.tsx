'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'
import { Product } from '@/types'

interface VariationOption {
  id: string
  value: string
  price_modifier: number
  stock: number
  active: boolean
}

interface VariationType {
  id: string
  name: string
  options: VariationOption[]
}

interface Suggestion {
  product: Product
  bundle_price: number | null
  bundle_label: string | null
  source: 'manual' | 'automatic'
}

interface VariationSelectorProps {
  product: Product
  variationTypes: VariationType[]
  bundles?: any[]
  suggestions?: Suggestion[]
}

export default function VariationSelector({
  product,
  variationTypes,
  bundles = [],
  suggestions = [],
}: VariationSelectorProps) {
  const addItem = useCartStore(s => s.addItem)

  // Variações selecionadas
  const [selected, setSelected] = useState<Record<string, string>>({})
  // Pacote selecionado (unit = 1 unidade, ou id do bundle)
  const [selectedBundle, setSelectedBundle] = useState<'unit' | string>('unit')
  // Produtos do "comprados juntos" selecionados (estilo Amazon)
  const [selectedCross, setSelectedCross] = useState<Set<string>>(new Set())
  // Animação do botão
  const [added, setAdded] = useState(false)

  // Preço base com modificadores de variação
  const priceModifier = variationTypes.reduce((sum, type) => {
    const opt = type.options.find(o => o.id === selected[type.id])
    return sum + (opt?.price_modifier || 0)
  }, 0)
  const basePrice = product.price + priceModifier

  // Preço do bundle selecionado (ou unitário)
  const bundleObj = bundles.find((b: any) => b.id === selectedBundle)
  const mainPrice = selectedBundle !== 'unit' && bundleObj
    ? bundleObj.price
    : basePrice * (selectedBundle !== 'unit' && bundleObj ? bundleObj.quantity : 1)

  // Quantidade do bundle
  const mainQty = selectedBundle !== 'unit' && bundleObj ? bundleObj.quantity : 1

  // Preço total = main + cruzados selecionados
  const crossTotal = suggestions
    .filter(s => selectedCross.has(s.product.id))
    .reduce((sum, s) => sum + (s.bundle_price ?? s.product.price), 0)

  const grandTotal = mainPrice + crossTotal

  // Verificações
  const allVariationsSelected = variationTypes.every(t => selected[t.id])
  const hasVariations = variationTypes.length > 0

  // Estoque da variação selecionada
  const variantStock = hasVariations
    ? Math.min(...variationTypes.map(t => {
        const opt = t.options.find(o => o.id === selected[t.id])
        return opt?.stock ?? product.stock
      }))
    : product.stock

  function toggleCross(productId: string) {
    setSelectedCross(prev => {
      const next = new Set(prev)
      next.has(productId) ? next.delete(productId) : next.add(productId)
      return next
    })
  }

  function handleAddAll() {
    if (hasVariations && !allVariationsSelected) return

    // Nome do produto com variação
    const variantName = hasVariations
      ? `${product.name} (${variationTypes.map(t => {
          const opt = t.options.find(o => o.id === selected[t.id])
          return opt?.value || ''
        }).join(', ')})`
      : product.name

    // Adicionar produto principal
    const mainProduct = { ...product, name: variantName, price: basePrice }
    addItem(mainProduct as Product, mainQty)

    // Adicionar produtos cruzados selecionados
    suggestions
      .filter(s => selectedCross.has(s.product.id))
      .forEach(s => {
        const p = s.bundle_price
          ? { ...s.product, price: s.bundle_price }
          : s.product
        addItem(p as Product, 1)
      })

    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const unselectedTypes = variationTypes.filter(t => !selected[t.id])

  return (
    <div className="space-y-5">
      {/* ── VARIAÇÕES ── */}
      {variationTypes.map(type => (
        <div key={type.id}>
          <p className="text-sm font-bold text-slate-900 mb-2">
            {type.name}
            {!selected[type.id] && (
              <span className="text-red-400 text-xs font-normal ml-2">— selecione</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {type.options.filter(o => o.active).map(opt => {
              const isSelected = selected[type.id] === opt.id
              const outOfStock = opt.stock === 0
              return (
                <button key={opt.id}
                  onClick={() => !outOfStock && setSelected(prev => ({ ...prev, [type.id]: opt.id }))}
                  disabled={outOfStock}
                  className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    outOfStock
                      ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
                      : isSelected
                      ? 'text-white'
                      : 'border-slate-200 text-slate-700 hover:border-green-400 bg-white'
                  }`}
                  style={isSelected && !outOfStock ? { background: '#1B5E20', borderColor: '#1B5E20' } : {}}>
                  {opt.value}
                  {opt.price_modifier !== 0 && (
                    <span className={`ml-1 text-[10px] ${isSelected ? 'text-green-200' : 'text-slate-400'}`}>
                      {opt.price_modifier > 0 ? '+' : ''}{formatCurrency(opt.price_modifier)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* ── QUANTIDADE / PACOTES ── */}
      {(bundles.length > 0 || !hasVariations) && (
        <div>
          {bundles.length > 0 && (
            <>
              <p className="text-sm font-bold text-slate-900 mb-2">Quantidade</p>
              <div className="space-y-2">
                {/* 1 unidade */}
                <label onClick={() => setSelectedBundle('unit')}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selectedBundle === 'unit' ? 'border-green-600 bg-green-50' : 'border-slate-200 bg-white hover:border-green-300'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selectedBundle === 'unit' ? 'border-green-600' : 'border-slate-300'}`}>
                    {selectedBundle === 'unit' && <div className="w-2 h-2 rounded-full bg-green-600" />}
                  </div>
                  <span className="text-sm font-semibold text-slate-900 flex-1">1 unidade</span>
                  <span className="font-black text-base" style={{ color: '#1B5E20' }}>{formatCurrency(basePrice)}</span>
                </label>

                {/* Bundles */}
                {bundles.map((bundle: any) => {
                  const saving = (basePrice * bundle.quantity) - bundle.price
                  const isSelected = selectedBundle === bundle.id
                  return (
                    <label key={bundle.id} onClick={() => setSelectedBundle(bundle.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden ${isSelected ? 'border-green-600 bg-green-50' : 'border-slate-200 bg-white hover:border-green-300'}`}>
                      {saving > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg">
                          -{Math.round((saving / (basePrice * bundle.quantity)) * 100)}%
                        </span>
                      )}
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'border-green-600' : 'border-slate-300'}`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-green-600" />}
                      </div>
                      <div className="flex-1 min-w-0 pr-8">
                        <span className="text-sm font-semibold text-slate-900">{bundle.quantity} unidades</span>
                        {saving > 0 && (
                          <span className="text-xs text-green-600 font-semibold ml-2">Economize {formatCurrency(saving)}</span>
                        )}
                        {bundle.label && <span className="text-xs text-slate-400 ml-1">· {bundle.label}</span>}
                      </div>
                      <span className="font-black text-base flex-shrink-0" style={{ color: '#1B5E20' }}>
                        {formatCurrency(bundle.price)}
                      </span>
                    </label>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── FREQUENTEMENTE COMPRADOS JUNTOS (estilo Amazon) ── */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100" style={{ background: '#f1f8f1' }}>
            <p className="font-black text-sm text-slate-900" style={{ fontFamily: 'Arial Black, sans-serif' }}>
              🛍️ Frequentemente comprados juntos
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Selecione para adicionar ao carrinho junto</p>
          </div>

          <div className="divide-y divide-slate-50">
            {/* Produto atual — sempre marcado e imutável */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center"
                style={{ background: '#1B5E20', borderColor: '#1B5E20' }}>
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-slate-50">
                {product.images?.[0]?.url
                  ? <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-base">🌿</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 line-clamp-1">{product.name}</p>
                {hasVariations && allVariationsSelected && (
                  <p className="text-[10px] text-slate-400">
                    {variationTypes.map(t => t.options.find(o => o.id === selected[t.id])?.value).join(', ')}
                  </p>
                )}
              </div>
              <p className="font-black text-sm flex-shrink-0" style={{ color: '#1B5E20' }}>
                {formatCurrency(selectedBundle !== 'unit' && bundleObj ? bundleObj.price : basePrice)}
              </p>
            </div>

            {/* Produtos sugeridos */}
            {suggestions.slice(0, 3).map(({ product: sp, bundle_price, bundle_label, source }) => {
              const isChecked = selectedCross.has(sp.id)
              const finalPrice = bundle_price ?? sp.price
              const hasDiscount = bundle_price && bundle_price < sp.price

              return (
                <div key={sp.id}
                  onClick={() => toggleCross(sp.id)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isChecked ? 'bg-green-50' : 'hover:bg-slate-50'}`}>
                  <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${isChecked ? 'border-green-600 bg-green-600' : 'border-slate-300 bg-white'}`}>
                    {isChecked && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-slate-50">
                    {sp.images?.[0]?.url
                      ? <img src={sp.images[0].url} alt={sp.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-base">🌿</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 line-clamp-1">{sp.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {hasDiscount && (
                        <p className="text-[10px] text-slate-400 line-through">{formatCurrency(sp.price)}</p>
                      )}
                      {bundle_label && (
                        <p className="text-[10px] text-green-600 font-semibold">{bundle_label}</p>
                      )}
                      {source === 'automatic' && !bundle_label && (
                        <p className="text-[10px] text-slate-400">comprado frequentemente</p>
                      )}
                    </div>
                  </div>
                  <p className="font-black text-sm flex-shrink-0" style={{ color: isChecked ? '#1B5E20' : '#64748b' }}>
                    {formatCurrency(finalPrice)}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Total dos selecionados */}
          {selectedCross.size > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {1 + selectedCross.size} produtos selecionados
              </p>
              <p className="font-black text-base" style={{ color: '#1B5E20', fontFamily: 'Arial Black, sans-serif' }}>
                Total: {formatCurrency(grandTotal)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── BOTÃO ÚNICO DE ADICIONAR ── */}
      <button onClick={handleAddAll}
        disabled={variantStock === 0 || (hasVariations && !allVariationsSelected)}
        className="w-full font-black text-white py-4 rounded-2xl text-sm transition-all disabled:opacity-50 relative"
        style={{ background: added ? '#16a34a' : 'linear-gradient(135deg, #1B5E20, #4CAF50)' }}>
        {variantStock === 0
          ? 'Sem estoque'
          : hasVariations && !allVariationsSelected
          ? `Selecione: ${unselectedTypes.map(t => t.name).join(', ')}`
          : added
          ? `✓ ${1 + selectedCross.size} produto${selectedCross.size > 0 ? 's' : ''} adicionado${selectedCross.size > 0 ? 's' : ''}!`
          : selectedCross.size > 0
          ? `Adicionar ${1 + selectedCross.size} produtos · ${formatCurrency(grandTotal)}`
          : `Adicionar ao carrinho · ${formatCurrency(mainPrice)}`
        }
      </button>
    </div>
  )
}
