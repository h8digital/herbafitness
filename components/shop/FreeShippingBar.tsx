'use client'

import { useEffect, useRef, useState } from 'react'
import { useCartStore, calcSubtotal } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'

interface FreeShippingBarProps {
  threshold: number
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  life: number
  size: number
  shape: 'circle' | 'star'
}

const COLORS = ['#4CAF50', '#FFD700', '#FF6B35', '#A855F7', '#06B6D4', '#F43F5E', '#84CC16', '#FBBF24']

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI / 2.5) * i - Math.PI / 2
    const b = a + Math.PI / 5
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
    ctx.lineTo(cx + Math.cos(b) * r * 0.45, cy + Math.sin(b) * r * 0.45)
  }
  ctx.closePath()
  ctx.fill()
}

function spawnBurst(particles: Particle[], idRef: { current: number }, cx: number, cy: number) {
  const count = 60
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3
    const speed = 2.5 + Math.random() * 4
    particles.push({
      id: idRef.current++,
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
      size: 3 + Math.random() * 4,
      shape: Math.random() > 0.5 ? 'circle' : 'star',
    })
  }
}

function runAnimation(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  particles: Particle[],
  rafRef: { current: number },
) {
  ctx.clearRect(0, 0, w, h)
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.12
    p.vx *= 0.97
    p.life -= 0.018
    if (p.life <= 0.02) { particles.splice(i, 1); continue }
    ctx.globalAlpha = p.life
    ctx.fillStyle = p.color
    if (p.shape === 'star') {
      drawStar(ctx, p.x, p.y, p.size)
    } else {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1
  if (particles.length > 0) {
    rafRef.current = requestAnimationFrame(() => runAnimation(ctx, w, h, particles, rafRef))
  }
}

function FireworksCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const idRef = useRef(0)

  useEffect(() => {
    if (!active) return
    const el = canvasRef.current
    if (!el) return
    const ctx = el.getContext('2d')
    if (!ctx) return

    el.width = window.innerWidth
    el.height = window.innerHeight
    const w = el.width
    const h = el.height

    const particles: Particle[] = []

    const positions = [
      { x: w * 0.25, y: h * 0.35 },
      { x: w * 0.55, y: h * 0.25 },
      { x: w * 0.80, y: h * 0.40 },
    ]

    positions.forEach((pos, i) => {
      setTimeout(() => spawnBurst(particles, idRef, pos.x, pos.y), i * 220)
    })
    setTimeout(() => {
      positions.forEach((pos, i) => {
        setTimeout(() => spawnBurst(particles, idRef, pos.x + 30, pos.y + 40), i * 180)
      })
    }, 700)

    // Começa a animação após a primeira explosão aparecer
    setTimeout(() => {
      rafRef.current = requestAnimationFrame(() => runAnimation(ctx, w, h, particles, rafRef))
    }, 50)

    return () => cancelAnimationFrame(rafRef.current)
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}

export default function FreeShippingBar({ threshold }: FreeShippingBarProps) {
  const items = useCartStore(s => s.items)
  const subtotal = calcSubtotal(items)
  const [celebrated, setCelebrated] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const prevRef = useRef(0)

  const reached = subtotal >= threshold
  const progress = Math.min((subtotal / threshold) * 100, 100)
  const remaining = Math.max(threshold - subtotal, 0)

  useEffect(() => {
    if (reached && !celebrated && prevRef.current < threshold) {
      setCelebrated(true)
      setShowFireworks(true)
      setTimeout(() => setShowFireworks(false), 3500)
    }
    if (!reached && subtotal < prevRef.current) {
      setCelebrated(false)
    }
    prevRef.current = subtotal
  }, [subtotal, reached, celebrated, threshold])

  if (items.length === 0) return null

  return (
    <>
      <FireworksCanvas active={showFireworks} />

      {showFireworks && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none">
          <div
            className="bg-white rounded-3xl px-8 py-6 text-center max-w-xs mx-4"
            style={{
              boxShadow: '0 20px 60px rgba(27,94,32,0.25)',
              border: '2px solid #4CAF50',
              animation: 'bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            <div className="text-5xl mb-2">🎉</div>
            <p className="font-black text-xl text-slate-900 mb-1" style={{ fontFamily: 'Arial Black, sans-serif' }}>
              Parabéns!
            </p>
            <p className="text-sm font-semibold" style={{ color: '#1B5E20' }}>
              Você garantiu o <strong>frete grátis!</strong>
            </p>
          </div>
        </div>
      )}

      <div className={`mx-4 mb-3 rounded-2xl px-4 py-3 transition-all ${
        reached ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-100'
      }`}>
        {reached ? (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🚚</span>
            <p className="text-sm font-bold" style={{ color: '#1B5E20' }}>Frete grátis garantido!</p>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🚚</span>
              <p className="text-xs text-slate-600">
                Falta <span className="font-bold text-slate-900">{formatCurrency(remaining)}</span> para frete grátis
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">{formatCurrency(threshold)} mín.</p>
          </div>
        )}

        <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: '#e5e7eb' }}>
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background: reached
                ? 'linear-gradient(90deg, #16a34a, #4ade80)'
                : progress > 60
                ? 'linear-gradient(90deg, #1B5E20, #4CAF50)'
                : 'linear-gradient(90deg, #4CAF50, #86efac)',
            }}
          />
        </div>

        <div className="relative mt-1" style={{ height: 14 }}>
          <div
            className="absolute transition-all duration-700 ease-out text-sm"
            style={{ left: `${Math.max(Math.min(progress, 95), 0)}%`, transform: 'translateX(-50%)' }}
          >
            {reached ? '✅' : '🚚'}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounceIn {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </>
  )
}
