'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore, calcSubtotal } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'
import { ShippingOption } from '@/types'

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const items = useCartStore(s => s.items)
  const couponCode = useCartStore(s => s.couponCode)
  const couponDiscount = useCartStore(s => s.couponDiscount)
  const selectedShipping = useCartStore(s => s.selectedShipping)
  const setShipping = useCartStore(s => s.setShipping)
  const clearCart = useCartStore(s => s.clearCart)
  const subtotal = calcSubtotal(items)

  const [profile, setProfile] = useState<any>(null)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [useProfileAddress, setUseProfileAddress] = useState(true)
  const [customAddress, setCustomAddress] = useState({
    street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
    }
    load()
  }, [])

  const address = useProfileAddress && profile
    ? {
        street: profile.address_street || '',
        number: profile.address_number || '',
        complement: profile.address_complement || '',
        neighborhood: profile.address_neighborhood || '',
        city: profile.address_city || '',
        state: profile.address_state || '',
        zip: profile.address_zip || '',
      }
    : customAddress

  async function fetchCEP(cep: string) {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
    const data = await res.json()
    if (!data.erro) {
      setCustomAddress(prev => ({ ...prev, street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf }))
    }
  }

  async function calculateShipping() {
    if (!address.zip) return
    setLoadingShipping(true)
    try {
      const res = await fetch('/api/superfrete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, items: items.map(i => ({ weight: i.product.weight || 0.5, height: i.product.height || 10, width: i.product.width || 15, length: i.product.length || 20, quantity: i.quantity })) }),
      })
      const data = await res.json()
      setShippingOptions(data.options || [])
    } catch {
      setShippingOptions([{ id: 'default', name: 'Frete Padrão', price: 25, days: 7, company: 'Correios' }])
    }
    setLoadingShipping(false)
  }

  async function handlePlaceOrder() {
    if (!selectedShipping || items.length === 0) return
    setPlacing(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const subtotalVal = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
      const total = subtotalVal - couponDiscount + selectedShipping.price

      // Buscar cupom se aplicado
      let couponData: any = null
      if (couponCode) {
        const { data } = await supabase.from('coupons').select('id').eq('code', couponCode).single()
        couponData = data
      }

      // Criar pedido
      const { data: order, error } = await supabase.from('orders').insert({
        customer_id: user.id,
        order_number: `PED-${Date.now()}`,
        status: 'pending',
        subtotal: subtotalVal,
        discount_amount: couponDiscount,
        shipping_amount: selectedShipping.price,
        total,
        coupon_id: couponData?.id || null,
        coupon_code: couponCode,
        shipping_service: selectedShipping.id,
        shipping_service_name: selectedShipping.name,
        shipping_days: selectedShipping.days,
        shipping_address: address,
      }).select().single()

      if (error || !order) throw error

      // Inserir itens
      await supabase.from('order_items').insert(
        items.map(i => ({
          order_id: order.id,
          product_id: i.product.id,
          product_name: i.product.name,
          product_sku: i.product.sku,
          quantity: i.quantity,
          unit_price: i.product.price,
          total_price: i.product.price * i.quantity,
        }))
      )

      // Gerar preferência Mercado Pago
      const mpRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })
      const mpData = await mpRes.json()

      // Atualizar cupom
      if (couponData) {
        await supabase.from('coupons').update({ usage_count: supabase.rpc('increment', { x: 1 }) }).eq('id', couponData.id)
      }

      clearCart()

      if (mpData.init_point) {
        window.location.href = mpData.init_point
      } else {
        router.push(`/shop/orders/${order.id}`)
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao criar pedido. Tente novamente.')
    }
    setPlacing(false)
  }

  const total = subtotal - couponDiscount + (selectedShipping?.price || 0)

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Seu carrinho está vazio.</p>
        <a href="/shop" className="text-orange-500 hover:underline text-sm mt-2 block">Ver produtos</a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2 space-y-6">

          {/* Endereço */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Endereço de Entrega</h3>
            {profile?.address_street && (
              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input type="checkbox" checked={useProfileAddress} onChange={e => setUseProfileAddress(e.target.checked)}
                  className="w-4 h-4 accent-orange-500" />
                <span className="text-sm text-slate-700">
                  Usar endereço cadastrado: <strong>{profile.address_street}, {profile.address_number} — {profile.address_city}/{profile.address_state}</strong>
                </span>
              </label>
            )}

            {!useProfileAddress && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CEP</label>
                  <input className={inputClass} value={customAddress.zip}
                    onChange={e => { setCustomAddress(p => ({ ...p, zip: e.target.value })); fetchCEP(e.target.value) }}
                    placeholder="00000-000" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rua</label>
                    <input className={inputClass} value={customAddress.street} onChange={e => setCustomAddress(p => ({ ...p, street: e.target.value }))} placeholder="Rua" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Número</label>
                    <input className={inputClass} value={customAddress.number} onChange={e => setCustomAddress(p => ({ ...p, number: e.target.value }))} placeholder="Nº" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bairro</label>
                    <input className={inputClass} value={customAddress.neighborhood} onChange={e => setCustomAddress(p => ({ ...p, neighborhood: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Complemento</label>
                    <input className={inputClass} value={customAddress.complement} onChange={e => setCustomAddress(p => ({ ...p, complement: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                    <input className={inputClass} value={customAddress.city} onChange={e => setCustomAddress(p => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                    <input className={inputClass} value={customAddress.state} onChange={e => setCustomAddress(p => ({ ...p, state: e.target.value }))} maxLength={2} />
                  </div>
                </div>
              </div>
            )}

            <button onClick={calculateShipping} disabled={loadingShipping || !address.zip}
              className="mt-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-medium text-sm py-2.5 px-5 rounded-xl transition-colors">
              {loadingShipping ? 'Calculando...' : '📦 Calcular Frete'}
            </button>
          </div>

          {/* Opções de frete */}
          {shippingOptions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Opção de Frete</h3>
              <div className="space-y-2">
                {shippingOptions.map(option => (
                  <label key={option.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedShipping?.id === option.id ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="shipping" checked={selectedShipping?.id === option.id}
                        onChange={() => setShipping(option)} className="accent-orange-500" />
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{option.name}</p>
                        <p className="text-xs text-slate-400">{option.company} · {option.days} dias úteis</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">{formatCurrency(option.price)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resumo */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Resumo do Pedido</h3>
            <div className="space-y-2 text-sm mb-4">
              {items.map(i => (
                <div key={i.product.id} className="flex justify-between text-slate-600">
                  <span className="truncate mr-2">{i.quantity}x {i.product.name}</span>
                  <span className="flex-shrink-0">{formatCurrency(i.product.price * i.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-2 space-y-1">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600"><span>Desconto ({couponCode})</span><span>-{formatCurrency(couponDiscount)}</span></div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Frete</span>
                  <span>{selectedShipping ? formatCurrency(selectedShipping.price) : '—'}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-base pt-1 border-t border-slate-100">
                  <span>Total</span><span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <button onClick={handlePlaceOrder} disabled={placing || !selectedShipping}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors">
              {placing ? 'Processando...' : '🔒 Pagar com Mercado Pago'}
            </button>
            {!selectedShipping && (
              <p className="text-xs text-slate-400 text-center mt-2">Calcule o frete antes de continuar</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
