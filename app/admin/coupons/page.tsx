import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import CouponForm from './CouponForm'
import CouponActions from './CouponActions'

export default async function CouponsPage() {
  const supabase = await createClient()
  const { data: coupons } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Cupons de Desconto</h1>
        <p className="text-slate-500 text-sm mt-1">{coupons?.length || 0} cupons cadastrados</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CouponForm />
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Código</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Desconto</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Uso</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Validade</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons && coupons.length > 0 ? coupons.map(coupon => (
                    <tr key={coupon.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg text-sm">{coupon.code}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}%`
                          : formatCurrency(coupon.discount_value)}
                        {coupon.min_order_value > 0 && (
                          <p className="text-xs text-slate-400">Mín: {formatCurrency(coupon.min_order_value)}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {coupon.usage_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : ''}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {coupon.expires_at ? formatDate(coupon.expires_at) : 'Sem prazo'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {coupon.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <CouponActions coupon={coupon} />
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">Nenhum cupom ainda</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
