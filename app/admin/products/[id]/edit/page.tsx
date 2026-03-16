import { createClient } from '@/lib/supabase/server'
import ProductForm from '../../ProductForm'
import BundleManager from '../../BundleManager'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: product },
    { data: categories },
    { data: bundles },
    { data: suggestions },
    { data: allProducts },
  ] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').eq('active', true),
    supabase.from('product_bundles').select('*').eq('product_id', id).order('quantity'),
    supabase.from('product_suggestions')
      .select('*, suggested_product:products!suggested_product_id(*)').eq('product_id', id),
    supabase.from('products').select('*').eq('active', true).neq('id', id),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Editar Produto</h1>
        <p className="text-slate-500 text-sm mt-1">{product.name}</p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Dados do Produto</h2>
          <ProductForm product={product} categories={categories || []} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Pacotes & Sugestões</h2>
          <BundleManager
            product={product as any}
            bundles={bundles || []}
            suggestions={suggestions || []}
            allProducts={allProducts || []}
          />
        </div>
      </div>
    </div>
  )
}
