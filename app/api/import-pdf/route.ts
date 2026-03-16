import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

interface ParsedProduct {
  sku: string
  name: string
  cost_pv: number
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

  const productRegex = /([0-9A-Z]{4}[A-Z0-9]?)\s+(.+?)\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(\d+,\d{2})\s+(\d+,\d{2})/g

  let match
  while ((match = productRegex.exec(text)) !== null) {
    const [, sku, name, costPv, points, consumer, p25, p35, p42, p50, supervisor] = match

    // Filtrar linhas falsas do cabeçalho (SUPER VISOR)
    const cleanName = name.trim().replace(/\s+/g, ' ')
    if (cleanName.includes('VISOR') && cleanName.includes('PV')) continue
    if (cleanName.length < 3) continue

    const parseNum = (s: string) => parseFloat(s.replace(',', '.'))

    // Determinar categoria pela posição no texto
    const posInText = match.index
    const textBefore = text.substring(0, posInText)
    const category = (textBefore.includes('Nutrição Externa') || textBefore.includes('N u t r i ç ã o   E x t e r n a'))
      ? 'Nutrição Externa'
      : 'Nutrição Interna'

    results.push({
      sku: sku.trim(),
      name: cleanName,
      cost_pv: parseNum(costPv),
      points: parseNum(points),
      price_consumer: parseNum(consumer),
      price_25: parseNum(p25),
      price_35: parseNum(p35),
      price_42: parseNum(p42),
      price_50: parseNum(p50),
      price_supervisor: parseNum(supervisor),
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
