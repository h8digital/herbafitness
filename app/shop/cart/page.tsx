'use client'

import { useCartStore, calcSubtotal, calcTotal } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import FreeShippingBar from '@/components/shop/FreeShippingBar'

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
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('settings').select('free_shipping_above').eq('id', 'default').single()
      .then(({ data }) => { if (data?.free_shipping_above) setFreeShippingThreshold(data.free_shipping_above) })
  }, [])

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
    <div className="px-4 py-4 space-y-4 max-w-2xl lg:max-w-4xl lg:mx-auto lg:px-6 lg:py-6">
      <h1 className="font-black text-lg text-slate-900" style={{ fontFamily: 'Arial Black, sans-serif' }}>
        Meu Carrinho ({items.length})
      </h1>

      {/* ── Barra de frete grátis ── */}
      {freeShippingThreshold && (
        <FreeShippingBar threshold={freeShippingThreshold} />
      )}

      {/* Itens */}
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.product.name + item.product.id} className="bg-white rounded-2xl p-3 flex gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-50">
              {item.product.images?.[0]?.url
                ? <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-contain p-1" />
                : <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 leading-tight">{item.product.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{formatCurrency(item.product.price)} × {item.quantity}</p>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => updateQuantity(item.product.id, item.product.name, item.quantity - 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold"
                  style={{ background: '#e8f5e9', color: '#1B5E20' }}>−</button>
                <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, item.product.name, item.quantity + 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold"
                  style={{ background: '#e8f5e9', color: '#1B5E20' }}>+</button>
                <button onClick={() => removeItem(item.product.id, item.product.name)}
                  className="ml-2 text-slate-300 hover:text-red-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-shrink-0">
              <p className="font-bold text-slate-900">{formatCurrency(item.product.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cupom */}
      <div className="bg-white rounded-2xl p-4">
        <p className="text-sm font-semibold text-slate-700 mb-3">Cupom de desconto</p>
        {couponCode ? (
          <div className="flex items-center gap-2">
            <span className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-green-700 bg-green-50 border border-green-200">
              ✓ {couponCode} aplicado!
            </span>
            <button onClick={removeCoupon} className="text-slate-400 hover:text-red-400 text-xs px-3 py-2">Remover</button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())}
                placeholder="CÓDIGO DO CUPOM"
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400 bg-white tracking-widest" />
              <button onClick={applyDiscount} disabled={couponLoading}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                style={{ background: '#1B5E20' }}>
                {couponLoading ? '...' : 'Aplicar'}
              </button>
            </div>
            {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
          </>
        )}
      </div>

      {/* Resumo + checkout */}
      <div className="bg-white rounded-2xl p-4 space-y-2">
        <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600"><span>Desconto ({couponCode})</span><span>-{formatCurrency(couponDiscount)}</span></div>
        )}
        <div className="flex justify-between text-sm text-slate-600">
          <span>Frete</span><span className="text-slate-400">calculado no checkout</span>
        </div>
        <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-100">
          <span>Total estimado</span><span>{formatCurrency(subtotal - couponDiscount)}</span>
        </div>
        <Link href="/shop/checkout"
          className="block w-full text-center text-white font-black py-4 rounded-xl mt-2"
          style={{ background: 'linear-gradient(135deg, #1B5E20, #4CAF50)' }}>
          Finalizar Compra →
        </Link>
      </div>
    </div>
  )
}
