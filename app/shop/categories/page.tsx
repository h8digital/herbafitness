import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*, products(count)')
    .eq('active', true)
    .order('sort_order')

  const emojis = ['🌿', '💊', '🥤', '🍃', '💪', '🧴', '🌱', '✨', '🥗', '🫀']

  return (
    <div className="min-h-screen pb-20" style={{ background: '#f8fdf8' }}>
      <div className="px-4 py-5">
        <h2 className="text-lg font-bold text-slate-900 mb-4" style={{ fontFamily: 'Arial Black, sans-serif' }}>
          Todas as Categorias
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Opção "Todos" */}
          <Link href="/shop"
            className="flex items-center gap-3 bg-white rounded-2xl p-4 border-2 transition-all active:scale-95"
            style={{ borderColor: '#1B5E20' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: '#e8f5e9' }}>
              🛍️
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900">Todos</p>
              <p className="text-xs text-slate-400">Ver tudo</p>
            </div>
          </Link>

          {categories?.map((cat: any, i: number) => (
            <Link key={cat.id} href={`/shop?category=${cat.id}`}
              className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-100 transition-all active:scale-95 hover:border-green-300">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: '#f1f8f1' }}>
                {cat.image_url
                  ? <img src={cat.image_url} alt={cat.name} className="w-10 h-10 rounded-lg object-cover" />
                  : emojis[i % emojis.length]
                }
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 truncate">{cat.name}</p>
                <p className="text-xs text-slate-400">{cat.products?.[0]?.count || 0} produtos</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
