'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface WishlistButtonProps {
  productId: string
  initialFavorited?: boolean
  size?: 'sm' | 'md'
}

export default function WishlistButton({ productId, initialFavorited = false, size = 'md' }: WishlistButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()
  const router = useRouter()

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    startTransition(async () => {
      if (favorited) {
        await supabase.from('wishlist')
          .delete()
          .eq('customer_id', user.id)
          .eq('product_id', productId)
        setFavorited(false)
      } else {
        await supabase.from('wishlist')
          .upsert({ customer_id: user.id, product_id: productId })
        setFavorited(true)
      }
      router.refresh()
    })
  }

  const wh = size === 'sm' ? 28 : 34

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      title={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      className="flex items-center justify-center rounded-full transition-all active:scale-90 disabled:opacity-60"
      style={{
        width: wh,
        height: wh,
        background: favorited ? '#fef2f2' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 1px 6px rgba(0,0,0,0.12)',
        border: favorited ? '1.5px solid #fca5a5' : '1.5px solid rgba(255,255,255,0.6)',
      }}>
      <svg
        style={{ width: size === 'sm' ? 14 : 17, height: size === 'sm' ? 14 : 17 }}
        viewBox="0 0 24 24"
        fill={favorited ? '#ef4444' : 'none'}
        stroke={favorited ? '#ef4444' : '#9ca3af'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isPending ? 'animate-pulse' : ''}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}
