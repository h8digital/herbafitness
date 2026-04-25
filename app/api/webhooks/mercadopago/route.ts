import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getPaymentInfo, mapMercadoPagoStatus } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body.type !== 'payment') return NextResponse.json({ received: true })

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ received: true })

    const supabase = await createAdminClient()

    const { data: settings } = await supabase
      .from('settings')
      .select('mercadopago_access_token')
      .eq('id', 'default')
      .single()

    const accessToken = settings?.mercadopago_access_token || process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!accessToken) {
      console.error('[Webhook MP] Token não configurado')
      return NextResponse.json({ error: 'Token não configurado' }, { status: 500 })
    }

    const payment = await getPaymentInfo(paymentId, accessToken)
    const orderId = payment.external_reference
    if (!orderId) return NextResponse.json({ received: true })

    const newStatus = mapMercadoPagoStatus(payment.status || '')

    await supabase.from('orders').update({
      payment_status: payment.status,
      payment_method: payment.payment_type_id,
      status:         newStatus,
    }).eq('id', orderId)

    console.log('[Webhook MP] Pedido', orderId, '→', newStatus)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Webhook MP] Erro:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
