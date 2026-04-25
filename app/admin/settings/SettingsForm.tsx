'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/ui/ImageUpload'

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
  whatsapp_number: string | null
  instagram_url: string | null
  facebook_url: string | null
  tiktok_url: string | null
  youtube_url: string | null
  twitter_url: string | null
  superfrete_token: string | null
  superfrete_cep_origem: string | null
  mercadopago_access_token: string | null
  mercadopago_public_key: string | null
  mercadopago_sandbox: boolean | null
}

type Tab = 'loja' | 'herbalife' | 'frete' | 'pagamento' | 'social' | 'seo' | 'meta' | 'google'

export default function SettingsForm({ settings }: { settings: Settings | null }) {
  const router  = useRouter()
  const supabase = createClient()
  const [loading, setLoading]       = useState(false)
  const [saved, setSaved]           = useState(false)
  const [activeTab, setActiveTab]   = useState<Tab>('loja')
  const [showMpToken, setShowMpToken]   = useState(false)
  const [showSfToken, setShowSfToken]   = useState(false)

  const [form, setForm] = useState({
    store_name:              settings?.store_name              || '',
    store_email:             settings?.store_email             || '',
    store_phone:             settings?.store_phone             || '',
    store_logo_url:          settings?.store_logo_url          || '',
    store_logo_storage_path: settings?.store_logo_storage_path || '',
    store_description:       settings?.store_description       || '',
    herbalife_discount:      settings?.herbalife_discount      || '50',
    store_zip:               settings?.store_zip               || '',
    store_street:            settings?.store_street            || '',
    store_city:              settings?.store_city              || '',
    store_state:             settings?.store_state             || '',
    free_shipping_above:     settings?.free_shipping_above?.toString() || '',
    mercadopago_enabled:     settings?.mercadopago_enabled ?? true,
    seo_title:               settings?.seo_title               || '',
    seo_description:         settings?.seo_description         || '',
    seo_keywords:            settings?.seo_keywords            || '',
    seo_og_image:            settings?.seo_og_image            || '',
    meta_pixel_id:           settings?.meta_pixel_id           || '',
    meta_api_token:          settings?.meta_api_token          || '',
    meta_test_event_code:    settings?.meta_test_event_code    || '',
    google_analytics_id:     settings?.google_analytics_id     || '',
    google_search_console:   settings?.google_search_console   || '',
    product_image_ratio:     settings?.product_image_ratio     || '4/5',
    whatsapp_number:         settings?.whatsapp_number         || '',
    instagram_url:           settings?.instagram_url           || '',
    facebook_url:            settings?.facebook_url            || '',
    tiktok_url:              settings?.tiktok_url              || '',
    youtube_url:             settings?.youtube_url             || '',
    twitter_url:             settings?.twitter_url             || '',
    // Novas credenciais
    superfrete_token:         settings?.superfrete_token         || '',
    superfrete_cep_origem:    settings?.superfrete_cep_origem    || '',
    mercadopago_access_token: settings?.mercadopago_access_token || '',
    mercadopago_public_key:   settings?.mercadopago_public_key   || '',
    mercadopago_sandbox:      settings?.mercadopago_sandbox      ?? false,
  })

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.from('settings').upsert({
      id: 'default',
      store_name:              form.store_name              || null,
      store_email:             form.store_email             || null,
      store_phone:             form.store_phone             || null,
      store_logo_url:          form.store_logo_url          || null,
      store_logo_storage_path: form.store_logo_storage_path || null,
      store_description:       form.store_description       || null,
      herbalife_discount:      form.herbalife_discount,
      store_zip:               form.store_zip               || null,
      store_street:            form.store_street            || null,
      store_city:              form.store_city              || null,
      store_state:             form.store_state             || null,
      free_shipping_above:     form.free_shipping_above ? parseFloat(form.free_shipping_above) : null,
      mercadopago_enabled:     form.mercadopago_enabled,
      seo_title:               form.seo_title               || null,
      seo_description:         form.seo_description         || null,
      seo_keywords:            form.seo_keywords            || null,
      seo_og_image:            form.seo_og_image            || null,
      meta_pixel_id:           form.meta_pixel_id           || null,
      meta_api_token:          form.meta_api_token          || null,
      meta_test_event_code:    form.meta_test_event_code    || null,
      google_analytics_id:     form.google_analytics_id     || null,
      google_search_console:   form.google_search_console   || null,
      product_image_ratio:     form.product_image_ratio,
      whatsapp_number:         form.whatsapp_number         || null,
      instagram_url:           form.instagram_url           || null,
      facebook_url:            form.facebook_url            || null,
      tiktok_url:              form.tiktok_url              || null,
      youtube_url:             form.youtube_url             || null,
      twitter_url:             form.twitter_url             || null,
      superfrete_token:         form.superfrete_token         || null,
      superfrete_cep_origem:    form.superfrete_cep_origem    || null,
      mercadopago_access_token: form.mercadopago_access_token || null,
      mercadopago_public_key:   form.mercadopago_public_key   || null,
      mercadopago_sandbox:      form.mercadopago_sandbox,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    router.refresh()
    setLoading(false)
  }

  const ic = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
  const lc = "block text-sm font-medium text-slate-700 mb-1.5"

  function StatusBadge({ active }: { active: boolean }) {
    return active
      ? <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Configurado</span>
      : <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-500">✗ Não configurado</span>
  }

  function PasswordField({ field, value, show, onToggle, placeholder }: {
    field: string; value: string; show: boolean; onToggle: () => void; placeholder: string
  }) {
    return (
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className={`${ic} pr-12`}
          value={value}
          onChange={e => set(field, e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg">
          {show ? '🙈' : '👁️'}
        </button>
      </div>
    )
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'loja',      label: 'Loja',          icon: '🏪' },
    { key: 'herbalife', label: 'Herbalife',      icon: '🌿' },
    { key: 'frete',     label: 'Frete',          icon: '🚚' },
    { key: 'pagamento', label: 'Pagamento',      icon: '💳' },
    { key: 'social',    label: 'Redes Sociais',  icon: '📱' },
    { key: 'seo',       label: 'SEO',            icon: '🔍' },
    { key: 'meta',      label: 'Meta',           icon: '📘' },
    { key: 'google',    label: 'Google',         icon: '🔵' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-100">
          {tabs.map(tab => (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'border-green-600 text-green-700 bg-green-50'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>
              <span>{tab.icon}</span><span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* ── LOJA ── */}
          {activeTab === 'loja' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-900">Dados da Loja</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ImageUpload label="Logo da Loja" value={form.store_logo_url} folder="logo"
                    onChange={(url, path) => { set('store_logo_url', url); set('store_logo_storage_path', path) }} />
                </div>
                <div className="space-y-4">
                  <div><label className={lc}>Nome da Loja</label><input className={ic} value={form.store_name} onChange={e => set('store_name', e.target.value)} placeholder="Herbafit" /></div>
                  <div><label className={lc}>Descrição</label><textarea className={ic} value={form.store_description} onChange={e => set('store_description', e.target.value)} rows={3} /></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={lc}>Email de Contato</label><input type="email" className={ic} value={form.store_email} onChange={e => set('store_email', e.target.value)} /></div>
                <div><label className={lc}>Telefone</label><input className={ic} value={form.store_phone} onChange={e => set('store_phone', e.target.value)} /></div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <label className={lc}>Proporção das imagens de produto</label>
                <div className="flex gap-3 flex-wrap">
                  {['3/4','4/5','1/1','4/3'].map(ratio => (
                    <label key={ratio} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all ${form.product_image_ratio === ratio ? 'border-green-600 bg-green-50 text-green-800' : 'border-slate-200 text-slate-600'}`}>
                      <input type="radio" name="ratio" value={ratio} checked={form.product_image_ratio === ratio} onChange={() => set('product_image_ratio', ratio)} className="sr-only" />
                      {ratio}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── HERBALIFE ── */}
          {activeTab === 'herbalife' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Desconto Herbalife</h3>
              <div className="space-y-2">
                {[
                  { value: '25', label: '25%', sub: 'Supervisor / Coordenador de Marketing' },
                  { value: '35', label: '35%', sub: 'Coordenador de Marketing Sênior' },
                  { value: '42', label: '42%', sub: 'Especialista de Sucesso Global' },
                  { value: '50', label: '50%', sub: 'Produtor de Ouro' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${form.herbalife_discount === opt.value ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}>
                    <input type="radio" name="herbalife_discount" value={opt.value} checked={form.herbalife_discount === opt.value} onChange={() => set('herbalife_discount', opt.value)} className="accent-green-600" />
                    <div className="flex-1">
                      <span className="font-semibold text-sm">{opt.label} de desconto</span>
                      <p className="text-xs text-slate-400 mt-0.5">{opt.sub}</p>
                    </div>
                    {form.herbalife_discount === opt.value && <span className="text-green-600">✓</span>}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── FRETE ── */}
          {activeTab === 'frete' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-900">Configurações de Frete</h3>

              {/* SuperFrete */}
              <div className="rounded-2xl border-2 p-5" style={{ borderColor: '#c8e6c9', background: '#f0faf0' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white shadow-sm">🚚</div>
                  <div>
                    <p className="font-semibold text-slate-900">SuperFrete</p>
                    <p className="text-xs text-slate-500">Cálculo de frete em tempo real</p>
                  </div>
                  <StatusBadge active={!!form.superfrete_token} />
                </div>
                <div className="space-y-3">
                  <div>
                    <label className={lc}>Token de Acesso SuperFrete</label>
                    <PasswordField
                      field="superfrete_token"
                      value={form.superfrete_token}
                      show={showSfToken}
                      onToggle={() => setShowSfToken(s => !s)}
                      placeholder="Seu token de acesso da SuperFrete"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Acesse <a href="https://app.superfrete.com" target="_blank" rel="noopener" className="text-blue-500 underline">app.superfrete.com</a> → Configurações → Token de Acesso
                    </p>
                  </div>
                  <div>
                    <label className={lc}>CEP de Origem (para cálculo de frete)</label>
                    <input className={ic} value={form.superfrete_cep_origem}
                      onChange={e => set('superfrete_cep_origem', e.target.value)}
                      placeholder={form.store_zip || '00000-000'}
                    />
                    <p className="text-xs text-slate-400 mt-1">Se vazio, usa o CEP da loja configurado abaixo.</p>
                  </div>
                </div>
              </div>

              {/* Endereço origem */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Endereço de Origem da Loja</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 md:col-span-1"><label className={lc}>CEP</label><input className={ic} value={form.store_zip} onChange={e => set('store_zip', e.target.value)} placeholder="00000-000" /></div>
                  <div className="col-span-2 md:col-span-3"><label className={lc}>Endereço</label><input className={ic} value={form.store_street} onChange={e => set('store_street', e.target.value)} /></div>
                  <div className="col-span-2"><label className={lc}>Cidade</label><input className={ic} value={form.store_city} onChange={e => set('store_city', e.target.value)} /></div>
                  <div><label className={lc}>Estado</label><input className={ic} value={form.store_state} onChange={e => set('store_state', e.target.value)} placeholder="RS" maxLength={2} /></div>
                </div>
              </div>

              {/* Frete grátis */}
              <div>
                <label className={lc}>Frete grátis acima de (R$)</label>
                <div className="relative max-w-xs">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                  <input type="number" step="0.01" min="0" className={`${ic} pl-10`}
                    value={form.free_shipping_above}
                    onChange={e => set('free_shipping_above', e.target.value)}
                    placeholder="Deixe vazio para desativar" />
                </div>
                <p className="text-xs text-slate-400 mt-1">A barra de progresso aparece automaticamente no carrinho.</p>
              </div>
            </div>
          )}

          {/* ── PAGAMENTO ── */}
          {activeTab === 'pagamento' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-900">Mercado Pago</h3>

              <div className="rounded-2xl border-2 p-5" style={{ borderColor: '#ffe082', background: '#fffde7' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm">
                    <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none">
                      <circle cx="24" cy="24" r="24" fill="#009EE3"/>
                      <path d="M12 24c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      <circle cx="24" cy="30" r="4" fill="white"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Mercado Pago</p>
                    <p className="text-xs text-slate-500">Gateway de pagamento</p>
                  </div>
                  <StatusBadge active={!!form.mercadopago_access_token} />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={lc}>Access Token (Produção ou Sandbox)</label>
                    <PasswordField
                      field="mercadopago_access_token"
                      value={form.mercadopago_access_token}
                      show={showMpToken}
                      onToggle={() => setShowMpToken(s => !s)}
                      placeholder="APP_USR-xxxx ou TEST-xxxx"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Acesse <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noopener" className="text-blue-500 underline">Painel de Desenvolvedores MP</a> → Suas integrações → Credenciais
                    </p>
                  </div>
                  <div>
                    <label className={lc}>Public Key <span className="text-slate-400 font-normal">(opcional — para Checkout Bricks)</span></label>
                    <input className={ic} value={form.mercadopago_public_key}
                      onChange={e => set('mercadopago_public_key', e.target.value)}
                      placeholder="APP_USR-xxxx ou TEST-xxxx" />
                  </div>

                  {/* Modo Sandbox */}
                  <div className="flex items-center justify-between pt-2 border-t border-yellow-200">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">Modo Sandbox (Teste)</p>
                      <p className="text-xs text-slate-500">Ative para usar credenciais de teste. Pagamentos não são reais.</p>
                    </div>
                    <div onClick={() => set('mercadopago_sandbox', !form.mercadopago_sandbox)}
                      className="relative w-12 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0"
                      style={{ background: form.mercadopago_sandbox ? '#F59E0B' : '#e2e8f0' }}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.mercadopago_sandbox ? 'translate-x-7' : 'translate-x-1'}`} />
                    </div>
                  </div>

                  {form.mercadopago_sandbox && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-3 text-xs text-yellow-800">
                      ⚠️ <strong>Modo Sandbox ativo.</strong> Use credenciais TEST- do Mercado Pago. Nenhum pagamento real será processado.
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                <p className="font-semibold mb-1">Como obter as credenciais:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Acesse <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noopener" className="underline">mercadopago.com.br/developers</a></li>
                  <li>Crie ou selecione um aplicativo</li>
                  <li>Em <strong>Credenciais de produção</strong>, copie o <strong>Access Token</strong></li>
                  <li>Para testes, use as <strong>Credenciais de teste</strong> (começam com TEST-)</li>
                </ol>
              </div>
            </div>
          )}

          {/* ── REDES SOCIAIS ── */}
          {activeTab === 'social' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-900">Redes Sociais & Contato</h3>
              <div className="rounded-2xl p-5 border-2" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#25D366' }}>
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">WhatsApp</p>
                    <p className="text-xs text-slate-500">Botão fixo de atendimento na loja</p>
                  </div>
                  <StatusBadge active={!!form.whatsapp_number} />
                </div>
                <input className={ic} value={form.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)}
                  placeholder="5551999999999 (com código do país)" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/suapagina' },
                  { key: 'facebook_url',  label: 'Facebook',  placeholder: 'https://facebook.com/suapagina' },
                  { key: 'tiktok_url',    label: 'TikTok',    placeholder: 'https://tiktok.com/@suapagina' },
                  { key: 'youtube_url',   label: 'YouTube',   placeholder: 'https://youtube.com/@seucanal' },
                  { key: 'twitter_url',   label: 'X (Twitter)', placeholder: 'https://x.com/suapagina' },
                ].map(s => (
                  <div key={s.key}>
                    <label className={lc}>{s.label} <StatusBadge active={!!(form as any)[s.key]} /></label>
                    <input className={ic} value={(form as any)[s.key]}
                      onChange={e => set(s.key, e.target.value)} placeholder={s.placeholder} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SEO ── */}
          {activeTab === 'seo' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-900">SEO</h3>
              <div><label className={lc}>Título (Title Tag)</label>
                <input className={ic} value={form.seo_title} onChange={e => set('seo_title', e.target.value)} maxLength={60} />
                <p className="text-xs text-slate-400 mt-1">{form.seo_title.length}/60</p>
              </div>
              <div><label className={lc}>Meta Description</label>
                <textarea className={ic} value={form.seo_description} onChange={e => set('seo_description', e.target.value)} rows={3} maxLength={160} />
                <p className="text-xs text-slate-400 mt-1">{form.seo_description.length}/160</p>
              </div>
              <div><label className={lc}>Palavras-chave</label>
                <input className={ic} value={form.seo_keywords} onChange={e => set('seo_keywords', e.target.value)} placeholder="herbalife, suplementos, shake" />
              </div>
              <div><label className={lc}>Imagem Open Graph</label>
                <ImageUpload value={form.seo_og_image} folder="seo" onChange={url => set('seo_og_image', url)} />
              </div>
              <div><label className={lc}>Google Search Console</label>
                <input className={ic} value={form.google_search_console} onChange={e => set('google_search_console', e.target.value)} />
              </div>
            </div>
          )}

          {/* ── META ── */}
          {activeTab === 'meta' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-900">Meta (Facebook & Instagram)</h3>
              <div><label className={lc}>Pixel ID <StatusBadge active={!!form.meta_pixel_id} /></label>
                <input className={ic} value={form.meta_pixel_id} onChange={e => set('meta_pixel_id', e.target.value)} placeholder="123456789012345" />
              </div>
              <div><label className={lc}>Token API de Conversões <StatusBadge active={!!form.meta_api_token} /></label>
                <div className="relative">
                  <input type="password" className={ic} value={form.meta_api_token}
                    onChange={e => set('meta_api_token', e.target.value)} placeholder="EAAxxxxxxxx..." />
                </div>
              </div>
              <div><label className={lc}>Código de Teste <span className="text-slate-400 font-normal">(opcional)</span></label>
                <input className={ic} value={form.meta_test_event_code} onChange={e => set('meta_test_event_code', e.target.value)} placeholder="TEST12345" />
              </div>
            </div>
          )}

          {/* ── GOOGLE ── */}
          {activeTab === 'google' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-900">Google Analytics 4</h3>
              <div><label className={lc}>ID de Medição (GA4) <StatusBadge active={!!form.google_analytics_id} /></label>
                <input className={ic} value={form.google_analytics_id} onChange={e => set('google_analytics_id', e.target.value)} placeholder="G-XXXXXXXXXX" />
                <p className="text-xs text-slate-400 mt-1">GA4 → Admin → Fluxos de dados → ID de medição</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Botão salvar */}
      <div className="flex justify-end gap-3">
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-semibold text-green-700">Salvo!</span>
          </div>
        )}
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: '#1B5E20' }}>
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </form>
  )
}
