'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { Product } from '@/types'

interface AddToCartButtonProps {
  product: Product
  size?: 'sm' | 'md' | 'lg'
  onAddToCart?: () => void
}

export default function AddToCartButton({ product, size = 'md', onAddToCart }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  function handleAdd(e?: React.MouseEvent) {
    e?.stopPropagation()
    if (product.stock === 0) return
    addItem(product)
    setAdded(true)
    onAddToCart?.()
    setTimeout(() => setAdded(false), 1500)
  }

  // LG — botão largo (página do produto, checkout)
  if (size === 'lg') {
    return (
      <button onClick={handleAdd} disabled={product.stock === 0}
        className="w-full font-black py-4 px-6 rounded-2xl transition-all text-sm text-white disabled:opacity-60"
        style={added ? { background: '#16a34a' }
          : product.stock === 0 ? { background: '#e2e8f0', color: '#94a3b8' }
          : { background: 'linear-gradient(135deg, #1B5E20, #4CAF50)' }}>
        {product.stock === 0 ? 'Sem estoque' : added ? '✓ Adicionado!' : 'Adicionar ao Carrinho'}
      </button>
    )
  }

  // MD — botão largo no grid (padrão)
  if (size === 'md') {
    return (
      <button onClick={handleAdd} disabled={product.stock === 0}
        className="w-full flex items-center justify-center gap-2 font-bold py-2.5 rounded-xl transition-all text-sm text-white disabled:opacity-60 active:scale-95"
        style={added ? { background: '#16a34a' }
          : product.stock === 0 ? { background: '#e2e8f0', color: '#94a3b8' }
          : { background: 'linear-gradient(135deg, #1B5E20, #4CAF50)' }}>
        {added ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Adicionado!
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Adicionar
          </>
        )}
      </button>
    )
  }

  // SM — ícone compacto (usado em thumbnails)
  return (
    <button onClick={handleAdd} disabled={product.stock === 0}
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all text-white active:scale-90"
      style={added ? { background: '#16a34a' }
        : product.stock === 0 ? { background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed' }
        : { background: 'linear-gradient(135deg, #1B5E20, #4CAF50)' }}>
      {added
        ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      }
    </button>
  )
}
