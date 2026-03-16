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
}

// Funções utilitárias — chamadas externamente com o estado
export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
}

export function calcTotal(items: CartItem[], couponDiscount: number, shippingPrice: number): number {
  return calcSubtotal(items) - couponDiscount + shippingPrice
}

export function calcItemCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0)
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
          // Produtos de pacote têm nome diferente (ex: "Shake (Pacote 2x)")
          // então usamos nome+id como chave para não conflitar com unitário
          const key = product.name + product.id
          const existing = state.items.find(i => (i.product.name + i.product.id) === key)
          if (existing) {
            return {
              items: state.items.map(i =>
                (i.product.name + i.product.id) === key
                  ? { ...i, quantity: i.quantity + quantity }
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
    }),
    { name: 'cart-storage' }
  )
)
