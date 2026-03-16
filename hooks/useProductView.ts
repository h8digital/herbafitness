'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useProductView(productId: string, customerId: string) {
  const supabase = createClient()

  useEffect(() => {
    if (!productId || !customerId) return

    // Registrar view (upsert para não duplicar)
    supabase.from('product_views').upsert(
      { customer_id: customerId, product_id: productId, viewed_at: new Date().toISOString() },
      { onConflict: 'customer_id,product_id' }
    ).then()
  }, [productId, customerId])
}
