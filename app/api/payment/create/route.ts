import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createPaymentPreference } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()
    if (!orderId) return NextResponse.json({ error: 'orderId é obrigatório' }, { status: 400 })

    const supabase = await createAdminClient()

    const { data: settings } = await supabase
      .from('settings')
      .select('mercadopago_access_token, mercadopago_sandbox')
      .eq('id', 'default')
      .single()

    const accessToken = settings?.mercadopago_access_token || process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!accessToken) {
      console.error('[MP] Token não configurado')
      return NextResponse.json(
        { error: 'Token do Mercado Pago não configurado. Acesse Admin → Configurações → Pagamento.' },
        { status: 500 }
      )
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*), profiles(email, full_name)')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    console.log('[MP] Criando preferência:', order.order_number)

    const customerEmail = (order.profiles as any)?.email || 'cliente@email.com'
    const preference    = await createPaymentPreference(order as any, customerEmail, accessToken)

    if (!preference?.id) {
      return NextResponse.json({ error: 'Falha ao criar preferência de pagamento' }, { status: 500 })
    }

    await supabase.from('orders').update({
      payment_id:  preference.id,
      payment_url: preference.init_point,
      status:      'payment_pending',
    }).eq('id', orderId)

    return NextResponse.json({
      preference_id:      preference.id,
      init_point:         preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    })
  } catch (err: any) {
    console.error('[MP] Erro:', err?.message)
    return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 })
  }
}
