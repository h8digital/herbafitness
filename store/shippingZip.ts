'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ShippingZipStore {
  zip: string | null
  city: string | null
  state: string | null
  setZip: (zip: string, city: string, state: string) => void
  clearZip: () => void
}

export const useShippingZip = create<ShippingZipStore>()(
  persist(
    (set) => ({
      zip: null,
      city: null,
      state: null,
      setZip: (zip, city, state) => set({ zip, city, state }),
      clearZip: () => set({ zip: null, city: null, state: null }),
    }),
    { name: 'shipping-zip' }
  )
)
