import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/components/shop/AddToCartButton'
import Link from 'next/link'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!product) notFound()

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/shop" className="hover:text-slate-600 transition-colors">Produtos</Link>
        {product.categories && (
          <>
            <span>›</span>
            <Link href={`/shop?category=${(product.categories as any).id || ''}`}
              className="hover:text-slate-600 transition-colors">
              {(product.categories as any).name}
            </Link>
          </>
        )}
        <span>›</span>
        <span className="text-slate-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Imagem */}
        <div className="aspect-square bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {product.images?.[0]?.url ? (
            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl text-slate-200">📦</div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          {product.categories && (
            <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">
              {(product.categories as any).name}
            </p>
          )}

          <h1 className="text-3xl font-bold text-slate-900 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {product.name}
          </h1>

          {product.short_description && (
            <p className="text-slate-600">{product.short_description}</p>
          )}

          {/* Preço */}
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
              {formatCurrency(product.price)}
            </p>
            {product.compare_price && (
              <div className="pb-1">
                <p className="text-slate-400 line-through text-lg">{formatCurrency(product.compare_price)}</p>
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  -{discount}% OFF
                </span>
              </div>
            )}
          </div>

          {/* Estoque */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `${product.stock} em estoque` : 'Fora de estoque'}
            </span>
          </div>

          {/* SKU */}
          {product.sku && (
            <p className="text-xs text-slate-400">SKU: {product.sku}</p>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag: string) => (
                <span key={tag} className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}

          {/* Botão */}
          <AddToCartButton product={product as any} size="lg" />

          {/* Dimensões (para transparência de frete) */}
          {(product.weight || product.length) && (
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-500 space-y-1">
              <p className="font-medium text-slate-700 mb-2">Informações de envio</p>
              {product.weight && <p>Peso: {product.weight} kg</p>}
              {product.length && product.width && product.height && (
                <p>Dimensões: {product.length} × {product.width} × {product.height} cm</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Descrição completa */}
      {product.description && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Descrição
          </h2>
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </div>
        </div>
      )}
    </div>
  )
}
