'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCartStore, calcSubtotal, calcItemCount } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import FreeShippingBar from './FreeShippingBar'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore(s => s.items)
  const couponDiscount = useCartStore(s => s.couponDiscount)
  const removeItem = useCartStore(s => s.removeItem)
  const updateQuantity = useCartStore(s => s.updateQuantity)
  const itemCount = calcItemCount(items)
  const subtotal = calcSubtotal(items)

  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('settings')
      .select('free_shipping_above')
      .eq('id', 'default')
      .single()
      .then(({ data }) => {
        if (data?.free_shipping_above) setFreeShippingThreshold(data.free_shipping_above)
      })
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl"
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#fff',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#e8f5e9' }}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" style={{ color: '#1B5E20' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="font-bold text-lg" style={{ color: '#1B5E20', fontFamily: 'Arial Black, sans-serif' }}>Carrinho</h2>
            {itemCount > 0 && (
              <span className="text-white text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#4CAF50' }}>{itemCount}</span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:opacity-70"
            style={{ background: '#f1f8f1', color: '#1B5E20' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Barra frete grátis */}
        {freeShippingThreshold && items.length > 0 && (
          <div className="pt-3">
            <FreeShippingBar threshold={freeShippingThreshold} />
          </div>
        )}

        {/* Itens */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <p className="font-semibold text-slate-700 mb-1">Carrinho vazio</p>
              <p className="text-sm text-slate-400 mb-6">Adicione produtos para continuar</p>
              <button onClick={onClose} className="text-white font-semibold px-6 py-2.5 rounded-xl text-sm" style={{ background: '#1B5E20' }}>Ver Produtos</button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.product.name + item.product.id} className="flex gap-3 p-3 rounded-2xl border" style={{ borderColor: '#e8f5e9' }}>
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ background: '#f1f8f1' }}>
                    {item.product.images?.[0]?.url
                      ? <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-contain p-1" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 line-clamp-2 leading-tight">{item.product.name}</p>
                    <p className="text-sm font-bold mt-1" style={{ color: '#1B5E20' }}>{formatCurrency(item.product.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-sm"
                        style={{ background: '#e8f5e9', color: '#1B5E20' }}>
                        −
                      </button>
                      <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-sm"
                        style={{ background: '#e8f5e9', color: '#1B5E20' }}>
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="ml-auto text-slate-300 hover:text-red-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(item.product.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-6 py-4 space-y-3" style={{ borderColor: '#e8f5e9' }}>
            {couponDiscount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-600">Desconto aplicado</span>
                <span className="text-green-600 font-bold">-{formatCurrency(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Subtotal</span>
              <span className="font-bold text-lg" style={{ color: '#1B5E20' }}>{formatCurrency(subtotal)}</span>
            </div>
            <p className="text-xs text-slate-400">Frete calculado no checkout</p>
            <Link href="/shop/checkout" onClick={onClose}
              className="block w-full text-center text-white font-bold py-3.5 rounded-xl text-sm"
              style={{ background: 'linear-gradient(135deg, #1B5E20, #388E3C)' }}>
              Finalizar Compra →
            </Link>
            <Link href="/shop/cart" onClick={onClose}
              className="block w-full text-center font-semibold py-2.5 rounded-xl text-sm"
              style={{ color: '#2E7D32', background: '#e8f5e9' }}>
              Ver carrinho completo
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
