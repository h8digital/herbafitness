import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ZipModal from '@/components/shop/ZipModal'

export default async function PublicPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  // Se logado, redireciona para área correta
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') redirect('/admin')
    redirect('/shop')
  }

  // Busca produtos — RLS agora permite visitantes verem
  let query = supabase
    .from('products')
    .select('id, name, slug, short_description, images, categories(name, id), featured, stock, compare_price')
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (params.category) query = query.eq('category_id', params.category)
  if (params.q) query = query.ilike('name', `%${params.q}%`)

  const [{ data: products }, { data: categories }] = await Promise.all([
    query,
    supabase.from('categories').select('*').eq('active', true).order('sort_order'),
  ])

  return (
    <div className="min-h-screen" style={{ background: '#f8fdf8' }}>
      <ZipModal />

      {/* Header público */}
      <header className="sticky top-0 z-40 w-full" style={{ background: '#1B5E20' }}>
        <div className="flex items-center gap-3 px-4 pt-3 pb-2 max-w-lg mx-auto">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/20">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                <ellipse cx="10" cy="10" rx="4" ry="7" fill="#A5D6A7" transform="rotate(-20 10 10)" />
                <ellipse cx="14" cy="8" rx="3.5" ry="6" fill="#C8E6C9" transform="rotate(20 14 8)" />
                <line x1="12" y1="14" x2="12" y2="22" stroke="#A5D6A7" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-black text-white text-sm tracking-wider" style={{ fontFamily: 'Arial Black, sans-serif' }}>
              HERBA<span style={{ color: '#A5D6A7' }}>FIT</span>
            </span>
          </div>

          {/* Busca */}
          <form className="flex-1" method="get">
            <div className="flex items-center bg-white rounded-xl overflow-hidden">
              <input name="q" defaultValue={params.q} placeholder="Buscar produtos..."
                className="flex-1 px-3 py-2 text-sm text-slate-800 outline-none bg-transparent" />
              <button type="submit" className="px-3 py-2" style={{ color: '#1B5E20' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          <Link href="/auth/login"
            className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
            Entrar
          </Link>
        </div>

        {/* Banner de cadastro */}
        <div className="px-4 pb-3 max-w-lg mx-auto">
          <p className="text-white/80 text-xs">
            🔒 <span className="text-white font-semibold">Cadastre-se gratuitamente</span> para ver os preços e comprar
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto pb-6">
        {/* Categorias */}
        {categories && categories.length > 0 && (
          <div className="pt-4 pb-2">
            <div className="flex gap-2 px-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              <a href="/" className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold"
                style={!params.category ? { background: '#1B5E20', color: '#fff' } : { background: '#fff', color: '#374151', border: '1px solid #e5e7eb' }}>
                Todos
              </a>
              {categories.map((cat: any) => (
                <a key={cat.id} href={`/?category=${cat.id}`}
                  className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold"
                  style={params.category === cat.id
                    ? { background: '#1B5E20', color: '#fff' }
                    : { background: '#fff', color: '#374151', border: '1px solid #e5e7eb' }}>
                  {cat.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Resultado busca */}
        {params.q && (
          <div className="px-4 pt-2 pb-1 flex items-center justify-between">
            <p className="text-sm text-slate-600"><span className="font-semibold">{products?.length || 0}</span> resultados para "{params.q}"</p>
            <a href="/" className="text-xs font-medium" style={{ color: '#1B5E20' }}>Limpar</a>
          </div>
        )}

        {/* Header */}
        {!params.q && (
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <h2 className="font-black text-slate-900 text-base" style={{ fontFamily: 'Arial Black, sans-serif' }}>
              {params.category ? categories?.find((c: any) => c.id === params.category)?.name || 'Produtos' : 'Todos os Produtos'}
            </h2>
            <span className="text-xs text-slate-400">{products?.length || 0} itens</span>
          </div>
        )}

        {/* Grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 px-4">
            {products.map((product: any) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 flex flex-col">
                <div className="aspect-square overflow-hidden bg-slate-50 relative">
                  {product.images?.[0]?.url
                    ? <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>}
                  {product.featured && (
                    <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#1B5E20' }}>Destaque</span>
                  )}
                  {product.compare_price && (
                    <span className="absolute top-2 right-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500">
                      -{Math.round(((product.compare_price - 0) / product.compare_price) * 100)}% OFF
                    </span>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  {(product.categories as any)?.name && (
                    <p className="text-[10px] font-semibold mb-1" style={{ color: '#4CAF50' }}>{(product.categories as any).name}</p>
                  )}
                  <p className="text-xs text-slate-900 font-medium leading-tight line-clamp-2 mb-3 flex-1">{product.name}</p>

                  {/* Preço bloqueado para não logados */}
                  <Link href="/auth/register"
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold transition-colors"
                    style={{ background: '#e8f5e9', color: '#1B5E20' }}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Ver preço
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-16 px-4">
            <span className="text-5xl mb-3">🔍</span>
            <p className="font-bold text-slate-700">Nenhum produto encontrado</p>
            <a href="/" className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>Ver todos</a>
          </div>
        )}

        {/* CTA fixo no fundo */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t px-4 py-3" style={{ borderColor: '#e8f5e9' }}>
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-900">Quer ver os preços?</p>
              <p className="text-[11px] text-slate-400">Cadastro gratuito e rápido</p>
            </div>
            <Link href="/auth/register"
              className="flex-shrink-0 text-white font-black text-sm px-5 py-2.5 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #1B5E20, #4CAF50)' }}>
              Cadastrar grátis →
            </Link>
            <Link href="/auth/login" className="flex-shrink-0 text-xs font-medium" style={{ color: '#1B5E20' }}>
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
