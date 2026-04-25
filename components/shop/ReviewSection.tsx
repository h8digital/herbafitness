'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Review {
  id: string
  customer_name: string
  rating: number
  title: string | null
  body: string | null
  verified_purchase: boolean
  created_at: string
}

interface ReviewSectionProps {
  productId: string
  reviews: Review[]
  avgRating: number
  totalReviews: number
}

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`${sz} ${i <= rating ? 'text-amber-400' : 'text-slate-200'}`}
          viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  )
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-500 w-3 text-right">{star}</span>
      <svg className="w-3 h-3 text-amber-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-slate-400 w-4">{count}</span>
    </div>
  )
}

export default function ReviewSection({ productId, reviews, avgRating, totalReviews }: ReviewSectionProps) {
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ rating: 5, title: '', body: '', name: '' })

  // Distribuição das estrelas
  const dist = [5,4,3,2,1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
  }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('product_reviews').insert({
        product_id:    productId,
        customer_id:   user?.id || null,
        customer_name: form.name,
        rating:        form.rating,
        title:         form.title || null,
        body:          form.body || null,
        approved:      false,
      })
      setSubmitted(true)
      setShowForm(false)
    } catch (err) {
      console.error(err)
    }
    setSubmitting(false)
  }

  const ic = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-900" style={{ fontFamily: 'Arial Black, sans-serif' }}>
          Avaliações dos Clientes
        </h2>
        {!showForm && !submitted && (
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#1B5E20' }}>
            Avaliar produto
          </button>
        )}
      </div>

      {/* Resumo */}
      {totalReviews > 0 && (
        <div className="flex gap-6 items-start">
          {/* Nota geral */}
          <div className="flex-shrink-0 text-center">
            <p className="text-5xl font-black text-slate-900">{avgRating.toFixed(1)}</p>
            <Stars rating={Math.round(avgRating)} size="md" />
            <p className="text-xs text-slate-400 mt-1">{totalReviews} avaliação{totalReviews !== 1 ? 'ões' : ''}</p>
          </div>
          {/* Barras */}
          <div className="flex-1 space-y-1.5">
            {dist.map(d => <RatingBar key={d.star} star={d.star} count={d.count} total={totalReviews} />)}
          </div>
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-green-50 border border-green-100 rounded-2xl p-5 space-y-4">
          <p className="font-semibold text-slate-900">Sua avaliação</p>
          {/* Estrelas interativas */}
          <div>
            <p className="text-xs text-slate-500 mb-1.5">Nota *</p>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setForm(f => ({ ...f, rating: s }))}>
                  <svg className={`w-8 h-8 transition-colors ${s <= form.rating ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`}
                    viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Seu nome *</label>
            <input required className={ic} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Como quer ser identificado" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Título</label>
            <input className={ic} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Resumo da sua experiência" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Comentário</label>
            <textarea className={ic} rows={3} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Conte mais sobre o produto..." />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600">
              Cancelar
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: '#1B5E20' }}>
              {submitting ? 'Enviando...' : 'Enviar avaliação'}
            </button>
          </div>
        </form>
      )}

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-green-700 font-semibold">✓ Avaliação enviada!</p>
          <p className="text-xs text-green-600 mt-1">Será publicada após revisão.</p>
        </div>
      )}

      {/* Lista de avaliações */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="border border-slate-100 rounded-2xl p-5 bg-white">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <Stars rating={review.rating} />
                  {review.title && <p className="font-semibold text-slate-900 text-sm mt-1">{review.title}</p>}
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-slate-500">{review.customer_name}</p>
                  <p className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString('pt-BR')}</p>
                  {review.verified_purchase && (
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 mt-1">
                      ✓ Compra verificada
                    </span>
                  )}
                </div>
              </div>
              {review.body && <p className="text-sm text-slate-600 leading-relaxed">{review.body}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <p className="text-3xl mb-2">⭐</p>
          <p className="text-sm">Nenhuma avaliação ainda. Seja o primeiro!</p>
        </div>
      )}
    </div>
  )
}
