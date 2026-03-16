'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { Product } from '@/types'

interface AddToCartButtonProps {
  product: Product
  size?: 'sm' | 'lg'
  onAddToCart?: () => void
}

export default function AddToCartButton({ product, size = 'sm', onAddToCart }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  function handleAdd() {
    if (product.stock === 0) return
    addItem(product)
    setAdded(true)
    onAddToCart?.()
    setTimeout(() => setAdded(false), 1500)
  }

  if (size === 'lg') {
    return (
      <button onClick={handleAdd} disabled={product.stock === 0}
        className="w-full font-semibold py-3 px-6 rounded-xl transition-all text-white disabled:opacity-60"
        style={product.stock === 0
          ? { background: '#e2e8f0', color: '#94a3b8' }
          : added
          ? { background: '#16a34a' }
          : { background: 'linear-gradient(135deg, #1B5E20, #388E3C)' }
        }>
        {product.stock === 0 ? 'Sem estoque' : added ? '✓ Adicionado!' : 'Adicionar ao Carrinho'}
      </button>
    )
  }

  return (
    <button onClick={handleAdd} disabled={product.stock === 0}
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all text-white"
      style={product.stock === 0
        ? { background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed' }
        : added
        ? { background: '#16a34a' }
        : { background: 'linear-gradient(135deg, #1B5E20, #388E3C)' }
      }>
      {added ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )}
    </button>
  )
}
