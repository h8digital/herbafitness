import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getPaymentInfo, mapMercadoPagoStatus } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Verificar tipo de notificação
    if (body.type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ received: true })

    // Buscar informações do pagamento
    const payment = await getPaymentInfo(paymentId)
    const orderId = payment.external_reference

    if (!orderId) return NextResponse.json({ received: true })

    const supabase = await createAdminClient()
    const newStatus = mapMercadoPagoStatus(payment.status || '')

    // Atualizar pedido
    await supabase.from('orders').update({
      payment_status: payment.status,
      payment_method: payment.payment_type_id,
      status: newStatus,
    }).eq('id', orderId)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook Mercado Pago erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
