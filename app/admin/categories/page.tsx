import { createClient } from '@/lib/supabase/server'
import CategoryForm from './CategoryForm'
import CategoryActions from './CategoryActions'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*, parent:categories(name)')
    .order('sort_order')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Categorias</h1>
        <p className="text-slate-500 text-sm mt-1">{categories?.length || 0} categorias</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Formulário */}
        <div className="lg:col-span-1">
          <CategoryForm categories={categories || []} />
        </div>

        {/* Lista */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Lista de Categorias</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {categories && categories.length > 0 ? categories.map((cat: any) => (
                <div key={cat.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">📂</div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{cat.name}</p>
                      {cat.parent && <p className="text-xs text-slate-400">em {cat.parent.name}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cat.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {cat.active ? 'Ativa' : 'Inativa'}
                    </span>
                    <CategoryActions category={cat} />
                  </div>
                </div>
              )) : (
                <div className="px-6 py-12 text-center text-slate-400 text-sm">Nenhuma categoria ainda</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
