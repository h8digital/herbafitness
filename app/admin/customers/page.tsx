import { createClient } from '@/lib/supabase/server'
import CustomerActions from './CustomerActions'
import { formatDate, USER_STATUS_LABELS, USER_STATUS_COLORS } from '@/lib/utils'

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false })

  if (params.status) query = query.eq('status', params.status)
  if (params.q) query = query.ilike('full_name', `%${params.q}%`)

  const { data: customers } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Clientes</h1>
          <p className="text-slate-500 text-sm mt-1">{customers?.length || 0} clientes cadastrados</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-3 flex-wrap">
        {[
          { label: 'Todos', value: '' },
          { label: '⏳ Pendentes', value: 'pending' },
          { label: '✅ Aprovados', value: 'approved' },
          { label: '❌ Rejeitados', value: 'rejected' },
        ].map(filter => (
          <a
            key={filter.value}
            href={`/admin/customers${filter.value ? `?status=${filter.value}` : ''}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              (params.status || '') === filter.value
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {filter.label}
          </a>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contato</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cadastro</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers && customers.length > 0 ? customers.map(customer => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{customer.full_name || '—'}</p>
                      {customer.company_name && (
                        <p className="text-xs text-slate-400">{customer.company_name}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{customer.email}</p>
                    {customer.phone && <p className="text-xs text-slate-400">{customer.phone}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${USER_STATUS_COLORS[customer.status]}`}>
                      {USER_STATUS_LABELS[customer.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDate(customer.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <CustomerActions customer={customer} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
