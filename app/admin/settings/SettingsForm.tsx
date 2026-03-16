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
  google_analytics_id: string | null
  google_search_console: string | null
}

type Tab = 'loja' | 'herbalife' | 'frete' | 'seo' | 'tracking'

export default function SettingsForm({ settings }: { settings: Settings | null }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('loja')

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
    google_analytics_id: settings?.google_analytics_id || '',
    google_search_console: settings?.google_search_console || '',
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
      google_analytics_id: form.google_analytics_id || null,
      google_search_console: form.google_search_console || null,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    router.refresh()
    setLoading(false)
  }

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'loja', label: 'Loja', icon: '🏪' },
    { key: 'herbalife', label: 'Herbalife', icon: '🌿' },
    { key: 'frete', label: 'Frete', icon: '🚚' },
    { key: 'seo', label: 'SEO', icon: '🔍' },
    { key: 'tracking', label: 'Tracking', icon: '📊' },
  ]

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
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ==================== ABA LOJA ==================== */}
      {activeTab === 'loja' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Dados da Loja</h3>

          {/* Logo upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ImageUpload
                label="Logo da Loja"
                value={form.store_logo_url}
                folder="logo"
                aspectRatio="wide"
                placeholder="Enviar logo"
                onChange={(url, path) => { set('store_logo_url', url); set('store_logo_storage_path', path) }}
              />
              <p className="text-xs text-slate-400 mt-1.5">Recomendado: PNG transparente, 400×200px</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nome da Loja</label>
                <input className={inputClass} value={form.store_name} onChange={e => set('store_name', e.target.value)} placeholder="Herbafit" />
              </div>
              <div>
                <label className={labelClass}>Descrição</label>
                <textarea className={inputClass} value={form.store_description} onChange={e => set('store_description', e.target.value)} rows={3} placeholder="Produtos naturais e suplementos..." />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email de Contato</label>
              <input type="email" className={inputClass} value={form.store_email} onChange={e => set('store_email', e.target.value)} placeholder="contato@sualooja.com.br" />
            </div>
            <div>
              <label className={labelClass}>Telefone / WhatsApp</label>
              <input className={inputClass} value={form.store_phone} onChange={e => set('store_phone', e.target.value)} placeholder="(51) 99999-9999" />
            </div>
          </div>

          {/* Toggle Mercado Pago */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="font-medium text-slate-900 text-sm">Mercado Pago</p>
              <p className="text-xs text-slate-400">Pagamentos online habilitados</p>
            </div>
            <div onClick={() => set('mercadopago_enabled', !form.mercadopago_enabled)}
              className="relative w-12 h-6 rounded-full transition-colors cursor-pointer"
              style={{ background: form.mercadopago_enabled ? '#4CAF50' : '#e2e8f0' }}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.mercadopago_enabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
          </div>
        </div>
      )}

      {/* ==================== ABA HERBALIFE ==================== */}
      {activeTab === 'herbalife' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Configuração Herbalife</h3>
          <div className="rounded-xl p-4" style={{ background: '#f1f8f1' }}>
            <p className="text-sm font-medium mb-1" style={{ color: '#1B5E20' }}>Qual é o seu desconto atual na Herbalife?</p>
            <p className="text-xs text-slate-500">Define qual coluna de preço é usada como custo ao importar a lista de preços. O preço de venda sempre será o Preço Sugerido ao Consumidor.</p>
          </div>
          <div className="space-y-2">
            {[
              { value: '25', label: '25%', sub: 'Consultor Inicial (0 a 499 PV)' },
              { value: '35', label: '35%', sub: 'Consultor Sênior (500 a 1.999 PV)' },
              { value: '42', label: '42%', sub: 'Consultor Sênior (2.000 a 3.999 PV)' },
              { value: '50', label: '50%', sub: 'Supervisor (Acima de 4.000 PV)' },
            ].map(opt => (
              <label key={opt.value}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.herbalife_discount === opt.value ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="herbalife_discount" value={opt.value}
                  checked={form.herbalife_discount === opt.value}
                  onChange={() => set('herbalife_discount', opt.value)}
                  className="accent-green-600" />
                <div className="flex-1">
                  <span className="font-semibold text-sm" style={{ color: form.herbalife_discount === opt.value ? '#1B5E20' : '#374151' }}>
                    {opt.label} de desconto
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">{opt.sub}</p>
                </div>
                {form.herbalife_discount === opt.value && <span className="text-green-600 font-bold text-sm">✓</span>}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ==================== ABA FRETE ==================== */}
      {activeTab === 'frete' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Endereço de Origem</h3>
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
              <input className={inputClass} value={form.store_city} onChange={e => set('store_city', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <input className={inputClass} value={form.store_state} onChange={e => set('store_state', e.target.value)} placeholder="RS" maxLength={2} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Frete grátis acima de (R$)</label>
            <div className="relative max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
              <input type="number" step="0.01" min="0" className={`${inputClass} pl-10`}
                value={form.free_shipping_above} onChange={e => set('free_shipping_above', e.target.value)}
                placeholder="Deixe em branco para desativar" />
            </div>
          </div>
        </div>
      )}

      {/* ==================== ABA SEO ==================== */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🔍</span>
              <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>SEO — Mecanismos de Busca</h3>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
              Essas configurações controlam como sua loja aparece no Google, Bing e redes sociais.
            </div>

            <div>
              <label className={labelClass}>Título da página (Title)</label>
              <input className={inputClass} value={form.seo_title} onChange={e => set('seo_title', e.target.value)}
                placeholder="Herbafit — Produtos Naturais e Suplementos" maxLength={60} />
              <p className="text-xs text-slate-400 mt-1">{form.seo_title.length}/60 caracteres recomendados</p>
            </div>

            <div>
              <label className={labelClass}>Meta Description</label>
              <textarea className={inputClass} value={form.seo_description} onChange={e => set('seo_description', e.target.value)}
                placeholder="Encontre os melhores produtos naturais e suplementos Herbalife. Qualidade garantida com entrega para todo o Brasil." rows={3} maxLength={160} />
              <p className="text-xs text-slate-400 mt-1">{form.seo_description.length}/160 caracteres recomendados</p>
            </div>

            <div>
              <label className={labelClass}>Palavras-chave (Keywords)</label>
              <input className={inputClass} value={form.seo_keywords} onChange={e => set('seo_keywords', e.target.value)}
                placeholder="herbalife, suplementos, produtos naturais, shake, nutrição, emagrecimento" />
              <p className="text-xs text-slate-400 mt-1">Separe por vírgula</p>
            </div>

            <div>
              <label className={labelClass}>Imagem para compartilhamento (Open Graph)</label>
              <ImageUpload
                value={form.seo_og_image}
                folder="seo"
                aspectRatio="wide"
                placeholder="Enviar imagem de compartilhamento (1200×630px)"
                onChange={(url) => set('seo_og_image', url)}
              />
              <p className="text-xs text-slate-400 mt-1.5">Aparece quando o link é compartilhado no WhatsApp, Facebook, etc. Recomendado: 1200×630px</p>
            </div>

            {/* Preview */}
            {(form.seo_title || form.seo_description) && (
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-2 font-medium">Preview Google:</p>
                <p className="text-blue-600 text-base font-medium truncate">{form.seo_title || 'Herbafit'}</p>
                <p className="text-green-700 text-xs">herbafitness.vercel.app</p>
                <p className="text-slate-600 text-sm mt-1 line-clamp-2">{form.seo_description || 'Descrição não configurada'}</p>
              </div>
            )}

            <div>
              <label className={labelClass}>Google Search Console — Verification Code</label>
              <input className={inputClass} value={form.google_search_console} onChange={e => set('google_search_console', e.target.value)}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              <p className="text-xs text-slate-400 mt-1">
                Acesse <a href="https://search.google.com/search-console" target="_blank" rel="noopener" className="text-blue-500 underline">Google Search Console</a> → Adicionar propriedade → HTML tag → copie o código do atributo <code className="bg-slate-100 px-1 rounded">content</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ABA TRACKING ==================== */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          {/* Meta Pixel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1877f2' }}>
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Meta Pixel</h3>
                <p className="text-xs text-slate-400">Facebook & Instagram Ads</p>
              </div>
              {form.meta_pixel_id && (
                <span className="ml-auto px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">✓ Ativo</span>
              )}
            </div>
            <div>
              <label className={labelClass}>Pixel ID</label>
              <input className={inputClass} value={form.meta_pixel_id} onChange={e => set('meta_pixel_id', e.target.value)}
                placeholder="123456789012345" />
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 space-y-1">
              <p className="font-medium text-slate-700">Como encontrar seu Pixel ID:</p>
              <p>1. Acesse <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener" className="text-blue-500 underline">Meta Events Manager</a></p>
              <p>2. Clique em <strong>Conectar fontes de dados</strong></p>
              <p>3. Selecione <strong>Web</strong> → <strong>Meta Pixel</strong></p>
              <p>4. O ID aparece abaixo do nome do pixel (ex: 1234567890)</p>
            </div>
          </div>

          {/* Google Analytics */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200">
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
              {form.google_analytics_id && (
                <span className="ml-auto px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">✓ Ativo</span>
              )}
            </div>
            <div>
              <label className={labelClass}>Measurement ID (GA4)</label>
              <input className={inputClass} value={form.google_analytics_id} onChange={e => set('google_analytics_id', e.target.value)}
                placeholder="G-XXXXXXXXXX" />
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 space-y-1">
              <p className="font-medium text-slate-700">Como encontrar seu Measurement ID:</p>
              <p>1. Acesse <a href="https://analytics.google.com" target="_blank" rel="noopener" className="text-blue-500 underline">Google Analytics</a></p>
              <p>2. Vá em <strong>Administrador</strong> → <strong>Fluxos de dados</strong></p>
              <p>3. Clique no seu fluxo web</p>
              <p>4. Copie o <strong>ID de medição</strong> (começa com G-)</p>
            </div>
          </div>
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full font-semibold py-3 rounded-xl transition-all text-white disabled:opacity-60"
        style={{ background: saved ? '#16a34a' : 'linear-gradient(135deg, #1B5E20, #388E3C)' }}>
        {loading ? 'Salvando...' : saved ? '✓ Configurações salvas!' : 'Salvar Configurações'}
      </button>
    </form>
  )
}
