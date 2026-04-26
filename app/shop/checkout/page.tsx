'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore, calcSubtotal } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'
import { ShippingOption } from '@/types'
import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4

interface Address {
  street: string; number: string; complement: string
  neighborhood: string; city: string; state: string; zip: string
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP INDICATOR
// ─────────────────────────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: Step; total: number }) {
  const steps = [
    { n: 1, label: 'Endereço' },
    { n: 2, label: 'Frete' },
    { n: 3, label: 'Revisão' },
    { n: 4, label: 'Pagamento' },
  ]
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((s, i) => {
        const done    = current > s.n
        const active  = current === s.n
        const pending = current < s.n
        return (
          <div key={s.n} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  background: done ? '#1B5E20' : active ? '#F59E0B' : '#e2e8f0',
                  color:      done || active ? '#fff' : '#94a3b8',
                }}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : s.n}
              </div>
              <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${active ? 'text-amber-600' : done ? 'text-green-700' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-12 sm:w-20 h-0.5 mx-2 mb-4 rounded-full transition-all"
                style={{ background: current > s.n ? '#1B5E20' : '#e2e8f0' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI ORDER SUMMARY (sidebar fixa)
// ─────────────────────────────────────────────────────────────────────────────
function OrderSummary({
  items, subtotal, couponCode, couponDiscount, shipping, freeShippingThreshold,
}: {
  items: any[]; subtotal: number; couponCode: string; couponDiscount: number
  shipping: ShippingOption | null; freeShippingThreshold: number | null
}) {
  const isFree = !!(freeShippingThreshold && subtotal >= freeShippingThreshold)
  const shippingCost = shipping ? (isFree ? 0 : shipping.price) : null
  const total = subtotal - couponDiscount + (shippingCost ?? 0)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-6">
      <p className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Resumo</p>
      <div className="space-y-2 mb-4 max-h-52 overflow-y-auto">
        {items.map(i => (
          <div key={i.product.id} className="flex gap-2 items-start">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex-shrink-0 overflow-hidden">
              {i.product.images?.[0]?.url
                ? <img src={i.product.images[0].url} alt={i.product.name} className="w-full h-full object-contain p-0.5" />
                : <div className="w-full h-full flex items-center justify-center text-lg">🌿</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 line-clamp-2">{i.product.name}</p>
              <p className="text-xs text-slate-400">{i.quantity}× {formatCurrency(i.product.price)}</p>
            </div>
            <p className="text-xs font-semibold text-slate-700 flex-shrink-0">{formatCurrency(i.product.price * i.quantity)}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 pt-3 space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-green-600"><span>Cupom ({couponCode})</span><span>-{formatCurrency(couponDiscount)}</span></div>
        )}
        <div className="flex justify-between text-slate-500">
          <span>Frete</span>
          <span>
            {shippingCost === null ? '—'
              : isFree ? <span className="text-green-600 font-semibold">Grátis</span>
              : formatCurrency(shippingCost)}
          </span>
        </div>
        <div className="flex justify-between font-black text-slate-900 text-base pt-1.5 border-t border-slate-100">
          <span>Total</span>
          <span style={{ color: '#1B5E20' }}>{formatCurrency(subtotal - couponDiscount + (shippingCost ?? 0))}</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()

  const items          = useCartStore(s => s.items)
  const couponCode     = useCartStore(s => s.couponCode)
  const couponDiscount = useCartStore(s => s.couponDiscount)
  const selectedShipping = useCartStore(s => s.selectedShipping)
  const setShipping    = useCartStore(s => s.setShipping)
  const clearCart      = useCartStore(s => s.clearCart)
  const subtotal       = calcSubtotal(items)

  const [step, setStep]       = useState<Step>(1)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Endereço
  const [useProfileAddr, setUseProfileAddr] = useState(true)
  const [addr, setAddr] = useState<Address>({ street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip: '' })
  const [addrErrors, setAddrErrors] = useState<Partial<Address>>({})

  // Frete
  const [shippingOptions, setShippingOptions]   = useState<ShippingOption[]>([])
  const [loadingShipping, setLoadingShipping]   = useState(false)
  const [shippingFallback, setShippingFallback] = useState(false)
  const [shippingError, setShippingError]       = useState('')
  const [freeThreshold, setFreeThreshold]       = useState<number | null>(null)

  // Cupom (etapa 3)
  const [couponInput, setCouponInput]   = useState(couponCode || '')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError]   = useState('')
  const applyCoupon = useCartStore(s => s.applyCoupon)
  const removeCoupon = useCartStore(s => s.removeCoupon)

  // Notas
  const [notes, setNotes] = useState('')

  // Pagamento
  const [placing, setPlacing]     = useState(false)
  const [placeError, setPlaceError] = useState('')

  const addrRef = useRef<Address | null>(null)

  // ── Carregar perfil e settings ──────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const [{ data: prof }, { data: settings }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('settings').select('free_shipping_above').eq('id', 'default').single(),
      ])
      setProfile(prof)
      if (settings?.free_shipping_above) setFreeThreshold(settings.free_shipping_above)
      setLoading(false)
    }
    init()
  }, [])

  // Endereço efetivo
  const effectiveAddr: Address = useProfileAddr && profile
    ? {
        street:       profile.address_street       || '',
        number:       profile.address_number        || '',
        complement:   profile.address_complement    || '',
        neighborhood: profile.address_neighborhood  || '',
        city:         profile.address_city          || '',
        state:        profile.address_state         || '',
        zip:          profile.address_zip           || '',
      }
    : addr

  useEffect(() => { addrRef.current = effectiveAddr }, [effectiveAddr])

  const isFreeShipping = !!(freeThreshold && subtotal >= freeThreshold)
  const effectiveShipping = selectedShipping
    ? { ...selectedShipping, price: isFreeShipping ? 0 : selectedShipping.price }
    : null

  // ── ETAPA 1: Validação de endereço ──────────────────────────────────────
  function validateAddr() {
    const a = effectiveAddr
    const errors: Partial<Address> = {}
    if (!a.zip)          errors.zip          = 'CEP obrigatório'
    if (!a.street)       errors.street       = 'Rua obrigatória'
    if (!a.number)       errors.number       = 'Número obrigatório'
    if (!a.neighborhood) errors.neighborhood = 'Bairro obrigatório'
    if (!a.city)         errors.city         = 'Cidade obrigatória'
    if (!a.state)        errors.state        = 'UF obrigatória'
    setAddrErrors(errors)
    return Object.keys(errors).length === 0
  }

  function goToStep2() {
    if (!validateAddr()) return
    setStep(2)
    if (shippingOptions.length === 0) calcShipping()
  }

  // ── ETAPA 2: Calcular frete ──────────────────────────────────────────────
  async function calcShipping() {
    const a = addrRef.current || effectiveAddr
    setLoadingShipping(true)
    setShippingError('')
    setShipping(null)
    try {
      const res = await fetch('/api/superfrete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: a,
          items: items.map(i => ({
            weight: i.product.weight || 0.3,
            height: i.product.height || 10,
            width:  i.product.width  || 15,
            length: i.product.length || 20,
            quantity: i.quantity,
          })),
        }),
      })
      const data = await res.json()
      if (data.options?.length) {
        setShippingOptions(data.options)
        setShippingFallback(!!data.fallback)
        if (isFreeShipping) setShipping(data.options[0])
      } else {
        setShippingError('Não foi possível calcular o frete para este CEP.')
      }
    } catch {
      setShippingError('Erro ao calcular frete. Tente novamente.')
    }
    setLoadingShipping(false)
  }

  // ── ETAPA 3: Cupom ──────────────────────────────────────────────────────
  async function handleCoupon() {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError('')
    const { data } = await supabase.from('coupons').select('*').eq('code', couponInput.toUpperCase()).eq('active', true).single()
    if (!data) { setCouponError('Cupom inválido ou expirado.'); setCouponLoading(false); return }
    if (data.min_order_value > subtotal) { setCouponError(`Pedido mínimo de ${formatCurrency(data.min_order_value)}.`); setCouponLoading(false); return }
    let discount = data.discount_type === 'percentage' ? (subtotal * data.discount_value) / 100 : data.discount_value
    if (data.max_discount) discount = Math.min(discount, data.max_discount)
    applyCoupon(data.code, discount)
    setCouponLoading(false)
  }

  // ── ETAPA 4: Finalizar pedido ────────────────────────────────────────────
  async function handlePlaceOrder() {
    if (!selectedShipping || items.length === 0) return
    setPlacing(true)
    setPlaceError('')

    const a = addrRef.current || effectiveAddr
    const shippingAmt = isFreeShipping ? 0 : selectedShipping.price
    const total = subtotal - couponDiscount + shippingAmt

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Sessão expirada.')

      let couponData: any = null
      if (couponCode) {
        const { data } = await supabase.from('coupons').select('id').eq('code', couponCode).single()
        couponData = data
      }

      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        customer_id:           user.id,
        order_number:          `PED-${Date.now()}`,
        status:                'pending',
        subtotal,
        discount_amount:       couponDiscount,
        shipping_amount:       shippingAmt,
        total,
        coupon_id:             couponData?.id   || null,
        coupon_code:           couponCode       || null,
        shipping_service:      selectedShipping.id,
        shipping_service_name: selectedShipping.name,
        shipping_days:         selectedShipping.days,
        shipping_address:      a,
        customer_notes:        notes || null,
      }).select().single()

      if (orderErr || !order) throw new Error('Erro ao registrar pedido.')

      const { error: itemsErr } = await supabase.from('order_items').insert(
        items.map(i => ({
          order_id:     order.id,
          product_id:   i.product.id,
          product_name: i.product.name,
          product_sku:  i.product.sku || null,
          quantity:     i.quantity,
          unit_price:   i.product.price,
          total_price:  i.product.price * i.quantity,
        }))
      )
      if (itemsErr) throw new Error('Erro ao registrar itens.')

      const mpRes = await fetch('/api/payment/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderId: order.id }),
      })
      const mpData = await mpRes.json()

      if (!mpRes.ok) {
        clearCart()
        router.push(`/shop/orders/${order.id}?status=payment_error`)
        return
      }

      clearCart()
      if (mpData.init_point) window.location.href = mpData.init_point
      else router.push(`/shop/orders/${order.id}`)
    } catch (err: any) {
      setPlaceError(err.message || 'Erro inesperado. Tente novamente.')
    }
    setPlacing(false)
  }

  // ── HELPERS ──────────────────────────────────────────────────────────────
  const ic = "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white transition-colors"

  function Field({ label, field, placeholder, maxLength, colSpan }: {
    label: string; field: keyof Address; placeholder?: string; maxLength?: number; colSpan?: string
  }) {
    const err = addrErrors[field]
    return (
      <div className={colSpan}>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <input
          className={`${ic} ${err ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
          value={addr[field]}
          onChange={e => { setAddr(p => ({ ...p, [field]: e.target.value })); if (err) setAddrErrors(p => ({ ...p, [field]: '' })) }}
          placeholder={placeholder}
          maxLength={maxLength}
        />
        {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
      </div>
    )
  }

  async function fetchCEP(cep: string) {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) setAddr(p => ({
        ...p,
        street:       data.logradouro || p.street,
        neighborhood: data.bairro     || p.neighborhood,
        city:         data.localidade || p.city,
        state:        data.uf         || p.state,
      }))
    } catch {}
  }

  // ── EARLY RETURNS ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: '#1B5E20', borderTopColor: 'transparent' }} />
    </div>
  )

  if (items.length === 0) return (
    <div className="text-center py-20">
      <span className="text-6xl block mb-4">🛒</span>
      <p className="text-slate-500 mb-4">Seu carrinho está vazio.</p>
      <Link href="/shop" className="text-white font-semibold px-6 py-3 rounded-xl inline-block" style={{ background: '#1B5E20' }}>
        Ver Produtos
      </Link>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="pb-16">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Arial Black, sans-serif' }}>
          Finalizar Pedido
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">Preencha as informações para concluir sua compra</p>
      </div>

      <StepIndicator current={step} total={4} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── WIZARD PRINCIPAL ── */}
        <div className="lg:col-span-2">

          {/* ══════════════════════════════════════════════════════ */}
          {/* STEP 1 — Endereço de Entrega                          */}
          {/* ══════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#FEF3C7' }}>📦</div>
                <div>
                  <h2 className="font-bold text-slate-900">Endereço de Entrega</h2>
                  <p className="text-xs text-slate-400">Onde você quer receber seu pedido?</p>
                </div>
              </div>

              {/* Usar endereço do perfil */}
              {profile?.address_street && (
                <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${useProfileAddr ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}
                  onClick={() => setUseProfileAddr(true)}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                      style={{ borderColor: useProfileAddr ? '#F59E0B' : '#cbd5e1', background: useProfileAddr ? '#F59E0B' : 'transparent' }}>
                      {useProfileAddr && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">Meu endereço cadastrado</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {profile.address_street}, {profile.address_number}
                        {profile.address_complement ? ` — ${profile.address_complement}` : ''}<br />
                        {profile.address_neighborhood} · {profile.address_city}/{profile.address_state} · CEP {profile.address_zip}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex-shrink-0">Salvo</span>
                  </div>
                </div>
              )}

              {/* Outro endereço */}
              <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${!useProfileAddr ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}
                onClick={() => setUseProfileAddr(false)}>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                    style={{ borderColor: !useProfileAddr ? '#F59E0B' : '#cbd5e1', background: !useProfileAddr ? '#F59E0B' : 'transparent' }}>
                    {!useProfileAddr && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {profile?.address_street ? 'Usar outro endereço' : 'Informar endereço de entrega'}
                  </p>
                </div>
              </div>

              {/* Formulário de endereço customizado */}
              {!useProfileAddr && (
                <div className="space-y-4 pt-1">
                  {/* CEP com busca automática */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">CEP *</label>
                    <div className="flex gap-2">
                      <input
                        className={`${ic} flex-1 ${addrErrors.zip ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                        value={addr.zip}
                        onChange={e => { setAddr(p => ({ ...p, zip: e.target.value })); setAddrErrors(p => ({ ...p, zip: '' })) }}
                        onBlur={e => fetchCEP(e.target.value)}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      <button type="button" onClick={() => fetchCEP(addr.zip)}
                        className="px-4 rounded-xl text-sm font-semibold text-white flex-shrink-0"
                        style={{ background: '#1B5E20' }}>
                        Buscar
                      </button>
                    </div>
                    {addrErrors.zip && <p className="text-xs text-red-500 mt-1">{addrErrors.zip}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Rua *"    field="street"  placeholder="Nome da rua" colSpan="col-span-2" />
                    <Field label="Número *" field="number"  placeholder="Nº" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Complemento" field="complement"   placeholder="Apto, bloco..." />
                    <Field label="Bairro *"     field="neighborhood" placeholder="Bairro" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Cidade *" field="city"  placeholder="Cidade" colSpan="col-span-2" />
                    <Field label="UF *"     field="state" placeholder="RS" maxLength={2} />
                  </div>
                </div>
              )}

              {/* Dados de contato (verificação) */}
              {profile && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Dados de Contato</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-400 text-xs">Nome</p>
                      <p className="font-medium text-slate-900">{profile.full_name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Email</p>
                      <p className="font-medium text-slate-900 truncate">{profile.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Telefone</p>
                      <p className="font-medium text-slate-900">{profile.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">CPF</p>
                      <p className="font-medium text-slate-900">{profile.cpf || '—'}</p>
                    </div>
                  </div>
                  <Link href="/shop/profile" className="text-xs text-amber-600 hover:underline mt-2 inline-block">
                    ✏️ Atualizar dados de contato
                  </Link>
                </div>
              )}

              <button onClick={goToStep2}
                className="w-full py-3.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                Continuar para Frete →
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════ */}
          {/* STEP 2 — Frete                                        */}
          {/* ══════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#ECFDF5' }}>🚚</div>
                <div>
                  <h2 className="font-bold text-slate-900">Opções de Frete</h2>
                  <p className="text-xs text-slate-400">
                    Entrega para: {effectiveAddr.city}/{effectiveAddr.state} — CEP {effectiveAddr.zip}
                  </p>
                </div>
              </div>

              {/* Frete grátis atingido */}
              {isFreeShipping && (
                <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm font-semibold text-green-700 flex items-center gap-2">
                  🎉 Frete grátis desbloqueado! O valor do frete será zerado automaticamente.
                </div>
              )}

              {shippingFallback && (
                <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-xs text-yellow-700">
                  ⚠️ Valores estimados de frete. Confirmaremos o valor exato ao processar o envio.
                </div>
              )}

              {loadingShipping ? (
                <div className="flex items-center justify-center py-10 gap-3">
                  <div className="w-6 h-6 rounded-full border-4 animate-spin" style={{ borderColor: '#1B5E20', borderTopColor: 'transparent' }} />
                  <p className="text-sm text-slate-500">Calculando opções de frete...</p>
                </div>
              ) : shippingError ? (
                <div className="text-center py-6">
                  <p className="text-sm text-red-500 mb-3">{shippingError}</p>
                  <button onClick={calcShipping} className="text-sm font-semibold text-white px-5 py-2 rounded-xl" style={{ background: '#1B5E20' }}>
                    Tentar novamente
                  </button>
                </div>
              ) : shippingOptions.length > 0 ? (
                <div className="space-y-3">
                  {shippingOptions.map(opt => {
                    const displayPrice = isFreeShipping ? 0 : opt.price
                    const isSelected   = selectedShipping?.id === opt.id
                    return (
                      <label key={opt.id}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300'
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                            style={{ borderColor: isSelected ? '#F59E0B' : '#cbd5e1', background: isSelected ? '#F59E0B' : 'transparent' }}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <input type="radio" name="shipping" className="sr-only"
                            checked={isSelected} onChange={() => setShipping({ ...opt, price: displayPrice })} />
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{opt.name}</p>
                            <p className="text-xs text-slate-400">{opt.company} · prazo de {opt.days} dias úteis</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {isFreeShipping ? (
                            <div>
                              <p className="line-through text-xs text-slate-400">{formatCurrency(opt.price)}</p>
                              <p className="font-bold text-green-600 text-sm">Grátis</p>
                            </div>
                          ) : (
                            <p className="font-bold text-slate-900">{formatCurrency(opt.price)}</p>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <button onClick={calcShipping}
                    className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ background: '#1B5E20' }}>
                    🚚 Calcular Frete
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                  ← Voltar
                </button>
                <button onClick={() => setStep(3)} disabled={!selectedShipping}
                  className="flex-1 py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: selectedShipping ? 'linear-gradient(135deg, #F59E0B, #F97316)' : '#94a3b8' }}>
                  Continuar para Revisão →
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════ */}
          {/* STEP 3 — Revisão + Cupom + Observações               */}
          {/* ══════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Revisão do endereço */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <span>📦</span> Entrega
                  </h3>
                  <button onClick={() => setStep(1)} className="text-xs text-amber-600 hover:underline font-medium">Alterar</button>
                </div>
                <p className="text-sm text-slate-700">
                  {effectiveAddr.street}, {effectiveAddr.number}
                  {effectiveAddr.complement ? ` — ${effectiveAddr.complement}` : ''}
                </p>
                <p className="text-sm text-slate-500">
                  {effectiveAddr.neighborhood} · {effectiveAddr.city}/{effectiveAddr.state} · CEP {effectiveAddr.zip}
                </p>
              </div>

              {/* Revisão do frete */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <span>🚚</span> Frete
                  </h3>
                  <button onClick={() => setStep(2)} className="text-xs text-amber-600 hover:underline font-medium">Alterar</button>
                </div>
                {selectedShipping && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{selectedShipping.name} — {selectedShipping.company}</p>
                      <p className="text-xs text-slate-400">Prazo estimado: {selectedShipping.days} dias úteis</p>
                    </div>
                    <p className="font-bold text-sm" style={{ color: isFreeShipping ? '#16a34a' : '#1e293b' }}>
                      {isFreeShipping ? 'Grátis' : formatCurrency(selectedShipping.price)}
                    </p>
                  </div>
                )}
              </div>

              {/* Cupom */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span>🎟️</span> Cupom de Desconto
                </h3>
                {couponCode ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 text-sm">
                      <span className="font-bold text-green-700">{couponCode}</span>
                      <span className="text-green-600 ml-2">— -{formatCurrency(couponDiscount)}</span>
                    </div>
                    <button onClick={() => { removeCoupon(); setCouponInput('') }}
                      className="text-xs text-red-400 hover:text-red-600 font-medium">
                      Remover
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        className={`${ic} border-slate-200 flex-1 tracking-widest`}
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleCoupon()}
                        placeholder="CÓDIGO DO CUPOM"
                      />
                      <button onClick={handleCoupon} disabled={couponLoading || !couponInput.trim()}
                        className="px-5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex-shrink-0"
                        style={{ background: '#1B5E20' }}>
                        {couponLoading ? '...' : 'Aplicar'}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
                  </>
                )}
              </div>

              {/* Observações */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span>💬</span> Observações <span className="text-slate-400 font-normal text-xs">(opcional)</span>
                </h3>
                <textarea
                  className={`${ic} border-slate-200`}
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Alguma observação para o pedido? Ex: entregar no período da tarde, portaria..."
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                  ← Voltar
                </button>
                <button onClick={() => setStep(4)}
                  className="flex-1 py-3.5 rounded-xl text-sm font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                  Ir para Pagamento →
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════ */}
          {/* STEP 4 — Pagamento + Confirmação Final                */}
          {/* ══════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Resumo completo */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span>✅</span> Confirme seu Pedido
                </h2>

                {/* Itens */}
                <div className="space-y-3 mb-4">
                  {items.map(i => (
                    <div key={i.product.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-xl bg-slate-50 flex-shrink-0 overflow-hidden">
                        {i.product.images?.[0]?.url
                          ? <img src={i.product.images[0].url} alt={i.product.name} className="w-full h-full object-contain p-1" />
                          : <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 line-clamp-2">{i.product.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{i.quantity} unidade{i.quantity !== 1 ? 's' : ''}</p>
                      </div>
                      <p className="font-bold text-slate-900 text-sm flex-shrink-0">{formatCurrency(i.product.price * i.quantity)}</p>
                    </div>
                  ))}
                </div>

                {/* Entrega + frete */}
                <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600 items-start">
                    <span>Entrega</span>
                    <span className="text-right text-xs max-w-48">
                      {effectiveAddr.street}, {effectiveAddr.number} — {effectiveAddr.city}/{effectiveAddr.state}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto ({couponCode})</span>
                      <span>-{formatCurrency(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Frete ({selectedShipping?.name})</span>
                    <span className={isFreeShipping ? 'text-green-600 font-semibold' : ''}>
                      {isFreeShipping ? 'Grátis' : formatCurrency(selectedShipping?.price || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 text-xl pt-2 border-t border-slate-100">
                    <span>Total</span>
                    <span style={{ color: '#1B5E20' }}>
                      {formatCurrency(subtotal - couponDiscount + (isFreeShipping ? 0 : (selectedShipping?.price || 0)))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pagamento */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span>💳</span> Forma de Pagamento
                </h3>
                <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-amber-400 bg-amber-50">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#009EE3' }}>
                    <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none">
                      <circle cx="24" cy="24" r="24" fill="#009EE3"/>
                      <path d="M12 24c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      <circle cx="24" cy="30" r="4" fill="white"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Mercado Pago</p>
                    <p className="text-xs text-slate-500">Cartão de crédito, débito, Pix, boleto e mais</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                  Você será redirecionado para o ambiente seguro do Mercado Pago
                </p>
              </div>

              {placeError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
                  {placeError}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                  ← Voltar
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing || !selectedShipping}
                  className="flex-1 py-4 rounded-xl font-black text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                  style={{ background: placing ? '#94a3b8' : 'linear-gradient(135deg, #F59E0B, #F97316)' }}
                >
                  {placing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Processando...
                    </>
                  ) : (
                    <>🔒 Confirmar e Pagar com Mercado Pago</>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                Ao confirmar, você concorda com os nossos termos de compra.
                Pagamento processado com segurança pelo Mercado Pago.
              </p>
            </div>
          )}
        </div>

        {/* ── SIDEBAR: Order Summary ── */}
        <div className="hidden lg:block">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            couponCode={couponCode}
            couponDiscount={couponDiscount}
            shipping={effectiveShipping}
            freeShippingThreshold={freeThreshold}
          />
        </div>
      </div>
    </div>
  )
}
