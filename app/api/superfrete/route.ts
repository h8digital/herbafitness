import { NextRequest, NextResponse } from 'next/server'
import { calculateShipping } from '@/lib/superfrete'

export async function POST(req: NextRequest) {
  try {
    const { address, items } = await req.json()
    const options = await calculateShipping(address, items)
    return NextResponse.json({ options })
  } catch (error) {
    console.error('Erro SuperFrete:', error)
    return NextResponse.json({ options: [{ id: 'default', name: 'Frete Padrão', price: 25, days: 7, company: 'Correios' }] })
  }
}
