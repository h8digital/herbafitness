import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createPaymentPreference } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()
    const supabase = await createAdminClient()

    // Buscar pedido com itens e perfil do cliente
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*), profiles(email)')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    const customerEmail = (order.profiles as any)?.email || 'cliente@email.com'
    const preference = await createPaymentPreference(order as any, customerEmail)

    // Salvar preference_id no pedido
    await supabase
      .from('orders')
      .update({
        payment_id: preference.id,
        payment_url: preference.init_point,
        status: 'payment_pending',
      })
      .eq('id', orderId)

    return NextResponse.json({
      preference_id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    })
  } catch (error: any) {
    console.error('Erro Mercado Pago:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
