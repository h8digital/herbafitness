import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import VariationSelector from '@/components/shop/VariationSelector'
import ShippingEstimate from '@/components/shop/ShippingEstimate'
import ProductViewTracker from '@/components/shop/ProductViewTracker'
import ProductCard from '@/components/shop/ProductCard'
import ReviewSection from '@/components/shop/ReviewSection'
import ShareButtons from '@/components/shop/ShareButtons'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase.from('products').select('name, short_description, images').eq('slug', slug).single()
  if (!product) return {}
  return {
    title: product.name,
    description: product.short_description,
    openGraph: { images: product.images?.[0]?.url ? [product.images[0].url] : [] },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!product) notFound()

  const [
    { data: bundles },
    { data: manualSuggestions },
    { data: variationTypes },
    { data: reviews },
    { data: relatedProducts },
  ] = await Promise.all([
    supabase.from('product_bundles').select('*').eq('product_id', product.id).eq('active', true).order('quantity'),
    supabase.from('product_suggestions')
      .select('*, suggested_product:products!suggested_product_id(*)')
      .eq('product_id', product.id).eq('active', true).order('sort_order'),
    supabase.from('product_variation_types')
      .select('*, options:product_variation_options(*)')
      .eq('product_id', product.id).order('sort_order'),
    supabase.from('product_reviews')
      .select('*')
      .eq('product_id', product.id)
      .eq('approved', true)
      .order('created_at', { ascending: false }),
    product.category_id
      ? supabase.from('products').select('*, categories(name)').eq('active', true)
          .eq('category_id', product.category_id).neq('id', product.id).limit(4)
      : Promise.resolve({ data: [] }),
  ])

  const suggestions = (manualSuggestions || []).map((s: any) => ({
    product: s.suggested_product,
    bundle_price: s.bundle_price,
    bundle_label: s.bundle_label,
    source: 'manual' as const,
  })).filter((s: any) => s.product).slice(0, 3)

  const sortedVariations = (variationTypes || []).map((t: any) => ({
    ...t,
    options: (t.options || []).filter((o: any) => o.active).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }))

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  const approvedReviews = reviews || []
  const avgRating = approvedReviews.length > 0
    ? approvedReviews.reduce((s: number, r: any) => s + r.rating, 0) / approvedReviews.length
    : 0

  const wishlistItems = user
    ? (await supabase.from('wishlist').select('product_id').eq('customer_id', user.id)).data || []
    : []
  const favoritedIds = new Set(wishlistItems.map((w: any) => w.product_id))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.herbafit.com.br'
  const productUrl = `${appUrl}/shop/products/${slug}`

  return (
    <>
      {/* ── ProductViewTracker com prop correta: customerId ── */}
      {user?.id && <ProductViewTracker productId={product.id} customerId={user.id} />}

      <div className="pb-16 lg:pb-20">
        {/* Breadcrumb */}
        <div className="px-4 lg:px-6 py-3 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/shop" className="hover:text-slate-600 transition-colors">Produtos</Link>
          {(product.categories as any)?.name && (
            <>
              <span>›</span>
              <Link href={`/shop?category=${product.category_id}`} className="hover:text-slate-600 transition-colors">
                {(product.categories as any).name}
              </Link>
            </>
          )}
          <span>›</span>
          <span className="text-slate-600 truncate">{product.name}</span>
        </div>

        {/* ── ÁREA PRINCIPAL: imagem + info ── */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start px-4 lg:px-6">

          {/* Coluna esquerda — imagem sticky */}
          <div className="relative mb-6 lg:mb-0 lg:sticky lg:top-6">
            <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-100"
              style={{ aspectRatio: '1/1' }}>
              {product.images?.[0]?.url ? (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-full object-contain p-6 lg:p-10"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">🌿</div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-black px-3 py-1.5 rounded-full">
                  -{discount}%
                </div>
              )}
              {product.featured && !discount && (
                <div className="absolute top-4 left-4 text-white text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: '#1B5E20' }}>
                  ★ Destaque
                </div>
              )}
            </div>
          </div>

          {/* Coluna direita — informações */}
          <div className="space-y-5">
            {/* Categoria + nome */}
            <div>
              {(product.categories as any)?.name && (
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4CAF50' }}>
                  {(product.categories as any).name}
                </p>
              )}
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 leading-tight"
                style={{ fontFamily: 'Arial Black, sans-serif' }}>
                {product.name}
              </h1>
              {product.sku && (
                <p className="text-xs text-slate-400 mt-1">SKU: {product.sku}</p>
              )}
            </div>

            {/* Estrelas resumidas */}
            {approvedReviews.length > 0 && (
              <a href="#reviews" className="flex items-center gap-2 group">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className={`w-4 h-4 ${i <= Math.round(avgRating) ? 'text-amber-400' : 'text-slate-200'}`}
                      viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-slate-500 group-hover:underline">
                  {avgRating.toFixed(1)} ({approvedReviews.length} avaliação{approvedReviews.length !== 1 ? 'ões' : ''})
                </span>
              </a>
            )}

            {/* Preço */}
            <div>
              {product.compare_price && (
                <p className="text-slate-400 line-through text-base">
                  {formatCurrency(product.compare_price)}
                </p>
              )}
              <p className="font-black text-4xl" style={{ color: '#1B5E20', fontFamily: 'Arial Black, sans-serif' }}>
                {formatCurrency(product.price)}
              </p>
              {discount > 0 && (
                <p className="text-sm text-red-500 font-semibold mt-0.5">
                  Você economiza {formatCurrency(product.compare_price! - product.price)}
                </p>
              )}
            </div>

            {/* Estoque */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                product.stock > 5 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-400' : 'bg-red-400'
              }`} />
              <p className="text-sm font-medium" style={{ color: product.stock > 0 ? '#1B5E20' : '#ef4444' }}>
                {product.stock > 5
                  ? `${product.stock} em estoque`
                  : product.stock > 0
                  ? `Apenas ${product.stock} restante${product.stock !== 1 ? 's' : ''}!`
                  : 'Fora de estoque'}
              </p>
            </div>

            {/* Descrição curta */}
            {product.short_description && (
              <p className="text-sm text-slate-600 leading-relaxed border-l-2 pl-3" style={{ borderColor: '#4CAF50' }}>
                {product.short_description}
              </p>
            )}

            {/* Variações + botão */}
            <VariationSelector
              product={product as any}
              variationTypes={sortedVariations}
              bundles={bundles || []}
              suggestions={suggestions}
            />

            {/* Frete */}
            <ShippingEstimate product={product as any} />

            {/* Compartilhar */}
            <ShareButtons name={product.name} url={productUrl} />

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {product.tags.map((tag: string) => (
                  <span key={tag}
                    className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full font-medium border border-green-100">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── DESCRIÇÃO COMPLETA ── */}
        {product.description && (
          <div className="px-4 lg:px-6 mt-12">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 lg:p-8">
              <h2 className="text-lg font-black text-slate-900 mb-4" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                Sobre o Produto
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          </div>
        )}

        {/* ── PRODUTOS RELACIONADOS ── */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="px-4 lg:px-6 mt-12">
            <h2 className="text-lg font-black text-slate-900 mb-4" style={{ fontFamily: 'Arial Black, sans-serif' }}>
              Você também pode gostar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {relatedProducts.map((p: any) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  initialFavorited={favoritedIds.has(p.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── AVALIAÇÕES ── */}
        <div id="reviews" className="px-4 lg:px-6 mt-12">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 lg:p-8">
            <ReviewSection
              productId={product.id}
              reviews={approvedReviews}
              avgRating={avgRating}
              totalReviews={approvedReviews.length}
            />
          </div>
        </div>
      </div>
    </>
  )
}
