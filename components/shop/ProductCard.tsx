'use client'

import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import AddToCartButton from './AddToCartButton'
import WishlistButton from './WishlistButton'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compare_price?: number | null
  stock: number
  featured?: boolean
  images?: { url: string }[]
  categories?: { name: string } | null
}

interface ProductCardProps {
  product: Product
  initialFavorited?: boolean
}

export default function ProductCard({ product, initialFavorited = false }: ProductCardProps) {
  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 flex flex-col">
      {/* Imagem */}
      <div className="relative">
        <Link href={`/shop/products/${product.slug}`} className="block">
          <div className="aspect-[4/5] bg-white flex items-center justify-center">
            {product.images?.[0]?.url
              ? <img src={product.images[0].url} alt={product.name} className="w-full h-full object-contain p-2" />
              : <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>}
          </div>
        </Link>

        {/* Badge destaque ou desconto */}
        {discount > 0 ? (
          <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 pointer-events-none">
            -{discount}%
          </span>
        ) : product.featured ? (
          <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none"
            style={{ background: '#1B5E20' }}>
            Destaque
          </span>
        ) : null}

        {/* Botão favorito — canto superior direito */}
        <div className="absolute top-2 right-2">
          <WishlistButton productId={product.id} initialFavorited={initialFavorited} size="sm" />
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <Link href={`/shop/products/${product.slug}`}>
          <p className="text-xs text-slate-900 font-medium leading-tight line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </p>
        </Link>

        {product.compare_price && (
          <p className="text-[11px] text-slate-400 line-through -mb-1">
            {formatCurrency(product.compare_price)}
          </p>
        )}

        <p className="font-black text-base" style={{ color: '#1B5E20', fontFamily: 'Arial Black, sans-serif' }}>
          {formatCurrency(product.price)}
        </p>

        {product.stock === 0 ? (
          <p className="text-[11px] text-red-400 font-medium">Sem estoque</p>
        ) : (
          <AddToCartButton product={product as any} size="md" />
        )}
      </div>
    </div>
  )
}
