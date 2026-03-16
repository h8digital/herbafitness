import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

interface ParsedProduct {
  sku: string
  name: string
  price_consumer: number   // C2: Preço Sugerido ao Consumidor
  price_25: number         // C3: 25% desconto
  price_35: number         // C4: 35% desconto
  price_42: number         // C5: 42% desconto
  price_50: number         // C6: 50% desconto
  price_supervisor: number // C7: Supervisor
  points: number
  category: string
}

function parsePriceList(text: string): ParsedProduct[] {
  const results: ParsedProduct[] = []

  // Ordem real do PDF: SKU Nome custo_pv(C1) consumidor(C2) 25%(C3) 35%(C4) 42%(C5) 50%(C6) supervisor(C7) custo_pv_final(C8)
  const productRegex = /([0-9A-Z]{4}[A-Z0-9]?)\s+(.+?)\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(\d+,\d{2})/g

  let match
  while ((match = productRegex.exec(text)) !== null) {
    const [, sku, name, , consumer, p25, p35, p42, p50, supervisor] = match

    const cleanName = name.trim().replace(/\s+/g, ' ')
    if (cleanName.includes('VISOR') && cleanName.includes('PV')) continue
    if (cleanName.length < 3) continue

    const parseNum = (s: string) => parseFloat(s.replace(',', '.'))

    const posInText = match.index
    const textBefore = text.substring(0, posInText)
    const category = (textBefore.includes('Nutrição Externa') || textBefore.includes('N u t r i ç ã o   E x t e r n a'))
      ? 'Nutrição Externa'
      : 'Nutrição Interna'

    results.push({
      sku: sku.trim(),
      name: cleanName,
      price_consumer: parseNum(consumer),  // R$ 105,00 para 0009
      price_25: parseNum(p25),             // R$ 86,91
      price_35: parseNum(p35),             // R$ 81,12
      price_42: parseNum(p42),             // R$ 77,07
      price_50: parseNum(p50),             // R$ 72,43
      price_supervisor: parseNum(supervisor),
      points: parseNum(consumer),
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
