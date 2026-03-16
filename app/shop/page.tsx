import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import AddToCartButton from '@/components/shop/AddToCartButton'
import Link from 'next/link'
import ZipModal from '@/components/shop/ZipModal'

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase.from('products').select('*, categories(name, id)').eq('active', true)
    .order('featured', { ascending: false }).order('created_at', { ascending: false })
  if (params.category) query = query.eq('category_id', params.category)
  if (params.q) query = query.or(`name.ilike.%${params.q}%,sku.ilike.%${params.q}%,short_description.ilike.%${params.q}%`)

  const [
    { data: products },
    { data: categories },
    { data: featured },
    { data: recentViews },
  ] = await Promise.all([
    query,
    supabase.from('categories').select('*').eq('active', true).order('sort_order'),
    supabase.from('products').select('*, categories(name)').eq('active', true).eq('featured', true).limit(5),
    // Últimos produtos vistos pelo cliente
    user ? supabase.from('product_views')
      .select('product:products(*, categories(name))')
      .eq('customer_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(6) : Promise.resolve({ data: [] }),
  ])

  const recentProducts = (recentViews || []).map((v: any) => v.product).filter(Boolean)
  const isFiltered = params.category || params.q

  return (
    <div className="pb-4">
      {/* Modal de CEP */}
      <ZipModal />

      {/* Banner destaque */}
      {!isFiltered && featured && featured.length > 0 && (
        <div className="px-4 pt-3">
          <div className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #1B5E20, #4CAF50)', minHeight: 120 }}>
            <div className="p-5">
              <p className="text-white/80 text-xs font-medium uppercase tracking-wide mb-1">Destaque</p>
              <p className="text-white font-black text-lg leading-tight" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                {featured[0].name}
              </p>
              <p className="text-white/90 text-sm mt-1 font-semibold">{formatCurrency(featured[0].price)}</p>
              <Link href={`/shop/products/${featured[0].slug}`}
                className="mt-3 inline-block bg-white text-xs font-bold px-4 py-2 rounded-xl"
                style={{ color: '#1B5E20' }}>
                Ver produto →
              </Link>
            </div>
            {featured[0].images?.[0]?.url && (
              <img src={featured[0].images[0].url} alt={featured[0].name}
                className="absolute right-0 top-0 h-full w-32 object-cover opacity-30" />
            )}
          </div>
        </div>
      )}

      {/* Últimos vistos */}
      {!isFiltered && recentProducts.length > 0 && (
        <div className="pt-5">
          <div className="flex items-center justify-between px-4 mb-3">
            <p className="font-black text-sm text-slate-900" style={{ fontFamily: 'Arial Black, sans-serif' }}>
              👁️ Vistos Recentemente
            </p>
          </div>
          <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none pb-1">
            {recentProducts.map((product: any) => (
              <Link key={product.id} href={`/shop/products/${product.slug}`}
                className="flex-shrink-0 w-28 bg-white rounded-2xl border border-slate-100 overflow-hidden active:scale-95 transition-transform">
                <div className="aspect-[4/5] bg-slate-50">
                  {product.images?.[0]?.url
                    ? <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover object-center" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>}
                </div>
                <div className="p-2">
                  <p className="text-[10px] text-slate-600 line-clamp-2 leading-tight">{product.name}</p>
                  <p className="font-black text-xs mt-1" style={{ color: '#1B5E20' }}>{formatCurrency(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Categorias scroll horizontal */}
      {!params.q && (
        <div className="pt-4 pb-2">
          <div className="flex gap-2 px-4 overflow-x-auto scrollbar-none pb-1">
            <a href="/shop"
              className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold"
              style={!params.category ? { background: '#1B5E20', color: '#fff' } : { background: '#fff', color: '#374151', border: '1px solid #e5e7eb' }}>
              Todos
            </a>
            {categories?.map((cat: any) => (
              <a key={cat.id} href={`/shop?category=${cat.id}`}
                className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold"
                style={params.category === cat.id
                  ? { background: '#1B5E20', color: '#fff' }
                  : { background: '#fff', color: '#374151', border: '1px solid #e5e7eb' }}>
                {cat.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Resultado da busca */}
      {params.q && (
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            <span className="font-semibold">{products?.length || 0}</span> resultados para <span className="font-semibold">"{params.q}"</span>
          </p>
          <a href="/shop" className="text-xs font-medium" style={{ color: '#1B5E20' }}>Limpar</a>
        </div>
      )}

      {/* Header seção */}
      {!params.q && (
        <div className="flex items-center justify-between px-4 pt-2 pb-3">
          <h2 className="font-black text-slate-900 text-base" style={{ fontFamily: 'Arial Black, sans-serif' }}>
            {params.category ? categories?.find((c: any) => c.id === params.category)?.name || 'Produtos' : 'Todos os Produtos'}
          </h2>
          <span className="text-xs text-slate-400">{products?.length || 0} itens</span>
        </div>
      )}

      {/* Grid de produtos */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 px-4">
          {products.map((product: any) => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 flex flex-col">
              <Link href={`/shop/products/${product.slug}`} className="block relative">
                <div className="aspect-[4/5] overflow-hidden bg-slate-50">
                  {product.images?.[0]?.url
                    ? <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover object-center" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>}
                </div>
                {product.featured && (
                  <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#1B5E20' }}>Destaque</span>
                )}
                {product.compare_price && (
                  <span className="absolute top-2 right-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500">
                    -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                  </span>
                )}
              </Link>
              <div className="p-3 flex flex-col flex-1">
                <Link href={`/shop/products/${product.slug}`}>
                  <p className="text-xs text-slate-900 font-medium leading-tight line-clamp-2 mb-2 min-h-[2.5rem]">{product.name}</p>
                </Link>
                {product.compare_price && (
                  <p className="text-[11px] text-slate-400 line-through">{formatCurrency(product.compare_price)}</p>
                )}
                <p className="font-black text-base" style={{ color: '#1B5E20', fontFamily: 'Arial Black, sans-serif' }}>
                  {formatCurrency(product.price)}
                </p>
                {product.stock === 0
                  ? <p className="text-[11px] text-red-400 font-medium mt-1">Sem estoque</p>
                  : <div className="mt-2"><AddToCartButton product={product} size="sm" /></div>
                }
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <span className="text-5xl mb-3">🔍</span>
          <p className="font-bold text-slate-700 text-center">Nenhum produto encontrado</p>
          <a href="/shop" className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>Ver todos</a>
        </div>
      )}
    </div>
  )
}
