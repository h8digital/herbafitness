import { createClient } from '@/lib/supabase/server'
import ProductForm from '../ProductForm'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').eq('active', true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Novo Produto</h1>
        <p className="text-slate-500 text-sm mt-1">Preencha os dados do produto</p>
      </div>
      <ProductForm categories={categories || []} />
    </div>
  )
}
