'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'

export default function ProductActions({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function toggleActive() {
    setLoading(true)
    await supabase.from('products').update({ active: !product.active }).eq('id', product.id)
    router.refresh()
    setLoading(false)
  }

  async function deleteProduct() {
    if (!confirm(`Excluir o produto "${product.name}"?`)) return
    setLoading(true)
    await supabase.from('products').delete().eq('id', product.id)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/products/${product.id}/edit`}
        className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-medium transition-colors"
      >
        ✏️ Editar
      </Link>
      <button
        onClick={toggleActive}
        disabled={loading}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
          product.active
            ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
            : 'bg-green-100 hover:bg-green-200 text-green-700'
        }`}
      >
        {product.active ? '🔴 Desativar' : '🟢 Ativar'}
      </button>
      <button
        onClick={deleteProduct}
        disabled={loading}
        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
      >
        🗑️
      </button>
    </div>
  )
}
