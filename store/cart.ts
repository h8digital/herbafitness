'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product, ShippingOption } from '@/types'

interface CartStore {
  items: CartItem[]
  couponCode: string | null
  couponDiscount: number
  selectedShipping: ShippingOption | null
  
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  applyCoupon: (code: string, discount: number) => void
  removeCoupon: () => void
  setShipping: (option: ShippingOption | null) => void
  
  get subtotal(): number
  get total(): number
  get itemCount(): number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,
      selectedShipping: null,

      addItem: (product, quantity = 1) => {
        set(state => {
          const existing = state.items.find(i => i.product.id === product.id)
          if (existing) {
            return {
              items: state.items.map(i =>
                i.product.id === product.id
                  ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { product, quantity }] }
        })
      },

      removeItem: (productId) => {
        set(state => ({ items: state.items.filter(i => i.product.id !== productId) }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set(state => ({
          items: state.items.map(i =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0, selectedShipping: null }),

      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      
      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),
      
      setShipping: (option) => set({ selectedShipping: option }),

      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
      },

      get total() {
        const state = get()
        const shipping = state.selectedShipping?.price || 0
        return state.subtotal - state.couponDiscount + shipping
      },

      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },
    }),
    { name: 'cart-storage' }
  )
)
