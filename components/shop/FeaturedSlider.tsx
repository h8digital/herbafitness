'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface FeaturedProduct {
  id: string
  name: string
  slug: string
  price: number
  short_description?: string | null
  images?: { url: string }[]
  categories?: { name: string } | null
}

export default function FeaturedSlider({ products }: { products: FeaturedProduct[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent(c => (c + 1) % products.length), [products.length])
  const prev = () => setCurrent(c => (c - 1 + products.length) % products.length)

  useEffect(() => {
    if (paused || products.length <= 1) return
    const t = setInterval(next, 4500)
    return () => clearInterval(t)
  }, [paused, next, products.length])

  if (!products.length) return null

  const p = products[current]
  const GRADIENTS = [
    'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)',
    'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%)',
    'linear-gradient(135deg, #4A148C 0%, #6A1B9A 50%, #7B1FA2 100%)',
    'linear-gradient(135deg, #BF360C 0%, #D84315 50%, #E64A19 100%)',
    'linear-gradient(135deg, #004D40 0%, #00695C 50%, #00796B 100%)',
  ]

  return (
    <div
      className="relative overflow-hidden"
      style={{ background: GRADIENTS[current % GRADIENTS.length], minHeight: 180, transition: 'background 0.6s ease' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative px-5 pt-5 pb-14 lg:px-8 lg:pt-7 lg:pb-16">
        <div key={p.id} style={{ animation: 'slideIn 0.4s ease' }} className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            {(p.categories as any)?.name && (
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">
                {(p.categories as any).name}
              </p>
            )}
            <p className="text-white font-black text-lg lg:text-2xl leading-tight line-clamp-2"
              style={{ fontFamily: 'Arial Black, sans-serif' }}>{p.name}</p>
            {p.short_description && (
              <p className="text-white/80 text-xs mt-1 line-clamp-2 hidden sm:block">{p.short_description}</p>
            )}
            <p className="text-white/90 font-black text-xl mt-2 lg:text-2xl">{formatCurrency(p.price)}</p>
            <Link href={`/shop/products/${p.slug}`}
              className="mt-3 inline-flex items-center gap-1.5 bg-white text-xs lg:text-sm font-bold px-4 py-2 rounded-xl transition-all hover:scale-105"
              style={{ color: '#1B5E20' }}>
              Ver produto
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {p.images?.[0]?.url && (
            <div className="flex-shrink-0 w-28 h-28 lg:w-40 lg:h-40">
              <img src={p.images[0].url} alt={p.name}
                className="w-full h-full object-contain"
                style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))' }} />
            </div>
          )}
        </div>
      </div>

      {products.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/35 transition-colors">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/35 transition-colors">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {products.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className="rounded-full transition-all"
                style={{ width: i === current ? 20 : 6, height: 6, background: i === current ? '#fff' : 'rgba(255,255,255,0.4)' }} />
            ))}
          </div>
        </>
      )}
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
    </div>
  )
}
