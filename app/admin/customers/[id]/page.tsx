import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate, formatDateTime, formatCurrency, USER_STATUS_COLORS, USER_STATUS_LABELS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import Link from 'next/link'
import CustomerStatusActions from './CustomerStatusActions'

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: customer }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('orders')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!customer) notFound()

  const totalSpent = orders?.filter(o => ['payment_approved','processing','shipped','delivered'].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
            {customer.full_name || 'Sem nome'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{customer.email}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${USER_STATUS_COLORS[customer.status]}`}>
          {USER_STATUS_LABELS[customer.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">

          {/* Dados pessoais */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Dados Pessoais
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nome Completo" value={customer.full_name} />
              <Field label="Email" value={customer.email} />
              <Field label="Telefone" value={customer.phone} />
              <Field label="CPF" value={customer.cpf} />
              <Field label="CNPJ" value={customer.cnpj} />
              <Field label="Razão Social" value={customer.company_name} />
              <Field label="Cadastro em" value={formatDateTime(customer.created_at)} />
              <Field label="Última atualização" value={formatDateTime(customer.updated_at)} />
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Endereço Principal
            </h3>
            {customer.address_street ? (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Rua" value={`${customer.address_street}${customer.address_number ? `, ${customer.address_number}` : ''}`} />
                <Field label="Complemento" value={customer.address_complement} />
                <Field label="Bairro" value={customer.address_neighborhood} />
                <Field label="Cidade / Estado" value={customer.address_city && customer.address_state ? `${customer.address_city} — ${customer.address_state}` : null} />
                <Field label="CEP" value={customer.address_zip} />
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Endereço não cadastrado</p>
            )}
          </div>

          {/* Pedidos */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                Pedidos ({orders?.length || 0})
              </h3>
              <span className="text-sm text-slate-500">
                Total gasto: <strong className="text-slate-900">{formatCurrency(totalSpent)}</strong>
              </span>
            </div>
            {orders && orders.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {orders.map(order => (
                  <Link key={order.id} href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-mono font-semibold text-sm text-orange-600">{order.order_number}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                      <p className="font-semibold text-slate-900 text-sm mt-1">{formatCurrency(order.total)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">
                Nenhum pedido ainda
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Ações */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Ações
            </h3>
            <CustomerStatusActions customer={customer} />
          </div>

          {/* Resumo */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Resumo</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total de pedidos</span>
                <span className="font-semibold text-slate-900">{orders?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total gasto</span>
                <span className="font-semibold text-slate-900">{formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Ticket médio</span>
                <span className="font-semibold text-slate-900">
                  {orders && orders.length > 0 ? formatCurrency(totalSpent / orders.length) : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Cliente desde</span>
                <span className="font-semibold text-slate-900">{formatDate(customer.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value || <span className="text-slate-300">—</span>}</p>
    </div>
  )
}
