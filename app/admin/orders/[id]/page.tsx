import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { notFound } from 'next/navigation'
import OrderStatusSelect from '../OrderStatusSelect'
import DeleteOrderButton from './DeleteOrderButton'
import AdminNotes from './AdminNotes'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, profiles(full_name, email, phone, cpf), items:order_items(*, product:products(name, images))')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const addr = order.shipping_address as any

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
            Pedido {order.order_number}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusSelect order={order as any} />
          <DeleteOrderButton order={order as any} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Itens */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Itens do Pedido</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {(order.items as any[])?.map((item: any) => (
                <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                  {item.product?.images?.[0]?.url ? (
                    <img src={item.product.images[0].url} alt={item.product_name} className="w-14 h-14 rounded-xl object-cover bg-slate-100" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xl">📦</div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">{item.product_name}</p>
                    {item.product_sku && <p className="text-xs text-slate-400">SKU: {item.product_sku}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">{item.quantity}x {formatCurrency(item.unit_price)}</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(item.total_price)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto {order.coupon_code && `(${order.coupon_code})`}</span>
                  <span>-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-600">
                <span>Frete {order.shipping_service_name && `(${order.shipping_service_name})`}</span>
                <span>{formatCurrency(order.shipping_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span><span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Notas admin */}
          <AdminNotes orderId={order.id} initialNotes={order.admin_notes} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cliente */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Cliente</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-slate-900">{(order.profiles as any)?.full_name}</p>
              <p className="text-slate-500">{(order.profiles as any)?.email}</p>
              {(order.profiles as any)?.phone && <p className="text-slate-500">{(order.profiles as any).phone}</p>}
            </div>
          </div>

          {/* Endereço */}
          {addr && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Endereço de Entrega</h3>
              <div className="text-sm text-slate-600 space-y-1">
                <p>{addr.street}, {addr.number}{addr.complement ? `, ${addr.complement}` : ''}</p>
                <p>{addr.neighborhood}</p>
                <p>{addr.city} - {addr.state}</p>
                <p>CEP: {addr.zip}</p>
              </div>
            </div>
          )}

          {/* Pagamento */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Pagamento</h3>
            <div className="text-sm space-y-2">
              {order.payment_id && <p className="text-slate-500">ID: <span className="font-mono text-slate-900">{order.payment_id}</span></p>}
              {order.payment_method && <p className="text-slate-500">Método: <span className="text-slate-900">{order.payment_method}</span></p>}
              {order.payment_status && (
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.payment_status] || 'bg-gray-100 text-gray-600'}`}>
                  {ORDER_STATUS_LABELS[order.payment_status] || order.payment_status}
                </span>
              )}
            </div>
          </div>

          {/* Rastreio */}
          {order.shipping_tracking && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Rastreamento</h3>
              <p className="font-mono text-sm text-slate-900">{order.shipping_tracking}</p>
              {order.shipping_label_url && (
                <a href={order.shipping_label_url} target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-block bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                  📄 Etiqueta de Envio
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
