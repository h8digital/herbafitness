'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Product, Category } from '@/types'
import { slugify } from '@/lib/utils'
import ImageUpload from '@/components/ui/ImageUpload'

interface ProductFormProps {
  product?: Product
  categories: Category[]
  imageRatio?: '3/4' | '4/5' | '1/1' | '4/3' | '16/9'
}

type Tab = 'basico' | 'preco' | 'estoque' | 'frete'

export default function ProductForm({ product, categories, imageRatio = '4/5' }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('basico')

  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    sku: product?.sku || '',
    category_id: product?.category_id || '',
    short_description: product?.short_description || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    compare_price: product?.compare_price?.toString() || '',
    cost_price: product?.cost_price?.toString() || '',
    stock: product?.stock?.toString() || '0',
    min_stock: product?.min_stock?.toString() || '5',
    weight: product?.weight?.toString() || '',
    length: product?.length?.toString() || '',
    width: product?.width?.toString() || '',
    height: product?.height?.toString() || '',
    active: product?.active ?? true,
    featured: product?.featured ?? false,
    tags: product?.tags?.join(', ') || '',
    image_url: product?.images?.[0]?.url || '',
  })

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const data = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      sku: form.sku || null,
      category_id: form.category_id || null,
      short_description: form.short_description || null,
      description: form.description || null,
      price: parseFloat(form.price) || 0,
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
      stock: parseInt(form.stock) || 0,
      min_stock: parseInt(form.min_stock) || 5,
      weight: form.weight ? parseFloat(form.weight) : null,
      length: form.length ? parseFloat(form.length) : null,
      width: form.width ? parseFloat(form.width) : null,
      height: form.height ? parseFloat(form.height) : null,
      active: form.active,
      featured: form.featured,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      images: form.image_url
        ? [{ url: form.image_url, alt: form.name, position: 0 }]
        : [],
    }

    try {
      if (product?.id) {
        const { error } = await supabase.from('products').update(data).eq('id', product.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert(data)
        if (error) throw error
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar produto')
    } finally {
      setLoading(false)
    }
  }

  const ic = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
  const lc = "block text-sm font-medium text-slate-700 mb-1.5"

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'basico',   label: 'Informações', icon: '📝' },
    { key: 'preco',    label: 'Preços',      icon: '💰' },
    { key: 'estoque',  label: 'Estoque',     icon: '📦' },
    { key: 'frete',    label: 'Frete',       icon: '🚚' },
  ]

  return (
    <form onSubmit={handleSubmit}>
      {/* Toggles + categoria */}
      <div className="flex items-center gap-6 mb-5 flex-wrap">
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => set('active', !form.active)}
            className="relative w-11 h-6 rounded-full transition-colors cursor-pointer"
            style={{ background: form.active ? '#4CAF50' : '#e2e8f0' }}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.active ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
          <span className="text-sm font-medium text-slate-700">Ativo</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => set('featured', !form.featured)}
            className="relative w-11 h-6 rounded-full transition-colors cursor-pointer"
            style={{ background: form.featured ? '#f97316' : '#e2e8f0' }}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.featured ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
          <span className="text-sm font-medium text-slate-700">Destaque</span>
        </label>
        <div className="ml-auto">
          <select className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            value={form.category_id} onChange={e => set('category_id', e.target.value)}>
            <option value="">Sem categoria</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Layout de duas colunas: formulário + imagem */}
      <div className="flex gap-6 items-start">

        {/* Coluna esquerda — tabs + campos */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-100">
              {tabs.map(tab => (
                <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? 'border-green-600 text-green-700 bg-green-50'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}>
                  <span>{tab.icon}</span><span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6">

              {/* ── INFORMAÇÕES BÁSICAS ── */}
              {activeTab === 'basico' && (
                <div className="space-y-4">
                  <div>
                    <label className={lc}>Nome do Produto *</label>
                    <input className={ic} value={form.name}
                      onChange={e => { set('name', e.target.value); set('slug', slugify(e.target.value)) }}
                      placeholder="Nome do produto" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lc}>Slug (URL)</label>
                      <input className={ic} value={form.slug} onChange={e => set('slug', e.target.value)} />
                    </div>
                    <div>
                      <label className={lc}>SKU</label>
                      <input className={ic} value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="PROD-001" />
                    </div>
                  </div>
                  <div>
                    <label className={lc}>Descrição Curta</label>
                    <textarea className={ic} value={form.short_description}
                      onChange={e => set('short_description', e.target.value)}
                      rows={2} placeholder="Resumo exibido no card do produto..." />
                  </div>
                  <div>
                    <label className={lc}>Descrição Completa</label>
                    <textarea className={ic} value={form.description}
                      onChange={e => set('description', e.target.value)}
                      rows={5} placeholder="Descrição detalhada do produto..." />
                  </div>
                  <div>
                    <label className={lc}>Tags</label>
                    <input className={ic} value={form.tags} onChange={e => set('tags', e.target.value)}
                      placeholder="shake, proteína, chocolate (separadas por vírgula)" />
                  </div>
                </div>
              )}

              {/* ── PREÇOS ── */}
              {activeTab === 'preco' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lc}>Preço de Venda *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                        <input className={`${ic} pl-10`} value={form.price} onChange={e => set('price', e.target.value)}
                          type="number" step="0.01" min="0" placeholder="0,00" required />
                      </div>
                    </div>
                    <div>
                      <label className={lc}>Preço Original (riscado)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                        <input className={`${ic} pl-10`} value={form.compare_price} onChange={e => set('compare_price', e.target.value)}
                          type="number" step="0.01" min="0" placeholder="0,00" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={lc}>Seu Custo</label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                      <input className={`${ic} pl-10`} value={form.cost_price} onChange={e => set('cost_price', e.target.value)}
                        type="number" step="0.01" min="0" placeholder="0,00" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Não é exibido para clientes. Usado para calcular margem.</p>
                  </div>
                  {form.price && form.cost_price && parseFloat(form.price) > 0 && parseFloat(form.cost_price) > 0 && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">Análise de Margem</p>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-slate-400">Preço de Venda</p>
                          <p className="font-bold text-slate-900">R$ {parseFloat(form.price).toFixed(2).replace('.',',')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Seu Custo</p>
                          <p className="font-bold text-slate-900">R$ {parseFloat(form.cost_price).toFixed(2).replace('.',',')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Lucro</p>
                          <p className="font-bold text-green-600">
                            R$ {(parseFloat(form.price) - parseFloat(form.cost_price)).toFixed(2).replace('.',',')}
                            {' '}
                            <span className="text-xs">
                              ({Math.round(((parseFloat(form.price) - parseFloat(form.cost_price)) / parseFloat(form.price)) * 100)}%)
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── ESTOQUE ── */}
              {activeTab === 'estoque' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lc}>Quantidade em Estoque</label>
                      <input className={ic} value={form.stock} onChange={e => set('stock', e.target.value)}
                        type="number" min="0" placeholder="0" />
                    </div>
                    <div>
                      <label className={lc}>Estoque Mínimo (alerta)</label>
                      <input className={ic} value={form.min_stock} onChange={e => set('min_stock', e.target.value)}
                        type="number" min="0" placeholder="5" />
                      <p className="text-xs text-slate-400 mt-1">Alerta quando atingir este nível</p>
                    </div>
                  </div>
                  {parseInt(form.stock) <= parseInt(form.min_stock) && form.stock !== '' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-700">
                      ⚠️ Estoque atual está abaixo ou igual ao mínimo configurado
                    </div>
                  )}
                </div>
              )}

              {/* ── FRETE ── */}
              {activeTab === 'frete' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Dimensões e peso usados para calcular o frete via SuperFrete.</p>
                  <div>
                    <label className={lc}>Peso (kg)</label>
                    <input className={ic} value={form.weight} onChange={e => set('weight', e.target.value)}
                      type="number" step="0.001" min="0" placeholder="0.500" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={lc}>Comprimento (cm)</label>
                      <input className={ic} value={form.length} onChange={e => set('length', e.target.value)}
                        type="number" step="0.1" min="0" placeholder="20" />
                    </div>
                    <div>
                      <label className={lc}>Largura (cm)</label>
                      <input className={ic} value={form.width} onChange={e => set('width', e.target.value)}
                        type="number" step="0.1" min="0" placeholder="15" />
                    </div>
                    <div>
                      <label className={lc}>Altura (cm)</label>
                      <input className={ic} value={form.height} onChange={e => set('height', e.target.value)}
                        type="number" step="0.1" min="0" placeholder="10" />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Coluna direita — imagem */}
        <div className="flex-shrink-0 w-64">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-6">
            <p className="text-sm font-semibold text-slate-700 mb-4">Foto do Produto</p>
            <ImageUpload
              value={form.image_url}
              folder="products"
              onChange={(url) => set('image_url', url)}
            />
            <p className="text-xs text-slate-400 mt-3 text-center">
              Aceita JPG, PNG ou WebP até 10MB
            </p>
            {form.image_url && (
              <button type="button" onClick={() => set('image_url', '')}
                className="mt-2 w-full text-xs text-red-400 hover:text-red-600 transition-colors text-center">
                Remover imagem
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Rodapé: erro + salvar */}
      <div className="flex items-center justify-between mt-6">
        <div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-semibold text-green-700">Salvo!</span>
            </div>
          )}
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-colors"
            style={{ background: '#1B5E20' }}>
            {loading ? 'Salvando...' : product?.id ? 'Salvar Alterações' : 'Criar Produto'}
          </button>
        </div>
      </div>
    </form>
  )
}
