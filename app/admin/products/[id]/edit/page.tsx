import { createClient } from '@/lib/supabase/server'
import ProductForm from '../../ProductForm'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').eq('active', true),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Editar Produto</h1>
        <p className="text-slate-500 text-sm mt-1">{product.name}</p>
      </div>
      <ProductForm product={product} categories={categories || []} />
    </div>
  )
}
