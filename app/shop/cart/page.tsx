'use client'

import { useCartStore } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, total, couponCode, couponDiscount, selectedShipping, applyCoupon, removeCoupon } = useCartStore()
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const supabase = createClient()

  async function applyDiscount() {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError('')

    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponInput.toUpperCase())
      .eq('active', true)
      .single()

    if (!data) {
      setCouponError('Cupom inválido ou expirado.')
      setCouponLoading(false)
      return
    }

    if (data.min_order_value > subtotal) {
      setCouponError(`Pedido mínimo de ${formatCurrency(data.min_order_value)} para este cupom.`)
      setCouponLoading(false)
      return
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError('Este cupom expirou.')
      setCouponLoading(false)
      return
    }

    if (data.usage_limit && data.usage_count >= data.usage_limit) {
      setCouponError('Este cupom atingiu o limite de uso.')
      setCouponLoading(false)
      return
    }

    let discount = data.discount_type === 'percentage'
      ? (subtotal * data.discount_value) / 100
      : data.discount_value

    if (data.max_discount) discount = Math.min(discount, data.max_discount)

    applyCoupon(data.code, discount)
    setCouponLoading(false)
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>Carrinho vazio</h2>
        <p className="text-slate-500 mb-6">Adicione produtos para continuar.</p>
        <Link href="/shop" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors">
          Ver Produtos
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Carrinho</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Itens */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.product.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4">
              {item.product.images?.[0]?.url ? (
                <img src={item.product.images[0].url} alt={item.product.name}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-3xl flex-shrink-0">📦</div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm mb-1 truncate" style={{ fontFamily: 'var(--font-display)' }}>
                  {item.product.name}
                </h3>
                <p className="text-orange-600 font-bold text-sm">{formatCurrency(item.product.price)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-1.5">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="text-slate-600 hover:text-slate-900 font-bold w-5 text-center">−</button>
                    <span className="text-sm font-semibold text-slate-900 w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, Math.min(item.quantity + 1, item.product.stock))}
                      className="text-slate-600 hover:text-slate-900 font-bold w-5 text-center">+</button>
                  </div>
                  <button onClick={() => removeItem(item.product.id)} className="text-red-400 hover:text-red-600 text-sm transition-colors">
                    Remover
                  </button>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                  {formatCurrency(item.product.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div className="space-y-4">
          {/* Cupom */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>Cupom de Desconto</h3>
            {couponCode ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <div>
                  <p className="font-mono font-semibold text-green-800 text-sm">{couponCode}</p>
                  <p className="text-xs text-green-600">-{formatCurrency(couponDiscount)}</p>
                </div>
                <button onClick={removeCoupon} className="text-red-400 hover:text-red-600 text-sm">✕</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  placeholder="CÓDIGO"
                  className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button onClick={applyDiscount} disabled={couponLoading}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
                  Aplicar
                </button>
              </div>
            )}
            {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
          </div>

          {/* Total */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Resumo do Pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600"><span>Desconto</span><span>-{formatCurrency(couponDiscount)}</span></div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Frete</span>
                <span>{selectedShipping ? formatCurrency(selectedShipping.price) : 'Calculado no checkout'}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100 text-base">
                <span>Total</span><span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Link href="/shop/checkout"
              className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors mt-4">
              Finalizar Compra →
            </Link>
            <Link href="/shop" className="block w-full text-center text-sm text-slate-500 hover:text-slate-700 transition-colors">
              ← Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
