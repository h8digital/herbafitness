import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const SUPERFRETE_API = 'https://api.superfrete.com/api/v0'

const FALLBACK_OPTIONS = [
  { id: 'pac',   name: 'PAC',   price: 29.90, days: 10, company: 'Correios' },
  { id: 'sedex', name: 'SEDEX', price: 49.90, days: 3,  company: 'Correios' },
]

export async function POST(req: NextRequest) {
  try {
    const { address, items } = await req.json()

    const supabase = await createAdminClient()
    const { data: settings } = await supabase
      .from('settings')
      .select('superfrete_token, superfrete_cep_origem, store_zip')
      .eq('id', 'default')
      .single()

    const token     = settings?.superfrete_token || process.env.SUPERFRETE_TOKEN
    const cepOrigem = (
      settings?.superfrete_cep_origem ||
      settings?.store_zip ||
      process.env.SUPERFRETE_CEP_ORIGEM ||
      '01310100'
    ).replace(/\D/g, '')

    if (!token) {
      console.warn('[SuperFrete] Token não configurado — usando frete padrão')
      return NextResponse.json({ options: FALLBACK_OPTIONS, fallback: true })
    }

    if (!address?.zip) return NextResponse.json({ options: FALLBACK_OPTIONS, fallback: true })

    const cepDestino = address.zip.replace(/\D/g, '')
    if (cepDestino.length !== 8) return NextResponse.json({ options: FALLBACK_OPTIONS, fallback: true })

    const safeItems   = items?.length > 0 ? items : [{ weight: 0.5, height: 10, width: 15, length: 20, quantity: 1 }]
    const totalWeight = safeItems.reduce((s: number, i: any) => s + (i.weight || 0.3) * (i.quantity || 1), 0)
    const maxHeight   = Math.max(...safeItems.map((i: any) => i.height || 10))
    const maxWidth    = Math.max(...safeItems.map((i: any) => i.width  || 15))
    const totalLength = safeItems.reduce((s: number, i: any) => s + (i.length || 20) * (i.quantity || 1), 0)

    const body = {
      from: { postal_code: cepOrigem },
      to:   { postal_code: cepDestino },
      package: {
        height: Math.max(Math.ceil(maxHeight),    2),
        width:  Math.max(Math.ceil(maxWidth),    11),
        length: Math.max(Math.ceil(totalLength), 16),
        weight: Math.max(totalWeight, 0.1),
      },
    }

    console.log('[SuperFrete] Request:', JSON.stringify(body))

    const response = await fetch(`${SUPERFRETE_API}/calculator`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        Authorization:   `Bearer ${token}`,
        'User-Agent':    'Herbafit-Ecommerce/1.0',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error(`[SuperFrete] Erro ${response.status}:`, text)
      return NextResponse.json({ options: FALLBACK_OPTIONS, fallback: true })
    }

    const data = await response.json()
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ options: FALLBACK_OPTIONS, fallback: true })
    }

    const options = data
      .filter((s: any) => !s.error && s.price && parseFloat(s.price) > 0)
      .map((s: any) => ({
        id:      s.id?.toString() || s.name?.toLowerCase().replace(/\s/g, '_'),
        name:    s.name,
        price:   parseFloat(s.price),
        days:    parseInt(s.delivery_time || s.custom_delivery_time || '7'),
        company: s.company?.name || 'Transportadora',
      }))
      .sort((a: any, b: any) => a.price - b.price)

    return NextResponse.json({ options: options.length ? options : FALLBACK_OPTIONS, fallback: options.length === 0 })
  } catch (err: any) {
    console.error('[SuperFrete] Erro inesperado:', err.message)
    return NextResponse.json({ options: FALLBACK_OPTIONS, fallback: true })
  }
}
