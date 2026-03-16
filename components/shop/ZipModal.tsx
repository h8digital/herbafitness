'use client'

import { useState, useEffect } from 'react'
import { useShippingZip } from '@/store/shippingZip'

export default function ZipModal() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { zip, setZip } = useShippingZip()

  // Abrir modal apenas se não tiver CEP salvo
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!zip) setOpen(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [zip])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const clean = input.replace(/\D/g, '')
    if (clean.length !== 8) { setError('CEP inválido.'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (data.erro) { setError('CEP não encontrado.'); setLoading(false); return }
      setZip(clean, data.localidade, data.uf)
      setOpen(false)
    } catch {
      setError('Erro ao buscar CEP.')
    }
    setLoading(false)
  }

  function formatInput(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 8)
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-4"
        onClick={() => setOpen(false)}>
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}>

          {/* Header verde */}
          <div className="px-6 pt-6 pb-4" style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)' }}>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">📍</span>
              <div>
                <h2 className="font-black text-white text-lg" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                  Qual o seu CEP?
                </h2>
                <p className="text-green-200 text-xs mt-0.5">
                  Para mostrar o frete nos produtos
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(formatInput(e.target.value))}
                  placeholder="00000-000"
                  className="w-full px-5 py-4 border-2 rounded-2xl text-xl font-mono text-center tracking-widest focus:outline-none transition-colors"
                  style={{ borderColor: error ? '#ef4444' : '#c8e6c9', letterSpacing: '0.15em' }}
                  autoFocus
                  inputMode="numeric"
                />
                {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
              </div>

              <button type="submit" disabled={loading || input.replace(/\D/g,'').length < 8}
                className="w-full font-black text-white py-4 rounded-2xl text-sm transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1B5E20, #4CAF50)' }}>
                {loading ? 'Buscando...' : 'Ver frete nos produtos →'}
              </button>

              <button type="button" onClick={() => setOpen(false)}
                className="w-full text-slate-400 text-sm py-2 hover:text-slate-600 transition-colors">
                Pular por enquanto
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-3">
              Seu CEP é salvo apenas neste dispositivo
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
