'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { Product } from '@/types'

interface Bundle {
  id: string
  quantity: number
  price: number
  label: string | null
  active: boolean
}

interface Suggestion {
  id: string
  suggested_product_id: string
  bundle_price: number | null
  bundle_label: string | null
  suggested_product?: Product
}

interface BundleManagerProps {
  product: Product
  bundles: Bundle[]
  suggestions: Suggestion[]
  allProducts: Product[]
}

export default function BundleManager({ product, bundles: initialBundles, suggestions: initialSuggestions, allProducts }: BundleManagerProps) {
  const router = useRouter()
  const supabase = createClient()
  const [bundles, setBundles] = useState(initialBundles)
  const [suggestions, setSuggestions] = useState(initialSuggestions)
  const [loading, setLoading] = useState(false)

  // Form novo pacote
  const [newBundle, setNewBundle] = useState({ quantity: '', price: '', label: '' })
  // Form nova sugestão
  const [newSuggestion, setNewSuggestion] = useState({ product_id: '', bundle_price: '', bundle_label: '' })

  const ic = "w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"

  async function addBundle() {
    if (!newBundle.quantity || !newBundle.price) return
    setLoading(true)
    const { data } = await supabase.from('product_bundles').insert({
      product_id: product.id,
      quantity: parseInt(newBundle.quantity),
      price: parseFloat(newBundle.price),
      label: newBundle.label || null,
      active: true,
    }).select().single()
    if (data) setBundles(prev => [...prev, data])
    setNewBundle({ quantity: '', price: '', label: '' })
    setLoading(false)
  }

  async function removeBundle(id: string) {
    await supabase.from('product_bundles').delete().eq('id', id)
    setBundles(prev => prev.filter(b => b.id !== id))
  }

  async function addSuggestion() {
    if (!newSuggestion.product_id) return
    setLoading(true)
    const { data } = await supabase.from('product_suggestions').insert({
      product_id: product.id,
      suggested_product_id: newSuggestion.product_id,
      bundle_price: newSuggestion.bundle_price ? parseFloat(newSuggestion.bundle_price) : null,
      bundle_label: newSuggestion.bundle_label || null,
      active: true,
    }).select('*, suggested_product:products!suggested_product_id(*)').single()
    if (data) setSuggestions(prev => [...prev, data])
    setNewSuggestion({ product_id: '', bundle_price: '', bundle_label: '' })
    setLoading(false)
  }

  async function removeSuggestion(id: string) {
    await supabase.from('product_suggestions').delete().eq('id', id)
    setSuggestions(prev => prev.filter(s => s.id !== id))
  }

  const otherProducts = allProducts.filter(p => p.id !== product.id && !suggestions.find(s => s.suggested_product_id === p.id))

  return (
    <div className="space-y-6">

      {/* ── PACOTES DE QUANTIDADE ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
            📦 Pacotes de Quantidade
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Ofereça desconto progressivo para quem compra mais</p>
        </div>

        {/* Lista de pacotes */}
        {bundles.length > 0 && (
          <div className="space-y-2 mb-4">
            {bundles.map(bundle => (
              <div key={bundle.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                <span className="text-lg">📦</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{bundle.quantity} unidades — {formatCurrency(bundle.price)}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{formatCurrency(bundle.price / bundle.quantity)} cada</span>
                    <span className="text-green-600 font-medium">
                      Economia: {formatCurrency((product.price * bundle.quantity) - bundle.price)}
                    </span>
                    {bundle.label && <span>· {bundle.label}</span>}
                  </div>
                </div>
                <button onClick={() => removeBundle(bundle.id)}
                  className="text-red-400 hover:text-red-600 transition-colors p-1">
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Adicionar pacote */}
        <div className="bg-green-50 rounded-xl p-4 space-y-3 border border-green-100">
          <p className="text-xs font-semibold text-green-800">+ Adicionar Pacote</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Qtd *</label>
              <input type="number" min="2" className={ic} value={newBundle.quantity}
                onChange={e => setNewBundle(p => ({ ...p, quantity: e.target.value }))} placeholder="2" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Preço total *</label>
              <input type="number" step="0.01" className={ic} value={newBundle.price}
                onChange={e => setNewBundle(p => ({ ...p, price: e.target.value }))} placeholder="444,00" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Rótulo</label>
              <input className={ic} value={newBundle.label}
                onChange={e => setNewBundle(p => ({ ...p, label: e.target.value }))} placeholder="Mais vendido" />
            </div>
          </div>
          {newBundle.quantity && newBundle.price && (
            <div className="text-xs text-green-700 bg-green-100 rounded-lg px-3 py-2">
              Preview: {newBundle.quantity}x por {formatCurrency(parseFloat(newBundle.price))} =
              {' '}{formatCurrency(parseFloat(newBundle.price) / parseInt(newBundle.quantity))} cada
              {' '}(economia de {formatCurrency((product.price * parseInt(newBundle.quantity)) - parseFloat(newBundle.price))})
            </div>
          )}
          <button onClick={addBundle} disabled={loading || !newBundle.quantity || !newBundle.price}
            className="w-full text-white font-semibold py-2 rounded-xl text-sm disabled:opacity-50"
            style={{ background: '#1B5E20' }}>
            {loading ? 'Adicionando...' : 'Adicionar Pacote'}
          </button>
        </div>
      </div>

      {/* ── PRODUTOS SUGERIDOS ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
            🛍️ Produtos Comprados Juntos
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Adicione produtos que combinam. O sistema também mostra automaticamente baseado nas vendas.
          </p>
        </div>

        {/* Lista de sugestões */}
        {suggestions.length > 0 && (
          <div className="space-y-2 mb-4">
            {suggestions.map(s => (
              <div key={s.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-slate-100">
                  {(s.suggested_product as any)?.images?.[0]?.url
                    ? <img src={(s.suggested_product as any).images[0].url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-base">🌿</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{(s.suggested_product as any)?.name}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    {s.bundle_price && <span className="text-green-600 font-medium">Preço combo: {formatCurrency(s.bundle_price)}</span>}
                    {s.bundle_label && <span>· {s.bundle_label}</span>}
                  </div>
                </div>
                <button onClick={() => removeSuggestion(s.id)} className="text-red-400 hover:text-red-600 p-1">🗑️</button>
              </div>
            ))}
          </div>
        )}

        {/* Adicionar sugestão */}
        <div className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-100">
          <p className="text-xs font-semibold text-blue-800">+ Sugerir Produto</p>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Produto *</label>
            <select className={ic} value={newSuggestion.product_id}
              onChange={e => setNewSuggestion(p => ({ ...p, product_id: e.target.value }))}>
              <option value="">Selecione um produto...</option>
              {otherProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Preço combo (opcional)</label>
              <input type="number" step="0.01" className={ic} value={newSuggestion.bundle_price}
                onChange={e => setNewSuggestion(p => ({ ...p, bundle_price: e.target.value }))}
                placeholder="Preço especial" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Rótulo (opcional)</label>
              <input className={ic} value={newSuggestion.bundle_label}
                onChange={e => setNewSuggestion(p => ({ ...p, bundle_label: e.target.value }))}
                placeholder="Kit Shake + NRG" />
            </div>
          </div>
          <button onClick={addSuggestion} disabled={loading || !newSuggestion.product_id}
            className="w-full text-white font-semibold py-2 rounded-xl text-sm disabled:opacity-50"
            style={{ background: '#2563eb' }}>
            {loading ? 'Adicionando...' : 'Adicionar Sugestão'}
          </button>
        </div>
      </div>
    </div>
  )
}
