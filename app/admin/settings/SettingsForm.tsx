'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Settings {
  id: string
  store_name: string | null
  store_email: string | null
  store_phone: string | null
  store_logo_url: string | null
  store_description: string | null
  herbalife_discount: string | null
  store_zip: string | null
  store_street: string | null
  store_city: string | null
  store_state: string | null
  free_shipping_above: number | null
  mercadopago_enabled: boolean | null
}

export default function SettingsForm({ settings }: { settings: Settings | null }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    store_name: settings?.store_name || '',
    store_email: settings?.store_email || '',
    store_phone: settings?.store_phone || '',
    store_logo_url: settings?.store_logo_url || '',
    store_description: settings?.store_description || '',
    herbalife_discount: settings?.herbalife_discount || '50',
    store_zip: settings?.store_zip || '',
    store_street: settings?.store_street || '',
    store_city: settings?.store_city || '',
    store_state: settings?.store_state || '',
    free_shipping_above: settings?.free_shipping_above?.toString() || '',
    mercadopago_enabled: settings?.mercadopago_enabled ?? true,
  })

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await supabase.from('settings').upsert({
      id: 'default',
      store_name: form.store_name || null,
      store_email: form.store_email || null,
      store_phone: form.store_phone || null,
      store_logo_url: form.store_logo_url || null,
      store_description: form.store_description || null,
      herbalife_discount: form.herbalife_discount,
      store_zip: form.store_zip || null,
      store_street: form.store_street || null,
      store_city: form.store_city || null,
      store_state: form.store_state || null,
      free_shipping_above: form.free_shipping_above ? parseFloat(form.free_shipping_above) : null,
      mercadopago_enabled: form.mercadopago_enabled,
    })

    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    router.refresh()
    setLoading(false)
  }

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"

  const discountOptions = [
    { value: '25', label: '25% — Consultor Inicial (0 a 499 PV)' },
    { value: '35', label: '35% — Consultor Sênior (500 a 1.999 PV)' },
    { value: '42', label: '42% — Consultor Sênior (2.000 a 3.999 PV)' },
    { value: '50', label: '50% — Supervisor (Acima de 4.000 PV)' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Dados da Loja */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🏪</span>
          <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Dados da Loja</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nome da Loja</label>
            <input className={inputClass} value={form.store_name} onChange={e => set('store_name', e.target.value)} placeholder="Herbafit" />
          </div>
          <div>
            <label className={labelClass}>Email de Contato</label>
            <input type="email" className={inputClass} value={form.store_email} onChange={e => set('store_email', e.target.value)} placeholder="contato@sualooja.com.br" />
          </div>
          <div>
            <label className={labelClass}>Telefone / WhatsApp</label>
            <input className={inputClass} value={form.store_phone} onChange={e => set('store_phone', e.target.value)} placeholder="(51) 99999-9999" />
          </div>
          <div>
            <label className={labelClass}>URL da Logo</label>
            <input className={inputClass} value={form.store_logo_url} onChange={e => set('store_logo_url', e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <div>
          <label className={labelClass}>Descrição da Loja</label>
          <textarea className={inputClass} value={form.store_description} onChange={e => set('store_description', e.target.value)} rows={2} placeholder="Breve descrição da sua loja..." />
        </div>
      </div>

      {/* Configuração Herbalife */}
      <div className="bg-white rounded-2xl border-2 p-6 space-y-4" style={{ borderColor: '#c8e6c9' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🌿</span>
          <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Configuração Herbalife</h3>
        </div>

        <div className="rounded-xl p-4" style={{ background: '#f1f8f1' }}>
          <p className="text-sm font-medium mb-1" style={{ color: '#1B5E20' }}>Qual é o seu desconto atual na Herbalife?</p>
          <p className="text-xs text-slate-500">
            Isso define qual coluna de preço será usada como <strong>seu custo</strong> ao importar a lista de preços.
            O preço de venda sempre será o Preço Sugerido ao Consumidor.
          </p>
        </div>

        <div className="space-y-2">
          {discountOptions.map(opt => (
            <label key={opt.value}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.herbalife_discount === opt.value ? 'border-green-500' : 'border-slate-200 hover:border-slate-300'}`}
              style={form.herbalife_discount === opt.value ? { background: '#f1f8f1' } : {}}>
              <input
                type="radio"
                name="herbalife_discount"
                value={opt.value}
                checked={form.herbalife_discount === opt.value}
                onChange={() => set('herbalife_discount', opt.value)}
                className="accent-green-600"
              />
              <div className="flex-1">
                <span className="font-semibold text-sm" style={{ color: form.herbalife_discount === opt.value ? '#1B5E20' : '#374151' }}>
                  {opt.value}% de desconto
                </span>
                <p className="text-xs text-slate-400 mt-0.5">{opt.label.split('—')[1]}</p>
              </div>
              {form.herbalife_discount === opt.value && (
                <span className="text-green-600 font-bold text-sm">✓ Selecionado</span>
              )}
            </label>
          ))}
        </div>

        <div className="rounded-xl p-4 border" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
          <p className="text-xs text-yellow-700">
            <strong>Exemplo:</strong> Com {form.herbalife_discount}% de desconto, ao importar o produto Barras de Proteína Chocolate Peanut (SKU 0009):
            <br />• Preço de venda no site: <strong>R$ 105,00</strong> (Preço Sugerido ao Consumidor)
            <br />• Seu custo interno: <strong>R$ {
              form.herbalife_discount === '25' ? '86,91' :
              form.herbalife_discount === '35' ? '81,12' :
              form.herbalife_discount === '42' ? '77,07' : '72,43'
            }</strong>
            <br />• Margem de lucro: <strong>R$ {
              form.herbalife_discount === '25' ? (105 - 86.91).toFixed(2) :
              form.herbalife_discount === '35' ? (105 - 81.12).toFixed(2) :
              form.herbalife_discount === '42' ? (105 - 77.07).toFixed(2) : (105 - 72.43).toFixed(2)
            }</strong>
          </p>
        </div>
      </div>

      {/* Endereço da Loja */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">📍</span>
          <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Endereço de Origem (Frete)</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className={labelClass}>CEP</label>
            <input className={inputClass} value={form.store_zip} onChange={e => set('store_zip', e.target.value)} placeholder="00000-000" />
          </div>
          <div className="col-span-2 md:col-span-3">
            <label className={labelClass}>Endereço</label>
            <input className={inputClass} value={form.store_street} onChange={e => set('store_street', e.target.value)} placeholder="Rua, número" />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Cidade</label>
            <input className={inputClass} value={form.store_city} onChange={e => set('store_city', e.target.value)} placeholder="Cidade" />
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <input className={inputClass} value={form.store_state} onChange={e => set('store_state', e.target.value)} placeholder="RS" maxLength={2} />
          </div>
        </div>
      </div>

      {/* Frete Grátis */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🚚</span>
          <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Frete Grátis</h3>
        </div>
        <div>
          <label className={labelClass}>Frete grátis em pedidos acima de (R$)</label>
          <div className="relative max-w-xs">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className={`${inputClass} pl-10`}
              value={form.free_shipping_above}
              onChange={e => set('free_shipping_above', e.target.value)}
              placeholder="Deixe em branco para desativar"
            />
          </div>
        </div>
      </div>

      {/* Pagamentos */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">💳</span>
          <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Pagamentos</h3>
        </div>
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="font-medium text-slate-900 text-sm">Mercado Pago</p>
            <p className="text-xs text-slate-400">Pagamentos via Mercado Pago habilitados</p>
          </div>
          <div
            onClick={() => set('mercadopago_enabled', !form.mercadopago_enabled)}
            className="relative w-12 h-6 rounded-full transition-colors cursor-pointer"
            style={{ background: form.mercadopago_enabled ? '#4CAF50' : '#e2e8f0' }}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.mercadopago_enabled ? 'translate-x-7' : 'translate-x-1'}`} />
          </div>
        </label>
      </div>

      <button type="submit" disabled={loading}
        className="w-full font-semibold py-3 rounded-xl transition-all text-white disabled:opacity-60"
        style={{ background: saved ? '#16a34a' : 'linear-gradient(135deg, #1B5E20, #388E3C)' }}>
        {loading ? 'Salvando...' : saved ? '✓ Configurações salvas!' : 'Salvar Configurações'}
      </button>
    </form>
  )
}
