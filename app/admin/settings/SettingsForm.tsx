'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ImageCropUpload from '@/components/ui/ImageCropUpload'

interface Settings {
  id: string
  store_name: string | null
  store_email: string | null
  store_phone: string | null
  store_logo_url: string | null
  store_logo_storage_path: string | null
  store_description: string | null
  herbalife_discount: string | null
  store_zip: string | null
  store_street: string | null
  store_city: string | null
  store_state: string | null
  free_shipping_above: number | null
  mercadopago_enabled: boolean | null
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string | null
  seo_og_image: string | null
  meta_pixel_id: string | null
  meta_api_token: string | null
  meta_test_event_code: string | null
  google_analytics_id: string | null
  google_search_console: string | null
  product_image_ratio: string | null
}

type Tab = 'loja' | 'herbalife' | 'frete' | 'seo' | 'meta' | 'google'

export default function SettingsForm({ settings }: { settings: Settings | null }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('loja')
  const [showToken, setShowToken] = useState(false)

  const [form, setForm] = useState({
    store_name: settings?.store_name || '',
    store_email: settings?.store_email || '',
    store_phone: settings?.store_phone || '',
    store_logo_url: settings?.store_logo_url || '',
    store_logo_storage_path: settings?.store_logo_storage_path || '',
    store_description: settings?.store_description || '',
    herbalife_discount: settings?.herbalife_discount || '50',
    store_zip: settings?.store_zip || '',
    store_street: settings?.store_street || '',
    store_city: settings?.store_city || '',
    store_state: settings?.store_state || '',
    free_shipping_above: settings?.free_shipping_above?.toString() || '',
    mercadopago_enabled: settings?.mercadopago_enabled ?? true,
    seo_title: settings?.seo_title || '',
    seo_description: settings?.seo_description || '',
    seo_keywords: settings?.seo_keywords || '',
    seo_og_image: settings?.seo_og_image || '',
    meta_pixel_id: settings?.meta_pixel_id || '',
    meta_api_token: settings?.meta_api_token || '',
    meta_test_event_code: settings?.meta_test_event_code || '',
    google_analytics_id: settings?.google_analytics_id || '',
    google_search_console: settings?.google_search_console || '',
    product_image_ratio: (settings as any)?.product_image_ratio || '4/5',
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
      store_logo_storage_path: form.store_logo_storage_path || null,
      store_description: form.store_description || null,
      herbalife_discount: form.herbalife_discount,
      store_zip: form.store_zip || null,
      store_street: form.store_street || null,
      store_city: form.store_city || null,
      store_state: form.store_state || null,
      free_shipping_above: form.free_shipping_above ? parseFloat(form.free_shipping_above) : null,
      mercadopago_enabled: form.mercadopago_enabled,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      seo_keywords: form.seo_keywords || null,
      seo_og_image: form.seo_og_image || null,
      meta_pixel_id: form.meta_pixel_id || null,
      meta_api_token: form.meta_api_token || null,
      meta_test_event_code: form.meta_test_event_code || null,
      google_analytics_id: form.google_analytics_id || null,
      google_search_console: form.google_search_console || null,
      product_image_ratio: form.product_image_ratio,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    router.refresh()
    setLoading(false)
  }

  const ic = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
  const lc = "block text-sm font-medium text-slate-700 mb-1.5"

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'loja',      label: 'Loja',      icon: '🏪' },
    { key: 'herbalife', label: 'Herbalife', icon: '🌿' },
    { key: 'frete',     label: 'Frete',     icon: '🚚' },
    { key: 'seo',       label: 'SEO',       icon: '🔍' },
    { key: 'meta',      label: 'Meta',      icon: '📘' },
    { key: 'google',    label: 'Google',    icon: '🔵' },
  ]

  const StatusBadge = ({ active }: { active: boolean }) =>
    active ? <span className="ml-auto px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">✓ Ativo</span>
           : <span className="ml-auto px-2.5 py-1 bg-slate-100 text-slate-400 text-xs font-medium rounded-full">Não configurado</span>

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'border-green-600 text-green-700 bg-green-50'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>
              <span>{tab.icon}</span><span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── LOJA ── */}
      {activeTab === 'loja' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Dados da Loja</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ImageCropUpload label="Logo da Loja" value={form.store_logo_url} folder="logo" aspectRatio="16/9"
                onChange={(url, path) => { set('store_logo_url', url); set('store_logo_storage_path', path) }} />
              <p className="text-xs text-slate-400 mt-1.5">PNG transparente recomendado · 400×200px</p>
            </div>
            <div className="space-y-4">
              <div><label className={lc}>Nome da Loja</label><input className={ic} value={form.store_name} onChange={e => set('store_name', e.target.value)} placeholder="Herbafit" /></div>
              <div><label className={lc}>Descrição</label><textarea className={ic} value={form.store_description} onChange={e => set('store_description', e.target.value)} rows={3} /></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={lc}>Email de Contato</label><input type="email" className={ic} value={form.store_email} onChange={e => set('store_email', e.target.value)} placeholder="contato@herbafit.com.br" /></div>
            <div><label className={lc}>Telefone / WhatsApp</label><input className={ic} value={form.store_phone} onChange={e => set('store_phone', e.target.value)} placeholder="(51) 99999-9999" /></div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div><p className="font-medium text-slate-900 text-sm">Mercado Pago</p><p className="text-xs text-slate-400">Pagamentos online</p></div>
            <div onClick={() => set('mercadopago_enabled', !form.mercadopago_enabled)}
              className="relative w-12 h-6 rounded-full transition-colors cursor-pointer"
              style={{ background: form.mercadopago_enabled ? '#4CAF50' : '#e2e8f0' }}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.mercadopago_enabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
          </div>

          {/* Proporção das imagens dos produtos */}
          <div className="pt-2 border-t border-slate-100">
            <p className="font-medium text-slate-900 text-sm mb-1">Proporção das Imagens dos Produtos</p>
            <p className="text-xs text-slate-400 mb-4">Define o recorte no cadastro e a exibição em todo o site</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: '1/1',  label: '1:1',  desc: 'Quadrado',      w: 60,  h: 60  },
                { value: '4/5',  label: '4:5',  desc: 'Retrato curto', w: 48,  h: 60  },
                { value: '3/4',  label: '3:4',  desc: 'Retrato longo', w: 45,  h: 60  },
                { value: '4/3',  label: '4:3',  desc: 'Paisagem',      w: 60,  h: 45  },
              ].map(opt => {
                const isSelected = form.product_image_ratio === opt.value
                return (
                  <label key={opt.value}
                    onClick={() => set('product_image_ratio', opt.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-300'}`}>
                    {/* Preview visual da proporção */}
                    <div className="flex items-center justify-center" style={{ width: 60, height: 60 }}>
                      <div className="rounded-lg overflow-hidden"
                        style={{
                          width: opt.w,
                          height: opt.h,
                          background: isSelected
                            ? 'linear-gradient(135deg, #1B5E20, #4CAF50)'
                            : '#e2e8f0',
                        }}>
                        {isSelected && (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className={`font-bold text-sm ${isSelected ? 'text-green-800' : 'text-slate-700'}`}>{opt.label}</p>
                      <p className="text-[11px] text-slate-400">{opt.desc}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── HERBALIFE ── */}
      {activeTab === 'herbalife' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Desconto Herbalife</h3>
          <div className="rounded-xl p-4" style={{ background: '#f1f8f1' }}>
            <p className="text-sm font-medium mb-1" style={{ color: '#1B5E20' }}>Qual é o seu desconto atual na Herbalife?</p>
            <p className="text-xs text-slate-500">Define qual coluna de custo é usada na importação da lista de preços.</p>
          </div>
          <div className="space-y-2">
            {[
              { value: '25', label: '25%', sub: 'Consultor Inicial (0 a 499 PV)' },
              { value: '35', label: '35%', sub: 'Consultor Sênior (500 a 1.999 PV)' },
              { value: '42', label: '42%', sub: 'Consultor Sênior (2.000 a 3.999 PV)' },
              { value: '50', label: '50%', sub: 'Supervisor (Acima de 4.000 PV)' },
            ].map(opt => (
              <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.herbalife_discount === opt.value ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="herbalife_discount" value={opt.value} checked={form.herbalife_discount === opt.value} onChange={() => set('herbalife_discount', opt.value)} className="accent-green-600" />
                <div className="flex-1">
                  <span className="font-semibold text-sm" style={{ color: form.herbalife_discount === opt.value ? '#1B5E20' : '#374151' }}>{opt.label} de desconto</span>
                  <p className="text-xs text-slate-400 mt-0.5">{opt.sub}</p>
                </div>
                {form.herbalife_discount === opt.value && <span className="text-green-600 font-bold">✓</span>}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── FRETE ── */}
      {activeTab === 'frete' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Endereço de Origem (Frete)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 md:col-span-1"><label className={lc}>CEP</label><input className={ic} value={form.store_zip} onChange={e => set('store_zip', e.target.value)} placeholder="00000-000" /></div>
            <div className="col-span-2 md:col-span-3"><label className={lc}>Endereço</label><input className={ic} value={form.store_street} onChange={e => set('store_street', e.target.value)} placeholder="Rua, número" /></div>
            <div className="col-span-2"><label className={lc}>Cidade</label><input className={ic} value={form.store_city} onChange={e => set('store_city', e.target.value)} /></div>
            <div><label className={lc}>Estado</label><input className={ic} value={form.store_state} onChange={e => set('store_state', e.target.value)} placeholder="RS" maxLength={2} /></div>
          </div>
          <div>
            <label className={lc}>Frete grátis acima de (R$)</label>
            <div className="relative max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
              <input type="number" step="0.01" min="0" className={`${ic} pl-10`} value={form.free_shipping_above} onChange={e => set('free_shipping_above', e.target.value)} placeholder="Deixe em branco para desativar" />
            </div>
          </div>
        </div>
      )}

      {/* ── SEO ── */}
      {activeTab === 'seo' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>SEO — Mecanismos de Busca</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            Controla como sua loja aparece no Google, Bing e ao compartilhar links.
          </div>
          <div>
            <label className={lc}>Título da Página (Title Tag)</label>
            <input className={ic} value={form.seo_title} onChange={e => set('seo_title', e.target.value)} placeholder="Herbafit — Produtos Naturais e Suplementos" maxLength={60} />
            <p className="text-xs text-slate-400 mt-1">{form.seo_title.length}/60 caracteres</p>
          </div>
          <div>
            <label className={lc}>Meta Description</label>
            <textarea className={ic} value={form.seo_description} onChange={e => set('seo_description', e.target.value)} placeholder="Encontre os melhores produtos naturais e suplementos Herbalife..." rows={3} maxLength={160} />
            <p className="text-xs text-slate-400 mt-1">{form.seo_description.length}/160 caracteres</p>
          </div>
          <div>
            <label className={lc}>Palavras-chave</label>
            <input className={ic} value={form.seo_keywords} onChange={e => set('seo_keywords', e.target.value)} placeholder="herbalife, suplementos, produtos naturais, shake, nutrição" />
            <p className="text-xs text-slate-400 mt-1">Separe por vírgula</p>
          </div>
          <div>
            <label className={lc}>Imagem de Compartilhamento (Open Graph)</label>
            <ImageCropUpload value={form.seo_og_image} folder="seo" aspectRatio="16/9" onChange={(url) => set('seo_og_image', url)} />
            <p className="text-xs text-slate-400 mt-1.5">Aparece ao compartilhar no WhatsApp, Facebook, etc. Recomendado: 1200×630px</p>
          </div>
          {(form.seo_title || form.seo_description) && (
            <div className="border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Preview Google</p>
              <p className="text-blue-600 text-base font-medium truncate">{form.seo_title || 'Herbafit'}</p>
              <p className="text-green-700 text-xs">herbafitness.vercel.app</p>
              <p className="text-slate-600 text-sm mt-1 line-clamp-2">{form.seo_description || '—'}</p>
            </div>
          )}
          <div>
            <label className={lc}>Google Search Console — Código de Verificação</label>
            <input className={ic} value={form.google_search_console} onChange={e => set('google_search_console', e.target.value)} placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
            <p className="text-xs text-slate-400 mt-1">
              Acesse <a href="https://search.google.com/search-console" target="_blank" rel="noopener" className="text-blue-500 underline">Search Console</a> → Adicionar propriedade → HTML tag → copie o valor do atributo <code className="bg-slate-100 px-1 rounded">content</code>
            </p>
          </div>
        </div>
      )}

      {/* ── META ── */}
      {activeTab === 'meta' && (
        <div className="space-y-5">
          {/* Header Meta */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#1877f2' }}>
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Meta (Facebook & Instagram)</h3>
                <p className="text-xs text-slate-400">Pixel + API de Conversões</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 mb-5">
              <p className="font-semibold mb-1">💡 Pixel vs API de Conversões</p>
              <p className="text-xs leading-relaxed">O <strong>Pixel ID</strong> rastreia eventos no navegador do cliente. O <strong>Token API</strong> envia eventos pelo servidor — mais preciso, funciona mesmo com bloqueadores de anúncios e é obrigatório para campanhas avançadas.</p>
            </div>

            {/* Pixel ID */}
            <div className="space-y-4">
              <div>
                <label className={lc}>
                  Pixel ID
                  <StatusBadge active={!!form.meta_pixel_id} />
                </label>
                <input className={ic} value={form.meta_pixel_id} onChange={e => set('meta_pixel_id', e.target.value)} placeholder="123456789012345" />
                <p className="text-xs text-slate-400 mt-1">
                  Onde encontrar: <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener" className="text-blue-500 underline">Events Manager</a> → seu Pixel → número abaixo do nome
                </p>
              </div>

              {/* API Token */}
              <div className="border-t border-slate-100 pt-4">
                <label className={lc}>
                  Token de Acesso da API de Conversões
                  <StatusBadge active={!!form.meta_api_token} />
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    className={`${ic} pr-12`}
                    value={form.meta_api_token}
                    onChange={e => set('meta_api_token', e.target.value)}
                    placeholder="EAAxxxxxxxxxxxxxxxx..."
                  />
                  <button type="button" onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showToken ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
                {/* Passo a passo */}
                <div className="mt-3 bg-slate-50 rounded-xl p-4 space-y-2 text-xs text-slate-600">
                  <p className="font-semibold text-slate-700">Como gerar o Token API da Meta:</p>
                  <div className="space-y-1.5">
                    <p>1. Acesse o <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener" className="text-blue-500 underline font-medium">Meta Events Manager</a></p>
                    <p>2. Selecione seu <strong>Pixel</strong> no menu lateral</p>
                    <p>3. Clique em <strong>"Configurações"</strong> (aba no topo)</p>
                    <p>4. Role até a seção <strong>"API de Conversões"</strong></p>
                    <p>5. Clique em <strong>"Gerar token de acesso"</strong></p>
                    <p>6. Copie o token gerado (começa com <code className="bg-white border px-1 rounded">EAA</code>)</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 mt-2">
                    <p className="text-yellow-700 font-medium">⚠️ Atenção</p>
                    <p className="text-yellow-600 mt-0.5">Este token dá acesso à sua conta Meta. Nunca compartilhe com terceiros.</p>
                  </div>
                </div>
              </div>

              {/* Test Event Code */}
              <div className="border-t border-slate-100 pt-4">
                <label className={lc}>
                  Código de Teste de Eventos <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <input className={ic} value={form.meta_test_event_code} onChange={e => set('meta_test_event_code', e.target.value)} placeholder="TEST12345" />
                <p className="text-xs text-slate-400 mt-1">
                  Use durante testes. Encontre em Events Manager → Testar eventos → "Código do evento de teste". <strong>Remova após validar.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── GOOGLE ── */}
      {activeTab === 'google' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Google Analytics 4</h3>
              <p className="text-xs text-slate-400">Análise de tráfego e conversões</p>
            </div>
            <StatusBadge active={!!form.google_analytics_id} />
          </div>

          <div>
            <label className={lc}>Measurement ID (GA4)</label>
            <input className={ic} value={form.google_analytics_id} onChange={e => set('google_analytics_id', e.target.value)} placeholder="G-XXXXXXXXXX" />
            <div className="mt-3 bg-slate-50 rounded-xl p-4 space-y-1.5 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Como encontrar seu Measurement ID:</p>
              <p>1. Acesse <a href="https://analytics.google.com" target="_blank" rel="noopener" className="text-blue-500 underline">Google Analytics</a></p>
              <p>2. Vá em <strong>Administrador</strong> → <strong>Fluxos de dados</strong></p>
              <p>3. Clique no seu fluxo web</p>
              <p>4. Copie o <strong>ID de medição</strong> (começa com <code className="bg-white border px-1 rounded">G-</code>)</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <label className={lc}>Google Search Console — Código de Verificação</label>
            <input className={ic} value={form.google_search_console} onChange={e => set('google_search_console', e.target.value)} placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
            <div className="mt-3 bg-slate-50 rounded-xl p-4 space-y-1.5 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Como verificar o Search Console:</p>
              <p>1. Acesse <a href="https://search.google.com/search-console" target="_blank" rel="noopener" className="text-blue-500 underline">Search Console</a></p>
              <p>2. Adicionar propriedade → escolha <strong>URL prefix</strong></p>
              <p>3. Em "Verificação", escolha <strong>HTML tag</strong></p>
              <p>4. Copie apenas o valor do atributo <code className="bg-white border px-1 rounded">content</code></p>
              <p className="text-slate-400">Ex: <code className="bg-white border px-1 rounded text-slate-500">abc123def456...</code></p>
            </div>
          </div>
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full font-semibold py-3 rounded-xl transition-all text-white disabled:opacity-60"
        style={{ background: saved ? '#16a34a' : 'linear-gradient(135deg, #1B5E20, #388E3C)' }}>
        {loading ? 'Salvando...' : saved ? '✓ Salvo com sucesso!' : 'Salvar Configurações'}
      </button>
    </form>
  )
}
