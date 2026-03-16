'use client'

import { useProductView } from '@/hooks/useProductView'

export default function ProductViewTracker({ productId, customerId }: { productId: string; customerId: string }) {
  useProductView(productId, customerId)
  return null
}
