import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import ProductCard from '@/components/shop/ProductCard'
import DesktopSidebar from '@/components/shop/desktop/DesktopSidebar'
import FeaturedSlider from '@/components/shop/FeaturedSlider'
import SocialFloat from '@/components/shop/SocialFloat'
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
    { data: wishlistItems },
    { data: settings },
  ] = await Promise.all([
    query,
    supabase.from('categories').select('*').eq('active', true).order('sort_order'),
    supabase.from('products').select('*, categories(name)').eq('active', true).eq('featured', true).limit(5),
    user ? supabase.from('product_views').select('product:products(*, categories(name))')
      .eq('customer_id', user.id).order('viewed_at', { ascending: false }).limit(6)
      : Promise.resolve({ data: [] }),
    user ? supabase.from('wishlist').select('product_id').eq('customer_id', user.id)
      : Promise.resolve({ data: [] }),
    supabase.from('settings').select('whatsapp_number, instagram_url, facebook_url, tiktok_url, youtube_url, twitter_url').eq('id', 'default').single(),
  ])

  const recentProducts = (recentViews || []).map((v: any) => v.product).filter(Boolean)
  const favoritedIds = new Set((wishlistItems || []).map((w: any) => w.product_id))
  const isFiltered = params.category || params.q

  return (
    <>
      <ZipModal />

      {/* Widget flutuante de redes sociais */}
      <SocialFloat
        whatsapp={settings?.whatsapp_number}
        instagram={settings?.instagram_url}
        facebook={settings?.facebook_url}
        tiktok={settings?.tiktok_url}
        youtube={settings?.youtube_url}
        twitter={settings?.twitter_url}
      />

      {/* Sidebar desktop */}
      <div className="hidden lg:block">
        <DesktopSidebar
          categories={categories || []}
          currentCategory={params.category}
          currentSearch={params.q}
        />
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 min-w-0 pb-4 lg:pb-8">

        {/* Slide de destaques */}
        {!isFiltered && featured && featured.length > 0 && (
          <FeaturedSlider products={featured as any} />
        )}

        {/* Últimos vistos */}
        {!isFiltered && recentProducts.length > 0 && (
          <div className="pt-5 lg:pt-6">
            <p className="font-black text-sm text-slate-900 px-4 lg:px-6 mb-3" style={{ fontFamily: 'Arial Black, sans-serif' }}>
              👁️ Vistos Recentemente
            </p>
            <div className="flex gap-3 px-4 lg:px-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {recentProducts.map((product: any) => (
                <Link key={product.id} href={`/shop/products/${product.slug}`}
                  className="flex-shrink-0 w-28 lg:w-36 bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="aspect-[4/5] bg-white flex items-center justify-center">
                    {product.images?.[0]?.url
                      ? <img src={product.images[0].url} alt={product.name} className="w-full h-full object-contain p-1" />
                      : <div className="text-2xl">🌿</div>}
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

        {/* Categorias scroll — só mobile */}
        {!params.q && (
          <div className="pt-4 pb-2 lg:hidden">
            <div className="flex gap-2 px-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              <a href="/shop" className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold"
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

        {/* Header seção */}
        <div className="px-4 lg:px-6 pt-3 pb-3 flex items-center justify-between">
          {params.q ? (
            <>
              <p className="text-sm text-slate-600">
                <span className="font-semibold">{products?.length || 0}</span> resultados para{' '}
                <span className="font-semibold">"{params.q}"</span>
              </p>
              <a href="/shop" className="text-xs font-medium" style={{ color: '#1B5E20' }}>Limpar</a>
            </>
          ) : (
            <>
              <h2 className="font-black text-slate-900 text-base lg:text-lg" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                {params.category ? categories?.find((c: any) => c.id === params.category)?.name || 'Produtos' : 'Todos os Produtos'}
              </h2>
              <span className="text-xs text-slate-400">{products?.length || 0} itens</span>
            </>
          )}
        </div>

        {/* Grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 px-4 lg:px-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} initialFavorited={favoritedIds.has(product.id)} />
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
    </>
  )
}
