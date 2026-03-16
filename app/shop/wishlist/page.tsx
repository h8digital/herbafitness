import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import WishlistButton from '@/components/shop/WishlistButton'
import AddToCartButton from '@/components/shop/AddToCartButton'

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: items } = await supabase
    .from('wishlist')
    .select('product_id, created_at, products(*, categories(name))')
    .eq('customer_id', user!.id)
    .order('created_at', { ascending: false })

  const products = (items || []).map((i: any) => i.products).filter(Boolean)

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5" fill="#ef4444" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <h1 className="font-black text-lg text-slate-900" style={{ fontFamily: 'Arial Black, sans-serif' }}>
          Meus Favoritos
        </h1>
        <span className="text-sm text-slate-400">({products.length})</span>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="#d1d5db" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p className="font-bold text-slate-600 mb-1">Nenhum favorito ainda</p>
          <p className="text-sm text-slate-400 mb-5 text-center">Toque no ❤️ nos produtos para salvá-los aqui</p>
          <Link href="/shop" className="text-white font-bold px-6 py-2.5 rounded-xl text-sm"
            style={{ background: '#1B5E20' }}>
            Ver Produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product: any) => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 flex flex-col">
              <Link href={`/shop/products/${product.slug}`} className="block relative">
                <div className="aspect-[4/5] bg-white flex items-center justify-center">
                  {product.images?.[0]?.url
                    ? <img src={product.images[0].url} alt={product.name} className="w-full h-full object-contain p-2" />
                    : <div className="text-4xl">🌿</div>}
                </div>
                <div className="absolute top-2 right-2">
                  <WishlistButton productId={product.id} initialFavorited={true} size="sm" />
                </div>
              </Link>
              <div className="p-3 flex flex-col flex-1 gap-2">
                <p className="text-xs font-medium text-slate-900 line-clamp-2 leading-tight flex-1">{product.name}</p>
                <p className="font-black text-base" style={{ color: '#1B5E20' }}>{formatCurrency(product.price)}</p>
                <AddToCartButton product={product} size="sm" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
