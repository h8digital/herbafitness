import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { Order } from '@/types'

function getClient(accessToken: string) {
  return new MercadoPagoConfig({ accessToken })
}

export async function createPaymentPreference(
  order: Order,
  customerEmail: string,
  accessToken: string,
) {
  const preference = new Preference(getClient(accessToken))

  const mpItems = (order.items || []).map(item => ({
    id:          item.product_id || item.id,
    title:       item.product_name,
    quantity:    item.quantity,
    unit_price:  item.unit_price,
    currency_id: 'BRL',
  }))

  if (order.shipping_amount > 0) {
    mpItems.push({
      id:          'shipping',
      title:       `Frete — ${order.shipping_service_name || 'Entrega'}`,
      quantity:    1,
      unit_price:  order.shipping_amount,
      currency_id: 'BRL',
    })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.herbafit.com.br'

  return preference.create({
    body: {
      items: mpItems,
      payer: { email: customerEmail },
      external_reference: order.id,
      notification_url:   `${appUrl}/api/webhooks/mercadopago`,
      back_urls: {
        success: `${appUrl}/shop/orders/${order.id}?status=success`,
        failure: `${appUrl}/shop/orders/${order.id}?status=failure`,
        pending: `${appUrl}/shop/orders/${order.id}?status=pending`,
      },
      auto_return:          'approved',
      statement_descriptor: 'HERBAFIT',
    },
  })
}

export async function getPaymentInfo(paymentId: string, accessToken: string) {
  return new Payment(getClient(accessToken)).get({ id: paymentId })
}

export function mapMercadoPagoStatus(mpStatus: string): string {
  const map: Record<string, string> = {
    approved:     'payment_approved',
    pending:      'payment_pending',
    in_process:   'payment_pending',
    rejected:     'cancelled',
    cancelled:    'cancelled',
    refunded:     'refunded',
    charged_back: 'refunded',
  }
  return map[mpStatus] || 'payment_pending'
}
