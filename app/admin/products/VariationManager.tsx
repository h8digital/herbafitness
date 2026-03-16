'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

interface VariationType {
  id: string
  name: string
  sort_order: number
  options: VariationOption[]
}

interface VariationOption {
  id: string
  variation_type_id: string
  value: string
  price_modifier: number
  stock: number
  sku_suffix: string | null
  active: boolean
}

interface VariationManagerProps {
  productId: string
  productPrice: number
  variationTypes: VariationType[]
}

export default function VariationManager({ productId, productPrice, variationTypes: initial }: VariationManagerProps) {
  const supabase = createClient()
  const [types, setTypes] = useState<VariationType[]>(initial)
  const [loading, setLoading] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const [newOptions, setNewOptions] = useState<Record<string, { value: string; price_modifier: string; stock: string; sku_suffix: string }>>({})

  const ic = "px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full"

  async function addType() {
    if (!newTypeName.trim()) return
    setLoading(true)
    const { data } = await supabase.from('product_variation_types').insert({
      product_id: productId,
      name: newTypeName.trim(),
      sort_order: types.length,
    }).select().single()
    if (data) setTypes(prev => [...prev, { ...data, options: [] }])
    setNewTypeName('')
    setLoading(false)
  }

  async function removeType(typeId: string) {
    if (!confirm('Remover este tipo de variação e todas as opções?')) return
    await supabase.from('product_variation_types').delete().eq('id', typeId)
    setTypes(prev => prev.filter(t => t.id !== typeId))
  }

  async function addOption(typeId: string) {
    const opt = newOptions[typeId]
    if (!opt?.value?.trim()) return
    setLoading(true)
    const { data } = await supabase.from('product_variation_options').insert({
      variation_type_id: typeId,
      value: opt.value.trim(),
      price_modifier: parseFloat(opt.price_modifier) || 0,
      stock: parseInt(opt.stock) || 0,
      sku_suffix: opt.sku_suffix?.trim() || null,
      active: true,
    }).select().single()
    if (data) {
      setTypes(prev => prev.map(t =>
        t.id === typeId ? { ...t, options: [...t.options, data] } : t
      ))
    }
    setNewOptions(prev => ({ ...prev, [typeId]: { value: '', price_modifier: '', stock: '', sku_suffix: '' } }))
    setLoading(false)
  }

  async function removeOption(typeId: string, optionId: string) {
    await supabase.from('product_variation_options').delete().eq('id', optionId)
    setTypes(prev => prev.map(t =>
      t.id === typeId ? { ...t, options: t.options.filter(o => o.id !== optionId) } : t
    ))
  }

  async function toggleOption(typeId: string, option: VariationOption) {
    await supabase.from('product_variation_options').update({ active: !option.active }).eq('id', option.id)
    setTypes(prev => prev.map(t =>
      t.id === typeId ? { ...t, options: t.options.map(o => o.id === option.id ? { ...o, active: !o.active } : o) } : t
    ))
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
      <div>
        <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
          🎨 Variações do Produto
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Ex: Sabor (Chocolate, Baunilha...), Tamanho (500g, 1kg...), Cor...
        </p>
      </div>

      {/* Tipos existentes */}
      {types.map(type => (
        <div key={type.id} className="border border-slate-200 rounded-2xl overflow-hidden">
          {/* Header do tipo */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
            <p className="font-semibold text-slate-900 text-sm">
              {type.name}
              <span className="text-slate-400 font-normal ml-2 text-xs">({type.options.length} opções)</span>
            </p>
            <button onClick={() => removeType(type.id)}
              className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors">
              Remover tipo
            </button>
          </div>

          {/* Opções */}
          <div className="divide-y divide-slate-100">
            {type.options.map(opt => (
              <div key={opt.id} className={`flex items-center gap-3 px-4 py-3 ${!opt.active ? 'opacity-50' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-slate-900">{opt.value}</span>
                    {opt.price_modifier !== 0 && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${opt.price_modifier > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {opt.price_modifier > 0 ? '+' : ''}{formatCurrency(opt.price_modifier)}
                      </span>
                    )}
                    {opt.sku_suffix && (
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{opt.sku_suffix}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                    <span>Preço final: <strong className="text-slate-700">{formatCurrency(productPrice + opt.price_modifier)}</strong></span>
                    <span>Estoque: <strong className="text-slate-700">{opt.stock}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleOption(type.id, opt)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${opt.active ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                    {opt.active ? 'Desativar' : 'Ativar'}
                  </button>
                  <button onClick={() => removeOption(type.id, opt.id)}
                    className="text-red-400 hover:text-red-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Adicionar opção */}
          <div className="px-4 py-3 bg-green-50 border-t border-green-100">
            <p className="text-xs font-semibold text-green-800 mb-2">+ Adicionar opção de {type.name}</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Valor *</label>
                <input className={ic} placeholder={`Ex: Chocolate`}
                  value={newOptions[type.id]?.value || ''}
                  onChange={e => setNewOptions(p => ({ ...p, [type.id]: { ...p[type.id], value: e.target.value } }))} />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Diferença de preço (R$)</label>
                <input type="number" step="0.01" className={ic} placeholder="0 = mesmo preço"
                  value={newOptions[type.id]?.price_modifier || ''}
                  onChange={e => setNewOptions(p => ({ ...p, [type.id]: { ...p[type.id], price_modifier: e.target.value } }))} />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Estoque</label>
                <input type="number" min="0" className={ic} placeholder="0"
                  value={newOptions[type.id]?.stock || ''}
                  onChange={e => setNewOptions(p => ({ ...p, [type.id]: { ...p[type.id], stock: e.target.value } }))} />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Sufixo do SKU</label>
                <input className={ic} placeholder="-CHOC"
                  value={newOptions[type.id]?.sku_suffix || ''}
                  onChange={e => setNewOptions(p => ({ ...p, [type.id]: { ...p[type.id], sku_suffix: e.target.value } }))} />
              </div>
            </div>
            {newOptions[type.id]?.value && newOptions[type.id]?.price_modifier !== undefined && (
              <p className="text-xs text-green-700 mb-2">
                Preço final desta opção: <strong>{formatCurrency(productPrice + (parseFloat(newOptions[type.id]?.price_modifier) || 0))}</strong>
              </p>
            )}
            <button onClick={() => addOption(type.id)} disabled={loading || !newOptions[type.id]?.value}
              className="w-full text-white font-semibold py-2 rounded-xl text-xs disabled:opacity-50 transition-colors"
              style={{ background: '#1B5E20' }}>
              {loading ? 'Adicionando...' : `Adicionar opção de ${type.name}`}
            </button>
          </div>
        </div>
      ))}

      {/* Adicionar novo tipo */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
        <p className="text-xs font-semibold text-slate-700">+ Adicionar Tipo de Variação</p>
        <div className="flex gap-2">
          <input className={`${ic} flex-1`} placeholder="Ex: Sabor, Tamanho, Cor..."
            value={newTypeName} onChange={e => setNewTypeName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addType()} />
          <button onClick={addType} disabled={loading || !newTypeName.trim()}
            className="text-white font-semibold px-4 py-2 rounded-xl text-sm disabled:opacity-50 transition-colors flex-shrink-0"
            style={{ background: '#1B5E20' }}>
            Criar
          </button>
        </div>
        <p className="text-[11px] text-slate-400">Ex: crie "Sabor" e depois adicione as opções Chocolate, Baunilha, Morango...</p>
      </div>
    </div>
  )
}
