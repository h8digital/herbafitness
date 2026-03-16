'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/types'
import { slugify } from '@/lib/utils'

export default function CategoryForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '', parent_id: '', image_url: '' })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await supabase.from('categories').insert({
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description || null,
      parent_id: form.parent_id || null,
      image_url: form.image_url || null,
    })

    setForm({ name: '', slug: '', description: '', parent_id: '', image_url: '' })
    router.refresh()
    setLoading(false)
  }

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Nova Categoria</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Nome *</label>
          <input className={inputClass} value={form.name}
            onChange={e => { set('name', e.target.value); set('slug', slugify(e.target.value)) }}
            placeholder="Nome da categoria" required />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input className={inputClass} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="nome-da-categoria" />
        </div>
        <div>
          <label className={labelClass}>Categoria Pai</label>
          <select className={inputClass} value={form.parent_id} onChange={e => set('parent_id', e.target.value)}>
            <option value="">Nenhuma</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Descrição</label>
          <textarea className={inputClass} value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Descrição..." />
        </div>
        <div>
          <label className={labelClass}>URL da Imagem</label>
          <input className={inputClass} value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors">
          {loading ? 'Criando...' : '+ Criar Categoria'}
        </button>
      </form>
    </div>
  )
}
