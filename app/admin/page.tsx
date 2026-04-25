import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

  const [
    { count: totalOrders },
    { count: pendingOrders },
    { data: revenueData },
    { data: monthRevenueData },
    { data: lastMonthRevenueData },
    { count: totalCustomers },
    { count: pendingCustomers },
    { count: totalProducts },
    { count: lowStock },
    { data: recentOrders },
    { data: topProducts },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['pending', 'payment_pending']),
    supabase.from('orders').select('total').eq('status', 'payment_approved'),
    supabase.from('orders').select('total').eq('status', 'payment_approved').gte('created_at', startOfMonth),
    supabase.from('orders').select('total').eq('status', 'payment_approved').gte('created_at', startOfLastMonth).lte('created_at', endOfLastMonth),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer').eq('status', 'pending'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true).filter('stock', 'lte', 5),
    supabase.from('orders').select('*, profiles(full_name, email)').order('created_at', { ascending: false }).limit(8),
    supabase.from('order_items').select('product_name, quantity').order('quantity', { ascending: false }).limit(5),
  ])

  const totalRevenue = revenueData?.reduce((s, o) => s + o.total, 0) || 0
  const monthRevenue = monthRevenueData?.reduce((s, o) => s + o.total, 0) || 0
  const lastMonthRevenue = lastMonthRevenueData?.reduce((s, o) => s + o.total, 0) || 0
  const revenueGrowth = lastMonthRevenue > 0 ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : null

  function Growth({ pct }: { pct: number | null }) {
    if (pct === null) return null
    const up = pct >= 0
    return (
      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
        {up ? '↑' : '↓'} {Math.abs(pct).toFixed(1)}%
      </span>
    )
  }

  const kpis = [
    {
      label: 'Receita do Mês',
      value: formatCurrency(monthRevenue),
      sub: 'vs mês anterior',
      badge: <Growth pct={revenueGrowth} />,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: '#10B981', bg: '#ECFDF5', href: '/admin/orders',
    },
    {
      label: 'Receita Total',
      value: formatCurrency(totalRevenue),
      sub: `${totalOrders || 0} pedidos`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: '#6366F1', bg: '#EEF2FF', href: '/admin/orders',
    },
    {
      label: 'Pedidos Pendentes',
      value: pendingOrders || 0,
      sub: 'aguardando ação',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: '#F59E0B', bg: '#FFFBEB', href: '/admin/orders',
      alert: (pendingOrders || 0) > 0,
    },
    {
      label: 'Clientes',
      value: totalCustomers || 0,
      sub: `${pendingCustomers || 0} aguardando aprovação`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: '#8B5CF6', bg: '#F5F3FF', href: '/admin/customers',
      alert: (pendingCustomers || 0) > 0,
    },
    {
      label: 'Produtos Ativos',
      value: totalProducts || 0,
      sub: `${lowStock || 0} com estoque baixo`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      color: '#EC4899', bg: '#FDF2F8', href: '/admin/products',
      alert: (lowStock || 0) > 0,
    },
  ]

  const quickActions = [
    { label: 'Novo Produto', icon: '➕', href: '/admin/products/new', color: '#1B5E20', bg: '#f0faf0' },
    { label: 'Aprovar Clientes', icon: '✅', href: '/admin/customers?filter=pending', color: '#7C3AED', bg: '#f5f3ff' },
    { label: 'Importar Preços', icon: '📄', href: '/admin/import', color: '#0369A1', bg: '#eff6ff' },
    { label: 'Ver Estoque', icon: '📦', href: '/admin/stock', color: '#B45309', bg: '#fffbeb' },
    { label: 'Cupons', icon: '🎟️', href: '/admin/coupons', color: '#BE185D', bg: '#fdf2f8' },
    { label: 'Configurações', icon: '⚙️', href: '/admin/settings', color: '#374151', bg: '#f9fafb' },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link href="/admin/orders"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#1B5E20' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Ver Pedidos
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <Link key={i} href={kpi.href}
            className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 hover:shadow-md transition-all hover:-translate-y-0.5 relative overflow-hidden group">
            {kpi.alert && (
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            )}
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: kpi.bg, color: kpi.color }}>
                {kpi.icon}
              </div>
              {kpi.badge}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{kpi.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Ações rápidas */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Ações Rápidas</h2>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((a, i) => (
            <Link key={i} href={a.href}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-all hover:-translate-y-0.5 text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: a.bg }}>
                {a.icon}
              </div>
              <span className="text-xs font-medium text-slate-700 leading-tight">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Grid: pedidos recentes + mais vendidos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Pedidos recentes */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Pedidos Recentes</h2>
            <Link href="/admin/orders" className="text-xs font-medium hover:underline" style={{ color: '#1B5E20' }}>
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentOrders && recentOrders.length > 0 ? recentOrders.map((order: any) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                  {((order.profiles as any)?.full_name || 'C').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{(order.profiles as any)?.full_name || 'Cliente'}</p>
                  <p className="text-xs text-slate-400">{order.order_number} · {formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(order.total)}</span>
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )) : (
              <div className="px-6 py-12 text-center text-slate-400 text-sm">Nenhum pedido ainda</div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Alertas */}
          {((pendingCustomers || 0) > 0 || (lowStock || 0) > 0) && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                ⚠️ Atenção necessária
              </h3>
              <div className="space-y-2">
                {(pendingCustomers || 0) > 0 && (
                  <Link href="/admin/customers?filter=pending"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-orange-50 transition-colors group">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-400" />
                      <span className="text-sm text-slate-700">{pendingCustomers} cliente(s) aguardando</span>
                    </div>
                    <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
                {(lowStock || 0) > 0 && (
                  <Link href="/admin/stock"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-red-50 transition-colors group">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-sm text-slate-700">{lowStock} produto(s) com estoque baixo</span>
                    </div>
                    <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Mais vendidos */}
          {topProducts && topProducts.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                🔥 Mais Vendidos
              </h3>
              <div className="space-y-2">
                {topProducts.map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{p.product_name}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 flex-shrink-0">{p.quantity} un.</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Link rápido configurações */}
          <Link href="/admin/settings"
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700">Configurações</p>
              <p className="text-xs text-slate-400">Loja, frete, redes sociais</p>
            </div>
            <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
