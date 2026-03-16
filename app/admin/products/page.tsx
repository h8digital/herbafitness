import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import ProductActions from './ProductActions'

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; filter?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false })
  if (params.q) query = query.ilike('name', `%${params.q}%`)
  if (params.category) query = query.eq('category_id', params.category)
  if (params.filter === 'low_stock') query = query.filter('stock', 'lte', 'min_stock')

  const [{ data: products }, { data: categories }] = await Promise.all([
    query,
    supabase.from('categories').select('id, name').eq('active', true),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Produtos</h1>
          <p className="text-slate-500 text-sm mt-1">{products?.length || 0} produtos</p>
        </div>
        <Link href="/admin/products/new"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
          + Novo Produto
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-3 flex-wrap items-center">
        <form className="flex gap-3 flex-1 min-w-0">
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Buscar produto..."
            className="flex-1 min-w-0 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <select
            name="category"
            defaultValue={params.category}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Todas categorias</option>
            {categories?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">
            Filtrar
          </button>
        </form>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Produto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Preço</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estoque</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products && products.length > 0 ? products.map((product: any) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">📷</div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{product.name}</p>
                        <p className="text-xs text-slate-400">{product.categories?.name || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{product.sku || '—'}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{formatCurrency(product.price)}</p>
                      {product.compare_price && (
                        <p className="text-xs text-slate-400 line-through">{formatCurrency(product.compare_price)}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${product.stock <= product.min_stock ? 'text-red-600' : 'text-slate-900'}`}>
                      {product.stock}
                      {product.stock <= product.min_stock && ' ⚠️'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {product.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <ProductActions product={product} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Nenhum produto encontrado.{' '}
                    <Link href="/admin/products/new" className="text-orange-500 hover:underline">Criar primeiro produto</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
