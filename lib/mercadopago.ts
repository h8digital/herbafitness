import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { Order } from '@/types'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function createPaymentPreference(order: Order, customerEmail: string) {
  const preference = new Preference(client)

  const items = (order.items || []).map(item => ({
    id: item.product_id || item.id,
    title: item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    currency_id: 'BRL',
  }))

  // Adicionar frete como item se houver
  if (order.shipping_amount > 0) {
    items.push({
      id: 'shipping',
      title: `Frete - ${order.shipping_service_name || 'Entrega'}`,
      quantity: 1,
      unit_price: order.shipping_amount,
      currency_id: 'BRL',
    })
  }

  const result = await preference.create({
    body: {
      items,
      payer: {
        email: customerEmail,
      },
      external_reference: order.id,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/shop/orders/${order.id}?status=success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/shop/orders/${order.id}?status=failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/shop/orders/${order.id}?status=pending`,
      },
      auto_return: 'approved',
      statement_descriptor: 'MINHA LOJA',
      // Desconto
      ...(order.discount_amount > 0 && {
        additional_info: `Desconto aplicado: R$ ${order.discount_amount.toFixed(2)}`,
      }),
    },
  })

  return result
}

export async function getPaymentInfo(paymentId: string) {
  const payment = new Payment(client)
  return await payment.get({ id: paymentId })
}

export function mapMercadoPagoStatus(mpStatus: string): string {
  const statusMap: Record<string, string> = {
    approved: 'payment_approved',
    pending: 'payment_pending',
    in_process: 'payment_pending',
    rejected: 'cancelled',
    cancelled: 'cancelled',
    refunded: 'refunded',
    charged_back: 'refunded',
  }
  return statusMap[mpStatus] || 'payment_pending'
}
