import { ShippingAddress, ShippingOption } from '@/types'

const SUPERFRETE_API = 'https://api.superfrete.com/api/v0'

interface SuperFreteQuoteRequest {
  from: {
    postal_code: string
  }
  to: {
    postal_code: string
  }
  package: {
    height: number
    width: number
    length: number
    weight: number
  }
  services?: string
}

export async function calculateShipping(
  address: ShippingAddress,
  items: Array<{
    weight: number
    height: number
    width: number
    length: number
    quantity: number
  }>
): Promise<ShippingOption[]> {
  // Calcular dimensões consolidadas
  const totalWeight = items.reduce((sum, item) => sum + item.weight * item.quantity, 0)
  const maxHeight = Math.max(...items.map(i => i.height))
  const maxWidth = Math.max(...items.map(i => i.width))
  const totalLength = items.reduce((sum, item) => sum + item.length * item.quantity, 0)

  const body: SuperFreteQuoteRequest = {
    from: {
      postal_code: process.env.SUPERFRETE_CEP_ORIGEM || '01310100',
    },
    to: {
      postal_code: address.zip.replace(/\D/g, ''),
    },
    package: {
      height: Math.max(maxHeight, 2),
      width: Math.max(maxWidth, 11),
      length: Math.max(totalLength, 16),
      weight: Math.max(totalWeight, 0.1),
    },
  }

  try {
    const response = await fetch(`${SUPERFRETE_API}/calculator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPERFRETE_TOKEN}`,
        'User-Agent': 'NextJS-Ecommerce/1.0',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`SuperFrete API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data || !Array.isArray(data)) {
      return []
    }

    const options: ShippingOption[] = data
      .filter((service: any) => !service.error && service.price)
      .map((service: any) => ({
        id: service.id?.toString() || service.name,
        name: service.name,
        price: parseFloat(service.price),
        days: service.delivery_time || service.custom_delivery_time || 7,
        company: service.company?.name || 'Transportadora',
      }))
      .sort((a: ShippingOption, b: ShippingOption) => a.price - b.price)

    return options
  } catch (error) {
    console.error('Erro ao calcular frete:', error)
    // Retorna opção padrão em caso de erro
    return [
      {
        id: 'default',
        name: 'Frete Padrão',
        price: 25.0,
        days: 7,
        company: 'Correios',
      },
    ]
  }
}

export async function createShippingLabel(orderId: string): Promise<string | null> {
  // Implementar geração de etiqueta via SuperFrete
  // Esta função seria chamada quando o admin confirma o envio
  try {
    const response = await fetch(`${SUPERFRETE_API}/cart`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SUPERFRETE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order_id: orderId }),
    })

    const data = await response.json()
    return data.label_url || null
  } catch {
    return null
  }
}

export async function fetchAddressFromCEP(cep: string): Promise<Partial<ShippingAddress> | null> {
  try {
    const cleaned = cep.replace(/\D/g, '')
    const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`)
    const data = await response.json()

    if (data.erro) return null

    return {
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
      zip: cleaned,
    }
  } catch {
    return null
  }
}
