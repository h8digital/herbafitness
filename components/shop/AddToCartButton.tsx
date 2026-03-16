'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { Product } from '@/types'

export default function AddToCartButton({ product, size = 'sm' }: { product: Product; size?: 'sm' | 'lg' }) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  function handleAdd() {
    if (product.stock === 0) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  if (size === 'lg') {
    return (
      <button onClick={handleAdd} disabled={product.stock === 0}
        className={`w-full font-semibold py-3 px-6 rounded-xl transition-all ${
          product.stock === 0
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : added
            ? 'bg-green-500 text-white'
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}>
        {product.stock === 0 ? 'Sem estoque' : added ? '✓ Adicionado!' : 'Adicionar ao Carrinho'}
      </button>
    )
  }

  return (
    <button onClick={handleAdd} disabled={product.stock === 0}
      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
        product.stock === 0
          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
          : added
          ? 'bg-green-500 text-white'
          : 'bg-orange-500 hover:bg-orange-600 text-white'
      }`}>
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
