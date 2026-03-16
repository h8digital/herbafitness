import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import Link from 'next/link'

export default async function MyOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: orders } = await supabase
    .from('orders').select('*, items:order_items(count)')
    .eq('customer_id', user!.id).order('created_at', { ascending: false })

  return (
    <div className="px-4 py-4">
      <h1 className="font-black text-lg text-slate-900 mb-4" style={{ fontFamily: 'Arial Black, sans-serif' }}>
        Meus Pedidos
      </h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <Link key={order.id} href={`/shop/orders/${order.id}`}
              className="block bg-white rounded-2xl p-4 border border-slate-100 active:scale-[0.98] transition-transform">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono font-bold text-sm text-slate-900">{order.order_number}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">{order.items?.[0]?.count || 0} item(s)</p>
                <p className="font-black text-base" style={{ color: '#1B5E20' }}>{formatCurrency(order.total)}</p>
              </div>
              {order.shipping_tracking && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-400">📦 Rastreio: <span className="font-mono font-medium text-slate-600">{order.shipping_tracking}</span></p>
                </div>
              )}
              {order.payment_url && ['pending','payment_pending'].includes(order.status) && (
                <div className="mt-3">
                  <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-xl">
                    💳 Pagamento pendente — toque para pagar
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="text-5xl mb-3">📦</span>
          <p className="font-bold text-slate-700">Nenhum pedido ainda</p>
          <p className="text-sm text-slate-400 mt-1 mb-5">Faça seu primeiro pedido!</p>
          <Link href="/shop" className="bg-green-700 text-white font-bold px-8 py-3 rounded-xl text-sm">
            Ver Produtos
          </Link>
        </div>
      )}
    </div>
  )
}
