import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function OrderDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: order } = await supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(name, images))')
    .eq('id', id)
    .eq('customer_id', user!.id)
    .single()

  if (!order) notFound()

  const addr = order.shipping_address as any
  const payStatus = sp.status

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Banner de status de pagamento */}
      {payStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">🎉</div>
          <h3 className="font-bold text-green-800">Pagamento Confirmado!</h3>
          <p className="text-green-600 text-sm mt-1">Seu pedido foi recebido e está sendo processado.</p>
        </div>
      )}
      {payStatus === 'failure' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">❌</div>
          <h3 className="font-bold text-red-800">Pagamento Recusado</h3>
          <p className="text-red-600 text-sm mt-1">Tente novamente ou escolha outro método.</p>
          {order.payment_url && (
            <a href={order.payment_url} className="mt-3 inline-block bg-orange-500 text-white font-semibold py-2 px-6 rounded-xl text-sm">Tentar novamente</a>
          )}
        </div>
      )}
      {payStatus === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">⏳</div>
          <h3 className="font-bold text-yellow-800">Pagamento em Análise</h3>
          <p className="text-yellow-600 text-sm mt-1">Aguarde a confirmação do seu pagamento.</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Link href="/shop/orders" className="text-slate-400 hover:text-slate-600">←</Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>{order.order_number}</h1>
          <p className="text-sm text-slate-500">{formatDateTime(order.created_at)}</p>
        </div>
        <span className={`ml-auto px-3 py-1.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Itens */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Itens</h3>
        </div>
        {(order.items as any[])?.map((item: any) => (
          <div key={item.id} className="px-5 py-4 flex items-center gap-4 border-b border-slate-50 last:border-0">
            {item.product?.images?.[0]?.url ? (
              <img src={item.product.images[0].url} alt={item.product_name} className="w-12 h-12 rounded-xl object-cover bg-slate-100" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">📦</div>
            )}
            <div className="flex-1">
              <p className="font-medium text-slate-900 text-sm">{item.product_name}</p>
              <p className="text-xs text-slate-400">{item.quantity}x {formatCurrency(item.unit_price)}</p>
            </div>
            <p className="font-semibold text-slate-900 text-sm">{formatCurrency(item.total_price)}</p>
          </div>
        ))}
        <div className="px-5 py-4 bg-slate-50 space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          {order.discount_amount > 0 && <div className="flex justify-between text-green-600"><span>Desconto</span><span>-{formatCurrency(order.discount_amount)}</span></div>}
          <div className="flex justify-between text-slate-600"><span>Frete</span><span>{formatCurrency(order.shipping_amount)}</span></div>
          <div className="flex justify-between font-bold text-slate-900 text-base pt-1 border-t border-slate-200"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
        </div>
      </div>

      {/* Entrega */}
      {addr && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>Entrega</h3>
          <p className="text-sm text-slate-600">{addr.street}, {addr.number}{addr.complement ? `, ${addr.complement}` : ''}</p>
          <p className="text-sm text-slate-600">{addr.neighborhood} — {addr.city}/{addr.state}</p>
          {order.shipping_service_name && <p className="text-xs text-slate-400 mt-2">📦 {order.shipping_service_name} · {order.shipping_days} dias úteis</p>}
          {order.shipping_tracking && <p className="text-xs text-slate-400 mt-1">Rastreio: <span className="font-mono">{order.shipping_tracking}</span></p>}
        </div>
      )}

      {/* Pagar ainda */}
      {order.payment_url && ['pending','payment_pending'].includes(order.status) && (
        <a href={order.payment_url} target="_blank" rel="noopener noreferrer"
          className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl transition-colors">
          💳 Pagar agora
        </a>
      )}
    </div>
  )
}
