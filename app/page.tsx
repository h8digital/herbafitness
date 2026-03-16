import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PublicShopPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  // Se logado, redireciona para a área correta
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') redirect('/admin')
    else redirect('/shop')
  }

  // Busca produtos para visitantes (sem preço)
  let query = supabase
    .from('products')
    .select('id, name, slug, short_description, images, categories(name), stock')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (params.category) query = query.eq('category_id', params.category)
  if (params.q) query = query.ilike('name', `%${params.q}%`)

  const [{ data: products }, { data: categories }] = await Promise.all([
    query,
    supabase.from('categories').select('*').eq('active', true).order('sort_order'),
  ])

  return (
    <div className="min-h-screen" style={{ background: '#f9fdf9' }}>
      {/* Header público */}
      <header className="bg-white border-b sticky top-0 z-40" style={{ borderColor: '#e8f5e9' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#1B5E20' }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <ellipse cx="10" cy="10" rx="4" ry="7" fill="#4CAF50" transform="rotate(-20 10 10)" />
                  <ellipse cx="14" cy="8" rx="3.5" ry="6" fill="#66BB6A" transform="rotate(20 14 8)" />
                  <line x1="12" y1="14" x2="12" y2="22" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-black tracking-wider text-lg" style={{ color: '#1B5E20', fontFamily: 'Arial Black, sans-serif' }}>
                HERBA<span style={{ color: '#4CAF50' }}>FIT</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm font-medium px-4 py-2 rounded-xl transition-colors" style={{ color: '#1B5E20' }}>Entrar</Link>
              <Link href="/auth/register" className="text-sm font-semibold px-4 py-2 rounded-xl text-white" style={{ background: '#1B5E20' }}>Cadastrar</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="border-b py-3" style={{ background: '#e8f5e9', borderColor: '#c8e6c9' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm font-medium" style={{ color: '#1B5E20' }}>
            🔒 Cadastre-se gratuitamente para ver os preços e comprar
          </p>
          <Link href="/auth/register" className="text-sm font-bold px-4 py-1.5 rounded-xl text-white flex-shrink-0" style={{ background: '#2E7D32' }}>
            Solicitar acesso →
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Busca */}
        <form className="flex gap-3">
          <input name="q" defaultValue={params.q} placeholder="Buscar produtos..."
            className="flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none bg-white"
            style={{ borderColor: '#c8e6c9' }} />
          <button type="submit" className="text-white px-5 py-2.5 rounded-xl text-sm font-medium" style={{ background: '#1B5E20' }}>
            Buscar
          </button>
        </form>

        {/* Categorias */}
        {categories && categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <a href="/" className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={!params.category ? { background: '#1B5E20' } : { background: '#e8f5e9', color: '#2E7D32' }}>
              Todos
            </a>
            {categories.map((cat: any) => (
              <a key={cat.id} href={`/?category=${cat.id}`}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={params.category === cat.id ? { background: '#1B5E20', color: '#fff' } : { background: '#e8f5e9', color: '#2E7D32' }}>
                {cat.name}
              </a>
            ))}
          </div>
        )}

        {/* Grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <div key={product.id} className="bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-shadow group" style={{ borderColor: '#e8f5e9' }}>
                <div className="aspect-square overflow-hidden" style={{ background: '#f1f8f1' }}>
                  {product.images?.[0]?.url ? (
                    <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">🌿</div>
                  )}
                </div>
                <div className="p-4">
                  {(product.categories as any)?.name && (
                    <p className="text-xs mb-1 font-medium" style={{ color: '#4CAF50' }}>{(product.categories as any).name}</p>
                  )}
                  <h3 className="font-bold text-sm mb-3 line-clamp-2" style={{ color: '#1a3a1a' }}>{product.name}</h3>
                  {product.short_description && (
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{product.short_description}</p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <Link href="/auth/register"
                      className="inline-flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-xl"
                      style={{ color: '#2E7D32', background: '#e8f5e9' }}>
                      🔒 Ver preço
                    </Link>
                    <Link href="/auth/register"
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                      style={{ background: '#1B5E20' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌿</div>
            <p className="text-slate-500">Nenhum produto encontrado.</p>
          </div>
        )}
      </div>
    </div>
  )
}
