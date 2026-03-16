import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Usar pdf-parse para extrair texto
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)
    const text = data.text

    const products = parsePriceList(text)

    return NextResponse.json({ products, total: products.length })
  } catch (error: any) {
    console.error('Erro ao parsear PDF:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

interface ParsedProduct {
  sku: string
  name: string
  points: number
  price_consumer: number
  price_25: number
  price_35: number
  price_42: number
  price_50: number
  price_supervisor: number
  category: string
}

function parsePriceList(text: string): ParsedProduct[] {
  const results: ParsedProduct[] = []
  let currentCategory = 'Nutrição Interna'

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  for (const line of lines) {
    // Detectar seção
    if (line.includes('Nutrição Interna') || line.replace(/ /g, '').includes('NutriçãoInterna')) {
      currentCategory = 'Nutrição Interna'
      continue
    }
    if (line.includes('Nutrição Externa') || line.replace(/ /g, '').includes('NutriçãoExterna')) {
      currentCategory = 'Nutrição Externa'
      continue
    }

    // Extrair SKU (começa com 4 caracteres alfanuméricos)
    const skuMatch = line.match(/^([0-9A-Z]{4}[A-Z0-9]?)\s+/)
    if (!skuMatch) continue

    const sku = skuMatch[1]
    const rest = line.substring(skuMatch[0].length)

    // Extrair todos os números da linha
    const numMatches = rest.match(/\d{1,6}[.,]\d{2}/g) || rest.match(/\d+[.,]\d+/g) || []
    const nums = numMatches.map(n => parseFloat(n.replace(',', '.')))

    // Precisamos de pelo menos 7 números:
    // custo_por_pv, pontos, preço_consumidor, 25%, 35%, 42%, 50%
    if (nums.length < 5) continue

    // O nome do produto é o texto antes dos números
    const firstNumIndex = rest.search(/\d{1,6}[.,]\d{2}/)
    const name = firstNumIndex > 0
      ? rest.substring(0, firstNumIndex).trim()
      : rest.replace(/[\d.,]+/g, '').trim()

    if (!name || name.length < 3) continue

    // Mapear os números na ordem da tabela
    // Formato: [custo_pv], pontos_volume, preço_consumidor, 25%, 35%, 42%, 50%, supervisor, custo_pv_final
    // Verificar qual índice tem o "preço sugerido ao consumidor" (valor maior)
    // O preço consumidor é geralmente o maior valor após os pontos

    // Estratégia: ordenar e pegar os maiores valores como preços
    // pontos é sempre o primeiro número grande
    let points = nums[0] || 0
    let consumer = nums[1] || 0
    let p25 = nums[2] || 0
    let p35 = nums[3] || 0
    let p42 = nums[4] || 0
    let p50 = nums[5] || 0
    let supervisor = nums[6] || 0

    // Validação: os preços devem estar em ordem decrescente
    // consumer > 25% > 35% > 42% > 50%
    if (consumer > 0 && p25 > 0 && p25 < consumer) {
      results.push({
        sku,
        name: name.replace(/\s+/g, ' '),
        points,
        price_consumer: consumer,
        price_25: p25,
        price_35: p35,
        price_42: p42,
        price_50: p50,
        price_supervisor: supervisor,
        category: currentCategory,
      })
    }
  }

  return results
}
