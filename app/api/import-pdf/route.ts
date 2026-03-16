import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

interface ParsedProduct {
  sku: string
  name: string
  price_consumer: number  // Preço de venda (Sugerido ao Consumidor)
  price_cost: number      // Seu custo (50% de desconto)
  price_25: number
  price_35: number
  price_42: number
  points: number
  category: string
}

function parsePriceList(text: string): ParsedProduct[] {
  const results: ParsedProduct[] = []

  // Formato da tabela:
  // SKU Nome  custo_pv  pontos  25%  35%  42%  50%  supervisor  custo_pv_final
  const productRegex = /([0-9A-Z]{4}[A-Z0-9]?)\s+(.+?)\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(\d+,\d{2})/g

  let match
  while ((match = productRegex.exec(text)) !== null) {
    const [, sku, name, , points, p25, p35, p42, p50, supervisor] = match

    const cleanName = name.trim().replace(/\s+/g, ' ')
    if (cleanName.includes('VISOR') && cleanName.includes('PV')) continue
    if (cleanName.length < 3) continue

    const parseNum = (s: string) => parseFloat(s.replace(',', '.'))

    // Determinar categoria pela posição
    const posInText = match.index
    const textBefore = text.substring(0, posInText)
    const category = (textBefore.includes('Nutrição Externa') || textBefore.includes('N u t r i ç ã o   E x t e r n a'))
      ? 'Nutrição Externa'
      : 'Nutrição Interna'

    // O preço de venda é o supervisor (que no PDF aparece como coluna "Preço Sugerido ao Consumidor")
    // A ordem das colunas no PDF: custo_pv | pontos | 25% | 35% | 42% | 50% | supervisor | custo_pv
    // O "supervisor" aqui é na verdade o Preço Sugerido ao Consumidor
    const consumerPrice = parseNum(supervisor)
    const costPrice50 = parseNum(p50)

    results.push({
      sku: sku.trim(),
      name: cleanName,
      price_consumer: consumerPrice,
      price_cost: costPrice50,
      price_25: parseNum(p25),
      price_35: parseNum(p35),
      price_42: parseNum(p42),
      points: parseNum(points),
      category,
    })
  }

  return results
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const PDFParser = require('pdf2json')

    const text: string = await new Promise((resolve, reject) => {
      const parser = new PDFParser()
      parser.on('pdfParser_dataReady', (data: any) => {
        let fullText = ''
        for (const page of data.Pages || []) {
          for (const textItem of page.Texts || []) {
            for (const r of textItem.R || []) {
              try { fullText += decodeURIComponent(r.T) + ' ' } catch { fullText += r.T + ' ' }
            }
          }
          fullText += '\n'
        }
        resolve(fullText)
      })
      parser.on('pdfParser_dataError', (err: any) => reject(new Error(err.parserError || 'Erro ao parsear PDF')))
      parser.parseBuffer(buffer)
    })

    const products = parsePriceList(text)

    if (products.length === 0) {
      return NextResponse.json({ error: 'Nenhum produto encontrado. Verifique se é a lista de preços correta.' }, { status: 400 })
    }

    return NextResponse.json({ products, total: products.length })
  } catch (error: any) {
    console.error('Erro ao parsear PDF:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
