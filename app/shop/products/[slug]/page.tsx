import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import BundleSelector from '@/components/shop/BundleSelector'
import FrequentlyBoughtTogether from '@/components/shop/FrequentlyBoughtTogether'
import ShippingEstimate from '@/components/shop/ShippingEstimate'
import ProductViewTracker from '@/components/shop/ProductViewTracker'

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

  // Buscar pacotes, sugestões manuais e produtos comprados juntos em paralelo
  const [
    { data: bundles },
    { data: manualSuggestions },
    { data: autoBoughtTogether },
  ] = await Promise.all([
    supabase.from('product_bundles').select('*').eq('product_id', product.id).eq('active', true).order('quantity'),
    supabase.from('product_suggestions')
      .select('*, suggested_product:products!suggested_product_id(*, categories(name))')
      .eq('product_id', product.id).eq('active', true).order('sort_order'),
    supabase.from('products_bought_together')
      .select('related_product_id, times_bought_together')
      .eq('product_id', product.id)
      .limit(3),
  ])

  // Buscar produtos dos "comprados juntos" automáticos
  let autoProducts: any[] = []
  if (autoBoughtTogether && autoBoughtTogether.length > 0) {
    const ids = autoBoughtTogether.map((r: any) => r.related_product_id)
    const { data } = await supabase.from('products').select('*').in('id', ids).eq('active', true)
    autoProducts = data || []
  }

  // Combinar sugestões manuais + automáticas (manuais têm prioridade)
  const manualIds = new Set((manualSuggestions || []).map((s: any) => s.suggested_product_id))
  const suggestions = [
    ...(manualSuggestions || []).map((s: any) => ({
      product: s.suggested_product,
      bundle_price: s.bundle_price,
      bundle_label: s.bundle_label,
      source: 'manual' as const,
    })),
    ...autoProducts
      .filter(p => !manualIds.has(p.id))
      .map(p => ({
        product: p,
        bundle_price: null,
        bundle_label: null,
        source: 'automatic' as const,
      })),
  ].filter(s => s.product).slice(0, 4)

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) : 0

  return (
    <div className="pb-6">
      {/* Tracker de visualização */}
      {user && <ProductViewTracker productId={product.id} customerId={user.id} />}

      {/* Voltar */}
      <div className="px-4 pt-3 pb-2">
        <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: '#1B5E20' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Link>
      </div>

      {/* Imagem */}
      <div className="mx-4 rounded-2xl overflow-hidden bg-white aspect-square mb-4">
        {product.images?.[0]?.url
          ? <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-8xl">🌿</div>}
      </div>

      <div className="px-4 space-y-4">
        {/* Categoria */}
        {product.categories && (
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#4CAF50' }}>
            {(product.categories as any).name}
          </p>
        )}

        {/* Nome */}
        <h1 className="font-black text-xl text-slate-900 leading-tight" style={{ fontFamily: 'Arial Black, sans-serif' }}>
          {product.name}
        </h1>

        {/* Preço */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-end gap-3">
            <p className="font-black text-3xl" style={{ color: '#1B5E20', fontFamily: 'Arial Black, sans-serif' }}>
              {formatCurrency(product.price)}
            </p>
            {product.compare_price && (
              <div className="pb-1">
                <p className="text-slate-400 line-through text-base">{formatCurrency(product.compare_price)}</p>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">-{discount}% OFF</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-400'}`} />
            <p className="text-sm font-medium" style={{ color: product.stock > 0 ? '#1B5E20' : '#ef4444' }}>
              {product.stock > 0 ? `${product.stock} disponíveis` : 'Fora de estoque'}
            </p>
          </div>
        </div>

        {/* Pacotes de quantidade */}
        <BundleSelector product={product as any} bundles={bundles || []} />

        {/* Frete estimado */}
        <ShippingEstimate product={product as any} />

        {/* Produtos comprados juntos */}
        {suggestions.length > 0 && (
          <FrequentlyBoughtTogether currentProduct={product as any} suggestions={suggestions} />
        )}

        {/* Descrição */}
        {product.description && (
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-black text-sm text-slate-900 mb-2" style={{ fontFamily: 'Arial Black, sans-serif' }}>Descrição</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag: string) => (
              <span key={tag} className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full font-medium border border-green-100">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
