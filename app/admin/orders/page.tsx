import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import Link from 'next/link'
import OrderStatusSelect from './OrderStatusSelect'
import DeleteOrderRowButton from './DeleteOrderRowButton'

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })

  if (params.status) query = query.eq('status', params.status)
  if (params.q) query = query.ilike('order_number', `%${params.q}%`)

  const { data: orders } = await query

  const statusFilters = [
    { label: 'Todos', value: '' },
    { label: 'Pendentes', value: 'pending' },
    { label: 'Pag. Pendente', value: 'payment_pending' },
    { label: 'Pag. Aprovado', value: 'payment_approved' },
    { label: 'Processando', value: 'processing' },
    { label: 'Enviado', value: 'shipped' },
    { label: 'Entregue', value: 'delivered' },
    { label: 'Cancelado', value: 'cancelled' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Pedidos</h1>
        <p className="text-slate-500 text-sm mt-1">{orders?.length || 0} pedidos</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map(f => (
            <a key={f.value} href={`/admin/orders${f.value ? `?status=${f.value}` : ''}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${(params.status || '') === f.value ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {f.label}
            </a>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Pedido</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Data</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders && orders.length > 0 ? orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono font-semibold text-orange-600 hover:underline text-sm">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900">{order.profiles?.full_name || '—'}</p>
                    <p className="text-xs text-slate-400">{order.profiles?.email}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4">
                    <OrderStatusSelect order={order} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDateTime(order.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/orders/${order.id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors">
                        Ver detalhes
                      </Link>
                      <DeleteOrderRowButton orderId={order.id} orderNumber={order.order_number} status={order.status} />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">Nenhum pedido encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
