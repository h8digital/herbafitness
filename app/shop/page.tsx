import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import AddToCartButton from '@/components/shop/AddToCartButton'
import Link from 'next/link'

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase.from('products').select('*, categories(name)').eq('active', true).order('created_at', { ascending: false })
  if (params.category) query = query.eq('category_id', params.category)
  if (params.q) query = query.ilike('name', `%${params.q}%`)

  const [{ data: products }, { data: categories }] = await Promise.all([
    query,
    supabase.from('categories').select('*').eq('active', true).order('sort_order'),
  ])

  return (
    <div className="space-y-6">
      {/* Busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form className="flex-1 flex gap-3">
          <input name="q" defaultValue={params.q} placeholder="Buscar produtos..."
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white" />
          <button type="submit" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">
            Buscar
          </button>
        </form>
      </div>

      {/* Categorias */}
      {categories && categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <a href="/shop" className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!params.category ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            Todos
          </a>
          {categories.map((cat: any) => (
            <a key={cat.id} href={`/shop?category=${cat.id}`}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${params.category === cat.id ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {cat.name}
            </a>
          ))}
        </div>
      )}

      {/* Grid de produtos */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <div key={product.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
              {/* Imagem */}
              <Link href={`/shop/products/${product.slug}`} className="block">
                <div className="aspect-square bg-slate-100 overflow-hidden">
                  {product.images?.[0]?.url ? (
                    <img src={product.images[0].url} alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl text-slate-300">📦</div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                {product.categories?.name && (
                  <p className="text-xs text-slate-400 mb-1">{product.categories.name}</p>
                )}
                <Link href={`/shop/products/${product.slug}`}>
                  <h3 className="font-semibold text-slate-900 text-sm mb-2 hover:text-orange-600 transition-colors line-clamp-2" style={{ fontFamily: 'var(--font-display)' }}>
                    {product.name}
                  </h3>
                </Link>

                {product.short_description && (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{product.short_description}</p>
                )}

                <div className="flex items-center justify-between gap-2">
                  <div>
                    {product.compare_price && (
                      <p className="text-xs text-slate-400 line-through">{formatCurrency(product.compare_price)}</p>
                    )}
                    <p className="font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <AddToCartButton product={product} />
                </div>

                {product.stock === 0 && (
                  <p className="text-xs text-red-500 mt-2 font-medium">Fora de estoque</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-slate-500 text-sm">Tente ajustar os filtros ou termos de busca.</p>
        </div>
      )}
    </div>
  )
}
