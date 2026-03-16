'use client'

import { useCartStore, calcSubtotal, calcTotal } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CartPage() {
  const items = useCartStore(s => s.items)
  const couponCode = useCartStore(s => s.couponCode)
  const couponDiscount = useCartStore(s => s.couponDiscount)
  const selectedShipping = useCartStore(s => s.selectedShipping)
  const removeItem = useCartStore(s => s.removeItem)
  const updateQuantity = useCartStore(s => s.updateQuantity)
  const applyCoupon = useCartStore(s => s.applyCoupon)
  const removeCoupon = useCartStore(s => s.removeCoupon)

  const subtotal = calcSubtotal(items)
  const total = calcTotal(items, couponDiscount, selectedShipping?.price || 0)

  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const supabase = createClient()

  async function applyDiscount() {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError('')
    const { data } = await supabase.from('coupons').select('*').eq('code', couponInput.toUpperCase()).eq('active', true).single()
    if (!data) { setCouponError('Cupom inválido ou expirado.'); setCouponLoading(false); return }
    if (data.min_order_value > subtotal) { setCouponError(`Pedido mínimo de ${formatCurrency(data.min_order_value)}`); setCouponLoading(false); return }
    let discount = data.discount_type === 'percentage' ? (subtotal * data.discount_value) / 100 : data.discount_value
    if (data.max_discount) discount = Math.min(discount, data.max_discount)
    applyCoupon(data.code, discount)
    setCouponLoading(false)
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <span className="text-6xl mb-4">🛒</span>
        <h2 className="font-black text-xl text-slate-900 mb-2" style={{ fontFamily: 'Arial Black, sans-serif' }}>Carrinho vazio</h2>
        <p className="text-slate-500 text-sm mb-6 text-center">Adicione produtos para continuar</p>
        <Link href="/shop" className="bg-green-700 text-white font-bold px-8 py-3 rounded-xl text-sm">Ver Produtos</Link>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <h1 className="font-black text-lg text-slate-900" style={{ fontFamily: 'Arial Black, sans-serif' }}>
        Meu Carrinho ({items.length})
      </h1>

      {/* Itens */}
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.product.name + item.product.id} className="bg-white rounded-2xl p-3 flex gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-50">
              {item.product.images?.[0]?.url
                ? <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 line-clamp-2">{item.product.name}</p>
              <p className="font-black text-sm mt-1" style={{ color: '#1B5E20' }}>{formatCurrency(item.product.price)} cada</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center rounded-xl overflow-hidden border border-slate-200">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-8 h-7 flex items-center justify-center text-slate-600 font-bold text-lg">−</button>
                  <span className="w-7 h-7 flex items-center justify-center text-sm font-bold text-slate-900">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-8 h-7 flex items-center justify-center text-slate-600 font-bold text-lg">+</button>
                </div>
                <button onClick={() => removeItem(item.product.id)} className="text-red-400 text-xs font-medium">Remover</button>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="font-black text-sm" style={{ color: '#1B5E20' }}>{formatCurrency(item.product.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cupom */}
      <div className="bg-white rounded-2xl p-4">
        <p className="font-bold text-sm text-slate-900 mb-3">🎟️ Cupom de desconto</p>
        {couponCode ? (
          <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3 border border-green-200">
            <div>
              <p className="font-mono font-bold text-green-800 text-sm">{couponCode}</p>
              <p className="text-xs text-green-600 mt-0.5">-{formatCurrency(couponDiscount)}</p>
            </div>
            <button onClick={removeCoupon} className="text-red-400 font-bold text-lg">✕</button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input value={couponInput} onChange={e => setCouponInput(e.target.value)}
                placeholder="Digite o código"
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-green-500" />
              <button onClick={applyDiscount} disabled={couponLoading}
                className="text-white font-bold px-4 py-2.5 rounded-xl text-sm disabled:opacity-60"
                style={{ background: '#1B5E20' }}>
                Aplicar
              </button>
            </div>
            {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
          </>
        )}
      </div>

      {/* Resumo */}
      <div className="bg-white rounded-2xl p-4 space-y-2">
        <h3 className="font-bold text-sm text-slate-900 mb-3">Resumo do Pedido</h3>
        {items.map(item => (
          <div key={item.product.name + item.product.id} className="flex justify-between text-xs text-slate-500">
            <span className="truncate mr-2">{item.quantity}x {item.product.name}</span>
            <span className="flex-shrink-0 font-medium">{formatCurrency(item.product.price * item.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-slate-100 pt-2 mt-2 space-y-1.5">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span><span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Desconto ({couponCode})</span><span>-{formatCurrency(couponDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-slate-600">
            <span>Frete</span>
            <span>{selectedShipping ? formatCurrency(selectedShipping.price) : 'Calculado no checkout'}</span>
          </div>
          <div className="flex justify-between font-black text-slate-900 text-base pt-1.5 border-t border-slate-200">
            <span>Total</span>
            <span style={{ color: '#1B5E20' }}>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <Link href="/shop/checkout"
        className="flex items-center justify-center w-full text-white font-black py-4 rounded-2xl text-sm"
        style={{ background: 'linear-gradient(135deg, #1B5E20, #4CAF50)' }}>
        Ir para o Checkout →
      </Link>
    </div>
  )
}
