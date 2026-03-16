import { createClient } from '@/lib/supabase/server'
import StockAdjust from './StockAdjust'

export default async function StockPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, name, sku, stock, min_stock, images')
    .eq('active', true)
    .order('name')

  const { data: movements } = await supabase
    .from('stock_movements')
    .select('*, products(name), profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Gestão de Estoque</h1>
        <p className="text-slate-500 text-sm mt-1">Ajuste e monitore o estoque dos produtos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de produtos */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Produtos</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {products?.map((product: any) => (
              <div key={product.id} className="px-6 py-4 flex items-center gap-4">
                {product.images?.[0]?.url ? (
                  <img src={product.images[0].url} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">📦</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{product.name}</p>
                  {product.sku && <p className="text-xs text-slate-400">SKU: {product.sku}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`font-bold text-sm ${product.stock <= product.min_stock ? 'text-red-600' : 'text-slate-900'}`}>
                      {product.stock}
                    </p>
                    <p className="text-xs text-slate-400">mín: {product.min_stock}</p>
                  </div>
                  <StockAdjust productId={product.id} currentStock={product.stock} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Histórico */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Histórico de Movimentos</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {movements && movements.length > 0 ? movements.map((m: any) => (
              <div key={m.id} className="px-6 py-3 flex items-center gap-3">
                <span className={`text-lg ${m.type === 'in' ? '📈' : m.type === 'out' ? '📉' : '🔧'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{m.products?.name}</p>
                  <p className="text-xs text-slate-400">{m.reason || '—'}</p>
                </div>
                <span className={`font-semibold text-sm ${m.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                  {m.type === 'in' ? '+' : '-'}{Math.abs(m.quantity)}
                </span>
              </div>
            )) : (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">Nenhum movimento ainda</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
