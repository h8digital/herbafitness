import { createClient } from '@/lib/supabase/server'
import ProductForm from '../../ProductForm'
import BundleManager from '../../BundleManager'
import VariationManager from '../../VariationManager'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Section = 'dados' | 'variacoes' | 'pacotes'

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ section?: string }>
}) {
  const { id } = await params
  const { section = 'dados' } = await searchParams
  const supabase = await createClient()

  const [
    { data: product },
    { data: categories },
    { data: bundles },
    { data: suggestions },
    { data: allProducts },
    { data: variationTypes },
    { data: settings },
  ] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').eq('active', true),
    supabase.from('product_bundles').select('*').eq('product_id', id).order('quantity'),
    supabase.from('product_suggestions').select('*, suggested_product:products!suggested_product_id(*)').eq('product_id', id),
    supabase.from('products').select('*').eq('active', true).neq('id', id),
    supabase.from('product_variation_types').select('*, options:product_variation_options(*)').eq('product_id', id).order('sort_order'),
    supabase.from('settings').select('product_image_ratio').eq('id', 'default').single(),
  ])

  if (!product) notFound()

  const imageRatio = (settings?.product_image_ratio || '4/5') as '3/4' | '4/5' | '1/1' | '4/3'

  const sections = [
    { key: 'dados',     label: 'Dados do Produto', icon: '📝', desc: 'Nome, preço, estoque, imagem' },
    { key: 'variacoes', label: 'Variações',         icon: '🎨', desc: `${(variationTypes || []).length} tipos criados`, highlight: true },
    { key: 'pacotes',   label: 'Pacotes & Combos',  icon: '📦', desc: `${(bundles || []).length} pacotes · ${(suggestions || []).length} sugestões` },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
            Editar Produto
          </h1>
          <p className="text-slate-500 text-sm">{product.name}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${product.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            {product.active ? '● Ativo' : '○ Inativo'}
          </span>
          {/* ── BOTÃO VISUALIZAR ── */}
          <Link
            href={`/shop/products/${product.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors border"
            style={{ background: '#f0faf0', color: '#1B5E20', borderColor: '#c8e6c9' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Visualizar na Loja
          </Link>
        </div>
      </div>

      {/* Navegação entre seções */}
      <div className="grid grid-cols-3 gap-3">
        {sections.map(sec => (
          <Link key={sec.key} href={`/admin/products/${id}/edit?section=${sec.key}`}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
              section === sec.key
                ? 'border-green-500 bg-green-50'
                : 'border-slate-200 bg-white hover:border-green-300'
            }`}>
            <span className="text-2xl flex-shrink-0">{sec.icon}</span>
            <div className="min-w-0">
              <p className={`font-semibold text-sm ${section === sec.key ? 'text-green-800' : 'text-slate-900'}`}>
                {sec.label}
                {sec.highlight && (variationTypes || []).length === 0 && (
                  <span className="ml-1.5 text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold">NOVO</span>
                )}
              </p>
              <p className="text-xs text-slate-400 truncate">{sec.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Conteúdo da seção selecionada */}
      {section === 'dados' && (
        <div className="max-w-2xl">
          <ProductForm product={product} categories={categories || []} imageRatio={imageRatio} />
        </div>
      )}

      {section === 'variacoes' && (
        <div className="max-w-2xl">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-blue-900 mb-2">🎨 Como usar Variações</h3>
            <ol className="space-y-1.5 text-sm text-blue-700">
              <li><strong>1.</strong> Crie um <strong>Tipo de Variação</strong> — ex: <em>Sabor</em>, <em>Tamanho</em>, <em>Cor</em></li>
              <li><strong>2.</strong> Adicione as <strong>opções</strong> desse tipo — ex: <em>Chocolate</em>, <em>Baunilha</em>, <em>Morango</em></li>
              <li><strong>3.</strong> Cada opção pode ter <strong>preço diferente</strong> e <strong>estoque próprio</strong></li>
              <li><strong>4.</strong> O cliente escolhe antes de adicionar ao carrinho</li>
            </ol>
          </div>
          <VariationManager
            productId={product.id}
            productPrice={product.price}
            variationTypes={variationTypes || []}
          />
        </div>
      )}

      {section === 'pacotes' && (
        <div className="max-w-2xl">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-orange-900 mb-2">📦 Pacotes & Combos</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-orange-700">
              <div>
                <p className="font-semibold mb-1">Pacotes de Quantidade</p>
                <p>Ex: 2 unidades por R$ 444 em vez de R$ 468. Estimula compra em maior volume.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Produtos Comprados Juntos</p>
                <p>Ex: Shake + NRG. O sistema também sugere automaticamente baseado nas vendas.</p>
              </div>
            </div>
          </div>
          <BundleManager
            product={product as any}
            bundles={bundles || []}
            suggestions={suggestions || []}
            allProducts={allProducts || []}
          />
        </div>
      )}
    </div>
  )
}
