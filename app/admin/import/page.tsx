'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'

interface ParsedProduct {
  sku: string
  name: string
  price_consumer: number
  price_cost: number
  price_25: number
  price_35: number
  price_42: number
  points: number
  category: string
  status?: 'new' | 'update'
  existing_id?: string
}

export default function ImportPDFPage() {
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [products, setProducts] = useState<ParsedProduct[]>([])
  const [result, setResult] = useState<{ created: number; updated: number; errors: number } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setProducts([])
    setResult(null)
    setParsing(true)

    try {
      const formData = new FormData()
      formData.append('file', f)
      const res = await fetch('/api/import-pdf', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao parsear PDF')

      const parsed: ParsedProduct[] = data.products

      // Verificar quais já existem no banco
      const skus = parsed.map(p => p.sku)
      const { data: existing } = await supabase.from('products').select('id, sku').in('sku', skus)
      const existingMap = new Map(existing?.map(p => [p.sku, p.id]) || [])

      setProducts(parsed.map(p => ({
        ...p,
        status: (existingMap.has(p.sku) ? 'update' : 'new') as 'new' | 'update',
        existing_id: existingMap.get(p.sku),
      })))
    } catch (err: any) {
      alert('Erro ao ler o arquivo: ' + err.message)
    }
    setParsing(false)
  }

  async function handleImport() {
    setImporting(true)
    let created = 0, updated = 0, errors = 0

    // Garantir categorias
    const categoryNames = [...new Set(products.map(p => p.category))]
    const categoryMap = new Map<string, string>()
    for (const catName of categoryNames) {
      const slug = slugify(catName)
      const { data: existing } = await supabase.from('categories').select('id').eq('slug', slug).single()
      if (existing) {
        categoryMap.set(catName, existing.id)
      } else {
        const { data: newCat } = await supabase.from('categories').insert({ name: catName, slug, active: true }).select('id').single()
        if (newCat) categoryMap.set(catName, newCat.id)
      }
    }

    // Importar produtos
    for (const product of products) {
      try {
        const productData = {
          name: product.name,
          price: product.price_consumer,      // Preço de venda = Sugerido ao Consumidor
          cost_price: product.price_cost,      // Custo = 50% desconto
          category_id: categoryMap.get(product.category) || null,
        }

        if (product.status === 'update' && product.existing_id) {
          await supabase.from('products').update(productData).eq('id', product.existing_id)
          updated++
        } else {
          const slug = `${slugify(product.name)}-${product.sku.toLowerCase()}`
          await supabase.from('products').insert({
            ...productData,
            slug,
            sku: product.sku,
            active: true,
            stock: 0,
            images: [],
            tags: [],
          })
          created++
        }
      } catch (err) {
        console.error('Erro produto', product.sku, err)
        errors++
      }
    }

    setResult({ created, updated, errors })
    setImporting(false)
    router.refresh()
  }

  const newCount = products.filter(p => p.status === 'new').length
  const updateCount = products.filter(p => p.status === 'update').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
          Importar Lista de Preços
        </h1>
        <p className="text-slate-500 text-sm mt-1">Upload do PDF da Herbalife para cadastrar ou atualizar produtos automaticamente</p>
      </div>

      {/* Info dos preços */}
      <div className="rounded-2xl p-5 border grid grid-cols-2 gap-4" style={{ background: '#f1f8f1', borderColor: '#c8e6c9' }}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">🏷️</span>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#1B5E20' }}>Preço de Venda no Site</p>
            <p className="text-xs text-slate-500 mt-0.5">Preço Sugerido ao Consumidor — coluna do PDF usada automaticamente</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-2xl">💰</span>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#1B5E20' }}>Seu Preço de Custo</p>
            <p className="text-xs text-slate-500 mt-0.5">Coluna 50% — registrado internamente para controle de margem</p>
          </div>
        </div>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-2xl cursor-pointer transition-all"
          style={{ borderColor: file ? '#4CAF50' : '#c8e6c9', background: file ? '#f1f8f1' : '#fafffe' }}>
          <div className="text-center">
            {parsing ? (
              <>
                <svg className="w-10 h-10 mx-auto mb-3 animate-spin" style={{ color: '#4CAF50' }} fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm font-semibold" style={{ color: '#2E7D32' }}>Lendo PDF e identificando produtos...</p>
              </>
            ) : file ? (
              <>
                <span className="text-5xl mb-3 block">📄</span>
                <p className="text-sm font-semibold" style={{ color: '#1B5E20' }}>{file.name}</p>
                <p className="text-xs text-slate-400 mt-1">Clique para trocar</p>
              </>
            ) : (
              <>
                <span className="text-5xl mb-3 block">📤</span>
                <p className="text-sm font-semibold text-slate-700">Clique para selecionar o PDF</p>
                <p className="text-xs text-slate-400 mt-1">Lista de Preços Herbalife (.pdf)</p>
              </>
            )}
          </div>
          <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      {/* Preview */}
      {products.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                {products.length} produtos identificados
              </h3>
              <p className="text-sm mt-0.5">
                <span className="text-green-600 font-semibold">{newCount} novos</span>
                {' · '}
                <span className="text-blue-600 font-semibold">{updateCount} para atualizar</span>
              </p>
            </div>
            <button onClick={handleImport} disabled={importing}
              className="text-white font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
              style={{ background: 'linear-gradient(135deg, #1B5E20, #388E3C)' }}>
              {importing ? 'Importando...' : `🚀 Importar ${products.length} produtos`}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">SKU</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Produto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Categoria</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Preço de Venda</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Seu Custo (50%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.status === 'new' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {p.status === 'new' ? '+ Novo' : '↑ Atualizar'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.sku}</td>
                    <td className="px-4 py-3 text-sm text-slate-900 max-w-xs">
                      <p className="truncate">{p.name}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{p.category}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-sm" style={{ color: '#1B5E20' }}>
                        R$ {p.price_consumer.toFixed(2).replace('.', ',')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      R$ {p.price_cost.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className="rounded-2xl p-6" style={{ background: '#e8f5e9', border: '1px solid #c8e6c9' }}>
          <h3 className="font-bold text-lg mb-4" style={{ color: '#1B5E20' }}>✅ Importação Concluída!</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-xl p-4 text-center border border-green-100">
              <p className="text-3xl font-bold text-green-600">{result.created}</p>
              <p className="text-sm text-slate-500 mt-1">Criados</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-green-100">
              <p className="text-3xl font-bold text-blue-600">{result.updated}</p>
              <p className="text-sm text-slate-500 mt-1">Atualizados</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-green-100">
              <p className="text-3xl font-bold text-red-500">{result.errors}</p>
              <p className="text-sm text-slate-500 mt-1">Erros</p>
            </div>
          </div>
          <button onClick={() => router.push('/admin/products')}
            className="text-white font-semibold px-6 py-2.5 rounded-xl"
            style={{ background: '#1B5E20' }}>
            Ver Produtos →
          </button>
        </div>
      )}
    </div>
  )
}
