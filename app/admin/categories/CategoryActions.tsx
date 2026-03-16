'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/types'

export default function CategoryActions({ category }: { category: Category }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function toggleActive() {
    setLoading(true)
    await supabase.from('categories').update({ active: !category.active }).eq('id', category.id)
    router.refresh()
    setLoading(false)
  }

  async function deleteCategory() {
    if (!confirm(`Excluir a categoria "${category.name}"?`)) return
    setLoading(true)
    await supabase.from('categories').delete().eq('id', category.id)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      <button onClick={toggleActive} disabled={loading}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
          category.active ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' : 'bg-green-100 hover:bg-green-200 text-green-700'
        }`}>
        {category.active ? 'Desativar' : 'Ativar'}
      </button>
      <button onClick={deleteCategory} disabled={loading}
        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
        🗑️
      </button>
    </div>
  )
}
