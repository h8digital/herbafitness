'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Product, Category } from '@/types'
import { slugify } from '@/lib/utils'

interface ProductFormProps {
  product?: Product
  categories: Category[]
}

export default function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

    router.push('/admin/products')
    router.refresh()
  }

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">

          {/* Informações básicas */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Informações Básicas</h3>
            <div>
              <label className={labelClass}>Nome do Produto *</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={e => { set('name', e.target.value); set('slug', slugify(e.target.value)) }}
                placeholder="Nome do produto"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Slug (URL)</label>
                <input className={inputClass} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="nome-do-produto" />
              </div>
              <div>
                <label className={labelClass}>SKU</label>
                <input className={inputClass} value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="PROD-001" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Descrição Curta</label>
              <textarea className={inputClass} value={form.short_description} onChange={e => set('short_description', e.target.value)} rows={2} placeholder="Resumo do produto..." />
            </div>
            <div>
              <label className={labelClass}>Descrição Completa</label>
              <textarea className={inputClass} value={form.description} onChange={e => set('description', e.target.value)} rows={5} placeholder="Descrição detalhada..." />
            </div>
          </div>

          {/* Preços */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Preços</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Preço de Venda *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                  <input className={`${inputClass} pl-9`} value={form.price} onChange={e => set('price', e.target.value)} type="number" step="0.01" min="0" placeholder="0,00" required />
                </div>
              </div>
              <div>
                <label className={labelClass}>Preço Original</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                  <input className={`${inputClass} pl-9`} value={form.compare_price} onChange={e => set('compare_price', e.target.value)} type="number" step="0.01" min="0" placeholder="0,00" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Preço de Custo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                  <input className={`${inputClass} pl-9`} value={form.cost_price} onChange={e => set('cost_price', e.target.value)} type="number" step="0.01" min="0" placeholder="0,00" />
                </div>
              </div>
            </div>
          </div>

          {/* Estoque */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Estoque</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Quantidade em Estoque</label>
                <input className={inputClass} value={form.stock} onChange={e => set('stock', e.target.value)} type="number" min="0" placeholder="0" />
              </div>
              <div>
                <label className={labelClass}>Estoque Mínimo (alerta)</label>
                <input className={inputClass} value={form.min_stock} onChange={e => set('min_stock', e.target.value)} type="number" min="0" placeholder="5" />
              </div>
            </div>
          </div>

          {/* Dimensões e Peso (para frete) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Dimensões e Peso <span className="text-slate-400 font-normal text-sm">(para cálculo de frete)</span></h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Peso (kg)</label>
                <input className={inputClass} value={form.weight} onChange={e => set('weight', e.target.value)} type="number" step="0.001" min="0" placeholder="0.500" />
              </div>
              <div>
                <label className={labelClass}>Comprimento (cm)</label>
                <input className={inputClass} value={form.length} onChange={e => set('length', e.target.value)} type="number" step="0.1" min="0" placeholder="20" />
              </div>
              <div>
                <label className={labelClass}>Largura (cm)</label>
                <input className={inputClass} value={form.width} onChange={e => set('width', e.target.value)} type="number" step="0.1" min="0" placeholder="15" />
              </div>
              <div>
                <label className={labelClass}>Altura (cm)</label>
                <input className={inputClass} value={form.height} onChange={e => set('height', e.target.value)} type="number" step="0.1" min="0" placeholder="10" />
              </div>
            </div>
          </div>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-6">

          {/* Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Status</h3>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-700">Produto Ativo</span>
              <div
                onClick={() => set('active', !form.active)}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${form.active ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.active ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-700">Produto em Destaque</span>
              <div
                onClick={() => set('featured', !form.featured)}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${form.featured ? 'bg-orange-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.featured ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
            </label>
          </div>

          {/* Categoria */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Categoria</h3>
            <select
              className={inputClass}
              value={form.category_id}
              onChange={e => set('category_id', e.target.value)}
            >
              <option value="">Sem categoria</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Imagem */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Imagem Principal</h3>
            <input
              className={inputClass}
              value={form.image_url}
              onChange={e => set('image_url', e.target.value)}
              placeholder="https://url-da-imagem.com/foto.jpg"
            />
            {form.image_url && (
              <img src={form.image_url} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
            )}
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Tags</h3>
            <input
              className={inputClass}
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-xs text-slate-400">Separe as tags por vírgula</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 px-8 rounded-xl transition-colors">
          {loading ? 'Salvando...' : product ? 'Salvar Alterações' : 'Criar Produto'}
        </button>
      </div>
    </form>
  )
}
