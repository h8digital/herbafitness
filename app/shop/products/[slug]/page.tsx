import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/components/shop/AddToCartButton'
import Link from 'next/link'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products').select('*, categories(name, slug)').eq('slug', slug).eq('active', true).single()

  if (!product) notFound()

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) : 0

  return (
    <div className="pb-4">
      {/* Voltar */}
      <div className="px-4 pt-3 pb-2">
        <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: '#1B5E20' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Link>
      </div>

      {/* Imagem grande */}
      <div className="mx-4 rounded-2xl overflow-hidden bg-white aspect-square mb-4">
        {product.images?.[0]?.url ? (
          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">🌿</div>
        )}
      </div>

      {/* Info */}
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
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  -{discount}% OFF
                </span>
              </div>
            )}
          </div>

          {/* Estoque */}
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-400'}`} />
            <p className="text-sm font-medium" style={{ color: product.stock > 0 ? '#1B5E20' : '#ef4444' }}>
              {product.stock > 0 ? `${product.stock} disponíveis` : 'Fora de estoque'}
            </p>
          </div>
        </div>

        {/* Botão */}
        <AddToCartButton product={product as any} size="lg" />

        {/* Descrição */}
        {product.description && (
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-black text-sm text-slate-900 mb-2" style={{ fontFamily: 'Arial Black, sans-serif' }}>Descrição</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>
        )}

        {/* SKU e Tags */}
        {(product.sku || (product.tags && product.tags.length > 0)) && (
          <div className="bg-white rounded-2xl p-4 space-y-3">
            {product.sku && (
              <p className="text-xs text-slate-400">SKU: <span className="font-mono text-slate-600">{product.sku}</span></p>
            )}
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
        )}
      </div>
    </div>
  )
}
