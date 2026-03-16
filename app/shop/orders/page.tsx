import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import Link from 'next/link'

export default async function MyOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, items:order_items(count)')
    .eq('customer_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Meus Pedidos</h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Link href={`/shop/orders/${order.id}`}
                      className="font-mono font-bold text-orange-600 hover:underline text-sm">
                      {order.order_number}
                    </Link>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {order.items?.[0]?.count || 0} item(s) · {formatDate(order.created_at)}
                  </p>
                  {order.shipping_tracking && (
                    <p className="text-xs text-slate-400 mt-1">📦 Rastreio: <span className="font-mono">{order.shipping_tracking}</span></p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                    {formatCurrency(order.total)}
                  </p>
                  <Link href={`/shop/orders/${order.id}`}
                    className="text-xs text-orange-500 hover:underline mt-1 block">
                    Ver detalhes →
                  </Link>
                </div>
              </div>
              {order.payment_url && ['pending', 'payment_pending'].includes(order.status) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <a href={order.payment_url} target="_blank" rel="noopener noreferrer"
                    className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                    💳 Pagar agora
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Nenhum pedido ainda</h2>
          <p className="text-slate-500 text-sm mb-6">Faça seu primeiro pedido!</p>
          <Link href="/shop" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors">
            Ver Produtos
          </Link>
        </div>
      )}
    </div>
  )
}
