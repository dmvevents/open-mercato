"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { CartItem } from './types'

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  total: number
  currencyCode: string
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string, variantId: string | null, planId?: string | null) => void
  updateQuantity: (productId: string, variantId: string | null, quantity: number, planId?: string | null) => void
  clearCart: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextValue | null>(null)

const CART_STORAGE_KEY = 'tstt-marketplace-cart'

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (!stored) return []
    const items = JSON.parse(stored) as CartItem[]
    // Migrate legacy items missing plan fields or itemType
    return items.map(item => ({
      ...item,
      planId: item.planId ?? null,
      planName: item.planName ?? null,
      planPrice: item.planPrice ?? 0,
      itemType: item.itemType ?? 'device',
    }))
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore storage errors
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setItems(loadCart())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) saveCart(items)
  }, [items, hydrated])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    const normalized = {
      ...item,
      planId: item.planId ?? null,
      planName: item.planName ?? null,
      planPrice: item.planPrice ?? 0,
      itemType: item.itemType ?? 'device' as const,
    }
    setItems(prev => {
      const existing = prev.find(
        i => i.productId === normalized.productId && i.variantId === normalized.variantId && i.planId === normalized.planId
      )
      if (existing) {
        return prev.map(i =>
          i.productId === normalized.productId && i.variantId === normalized.variantId && i.planId === normalized.planId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { ...normalized, quantity: 1 }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((productId: string, variantId: string | null, planId?: string | null) => {
    setItems(prev => prev.filter(
      i => !(i.productId === productId && i.variantId === variantId && (planId === undefined || i.planId === planId))
    ))
  }, [])

  const updateQuantity = useCallback((productId: string, variantId: string | null, quantity: number, planId?: string | null) => {
    if (quantity <= 0) {
      removeItem(productId, variantId, planId)
      return
    }
    setItems(prev => prev.map(i =>
      i.productId === productId && i.variantId === variantId && (planId === undefined || i.planId === planId)
        ? { ...i, quantity }
        : i
    ))
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const total = items.reduce((sum, i) => sum + (i.price + (i.planPrice ?? 0)) * i.quantity, 0)
  const currencyCode = items[0]?.currencyCode ?? 'TTD'

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      total,
      currencyCode,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isOpen,
      setIsOpen,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
