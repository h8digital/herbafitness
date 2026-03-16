import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Buscar estatísticas em paralelo
  const [
    { count: totalOrders },
    { count: pendingOrders },
    { data: revenueData },
    { count: totalCustomers },
    { count: pendingCustomers },
    { count: totalProducts },
    { data: lowStockData },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('total').eq('status', 'payment_approved'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer').eq('status', 'pending'),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('id').filter('stock', 'lte', 'min_stock'),
    supabase.from('orders').select('*, profiles(full_name, email)').order('created_at', { ascending: false }).limit(5),
  ])

  const totalRevenue = revenueData?.reduce((sum, o) => sum + o.total, 0) || 0

  const stats = [
    { label: 'Total de Pedidos', value: totalOrders || 0, icon: '📦', color: 'bg-blue-50 text-blue-700', border: 'border-blue-200' },
    { label: 'Pedidos Pendentes', value: pendingOrders || 0, icon: '⏳', color: 'bg-yellow-50 text-yellow-700', border: 'border-yellow-200' },
    { label: 'Receita Total', value: formatCurrency(totalRevenue), icon: '💰', color: 'bg-green-50 text-green-700', border: 'border-green-200' },
    { label: 'Clientes', value: totalCustomers || 0, icon: '👥', color: 'bg-purple-50 text-purple-700', border: 'border-purple-200' },
    { label: 'Aprovações Pendentes', value: pendingCustomers || 0, icon: '✅', color: 'bg-orange-50 text-orange-700', border: 'border-orange-200' },
    { label: 'Produtos', value: totalProducts || 0, icon: '🏷️', color: 'bg-indigo-50 text-indigo-700', border: 'border-indigo-200' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white rounded-2xl border ${stat.border} p-5`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color.split(' ')[1]}`}
                  style={{ fontFamily: 'var(--font-display)' }}>
                  {stat.value}
                </p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pedidos Recentes */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Pedidos Recentes</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {recentOrders && recentOrders.length > 0 ? recentOrders.map((order: any) => (
            <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-medium text-slate-900 text-sm">{order.order_number}</p>
                <p className="text-xs text-slate-400 mt-0.5">{(order.profiles as any)?.full_name || 'Cliente'}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </span>
                <p className="text-sm font-semibold text-slate-900 mt-1">{formatCurrency(order.total)}</p>
              </div>
            </div>
          )) : (
            <div className="px-6 py-8 text-center text-slate-400 text-sm">Nenhum pedido ainda</div>
          )}
        </div>
      </div>

      {/* Estoque Baixo */}
      {lowStockData && lowStockData.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
          <h3 className="font-semibold text-orange-800 mb-2">⚠️ Estoque Baixo</h3>
          <p className="text-sm text-orange-700">{lowStockData.length} produto(s) com estoque baixo. <a href="/admin/products?filter=low_stock" className="underline">Ver produtos</a></p>
        </div>
      )}
    </div>
  )
}
