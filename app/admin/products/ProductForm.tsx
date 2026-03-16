'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Product, Category } from '@/types'
import { slugify } from '@/lib/utils'
import ImageCropUpload from '@/components/ui/ImageCropUpload'

interface ProductFormProps {
  product?: Product
  categories: Category[]
  imageRatio?: '3/4' | '4/5' | '1/1' | '4/3' | '16/9'
}

type Tab = 'basico' | 'preco' | 'estoque' | 'imagens' | 'frete'

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
      images: form.image_url ? [{ url: form.image_url, position: 0 }] : [],
    }

    let result
    if (product) {
      result = await supabase.from('products').update(data).eq('id', product.id)
    } else {
      result = await supabase.from('products').insert(data)
    }

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    if (!product) router.push('/admin/products')
    else router.refresh()
    setLoading(false)
  }

  const ic = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
  const lc = "block text-sm font-medium text-slate-700 mb-1.5"

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'basico',  label: 'Informações', icon: '📝' },
    { key: 'preco',   label: 'Preços',      icon: '💰' },
    { key: 'estoque', label: 'Estoque',     icon: '📦' },
    { key: 'imagens', label: 'Imagem',      icon: '🖼️' },
    { key: 'frete',   label: 'Frete',       icon: '🚚' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Status toggles no topo */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex items-center gap-6">
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

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
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
                  rows={6} placeholder="Descrição detalhada exibida na página do produto..." />
              </div>
              <div>
                <label className={lc}>Tags</label>
                <input className={ic} value={form.tags} onChange={e => set('tags', e.target.value)}
                  placeholder="shake, proteína, chocolate — separe por vírgula" />
              </div>
            </div>
          )}

          {/* ── PREÇOS ── */}
          {activeTab === 'preco' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-green-800 mb-2">
                    💰 Preço de Venda (exibido ao cliente) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">R$</span>
                    <input className="w-full pl-10 pr-4 py-3 border-2 border-green-300 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      value={form.price} onChange={e => set('price', e.target.value)}
                      type="number" step="0.01" min="0" placeholder="0,00" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lc}>
                      Preço Original <span className="text-slate-400 font-normal">(riscado)</span>
                    </label>
                    <p className="text-xs text-slate-400 mb-2">Mostra como "de R$ X por R$ Y"</p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                      <input className={`${ic} pl-9`} value={form.compare_price}
                        onChange={e => set('compare_price', e.target.value)}
                        type="number" step="0.01" min="0" placeholder="0,00" />
                    </div>
                  </div>
                  <div>
                    <label className={lc}>
                      Preço de Custo <span className="text-slate-400 font-normal">(interno)</span>
                    </label>
                    <p className="text-xs text-slate-400 mb-2">Visível apenas para o admin</p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                      <input className={`${ic} pl-9`} value={form.cost_price}
                        onChange={e => set('cost_price', e.target.value)}
                        type="number" step="0.01" min="0" placeholder="0,00" />
                    </div>
                  </div>
                </div>

                {/* Preview de margem */}
                {form.price && form.cost_price && (
                  <div className="bg-slate-50 rounded-xl p-4 text-sm">
                    <p className="font-medium text-slate-700 mb-2">📊 Análise de Margem</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-xs text-slate-400">Preço Venda</p>
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

          {/* ── IMAGEM ── */}
          {activeTab === 'imagens' && (
            <div className="space-y-5">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
                📸 A imagem é <strong>enviada e salva no servidor</strong> (Supabase Storage). O crop garante a proporção <strong>3×4</strong> ideal para exibição nos cards de produto.
              </div>

              <div className="flex gap-6 items-start">
                {/* Upload com crop */}
                <div className="flex-shrink-0">
                  <ImageCropUpload
                    label="Imagem Principal"
                    value={form.image_url}
                    folder="products"
                    aspectRatio={imageRatio}
                    onChange={(url, path) => {
                      set('image_url', url)
                    }}
                  />
                </div>

                {/* Dicas */}
                <div className="flex-1 space-y-3 pt-6">
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Clique na área para selecionar uma foto</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Arraste para enquadrar o produto</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>A imagem é salva em proporção <strong>{imageRatio}</strong> ({imageRatio === '4/5' ? '800×1000px' : imageRatio === '3/4' ? '600×800px' : imageRatio === '1/1' ? '800×800px' : '800×600px'})</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Formato WebP otimizado para web</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Aceita JPG, PNG ou WebP até 10MB</span>
                    </div>
                  </div>

                  {form.image_url && (
                    <button type="button" onClick={() => set('image_url', '')}
                      className="text-xs text-red-400 hover:text-red-600 underline transition-colors">
                      Remover imagem
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── FRETE ── */}
          {activeTab === 'frete' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                📦 Essas dimensões são usadas para calcular o frete via SuperFrete
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lc}>Peso (kg)</label>
                  <input className={ic} value={form.weight} onChange={e => set('weight', e.target.value)}
                    type="number" step="0.001" min="0" placeholder="ex: 0.500" />
                </div>
                <div>
                  <label className={lc}>Comprimento (cm)</label>
                  <input className={ic} value={form.length} onChange={e => set('length', e.target.value)}
                    type="number" step="0.1" min="0" placeholder="ex: 20" />
                </div>
                <div>
                  <label className={lc}>Largura (cm)</label>
                  <input className={ic} value={form.width} onChange={e => set('width', e.target.value)}
                    type="number" step="0.1" min="0" placeholder="ex: 15" />
                </div>
                <div>
                  <label className={lc}>Altura (cm)</label>
                  <input className={ic} value={form.height} onChange={e => set('height', e.target.value)}
                    type="number" step="0.1" min="0" placeholder="ex: 10" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-colors text-sm">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 font-semibold py-3 px-8 rounded-xl transition-all text-white disabled:opacity-60 text-sm"
          style={{ background: saved ? '#16a34a' : 'linear-gradient(135deg, #1B5E20, #388E3C)' }}>
          {loading ? 'Salvando...' : saved ? '✓ Salvo!' : product ? 'Salvar Alterações' : 'Criar Produto'}
        </button>
      </div>
    </form>
  )
}
