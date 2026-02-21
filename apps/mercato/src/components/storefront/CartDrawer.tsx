"use client"

import { Minus, Plus, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from './CartProvider'

function formatPrice(amount: number, currencyCode: string): string {
  return `${currencyCode} $${amount.toFixed(2)}`
}

const ITEM_TYPE_BADGES: Record<string, { label: string; className: string }> = {
  'postpaid-plan':  { label: 'Postpaid Plan',   className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  'prepaid-bundle': { label: 'Prepaid Bundle',   className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  'device-bundle':  { label: 'Device + Plan',    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
}

export function CartDrawer() {
  const { items, total, currencyCode, isOpen, setIsOpen, updateQuantity, removeItem } = useCart()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      <div className="absolute right-0 top-0 bottom-0 flex w-full max-w-md flex-col bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Your Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close cart"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground">Your cart is empty</p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-4 text-sm font-medium text-primary hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const badge = item.itemType ? ITEM_TYPE_BADGES[item.itemType] : null
                const isPlan = item.itemType === 'postpaid-plan' || item.itemType === 'prepaid-bundle'

                return (
                  <li
                    key={`${item.productId}-${item.variantId ?? 'default'}-${item.planId ?? 'noplan'}`}
                    className="flex gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                          <span className="text-lg font-bold text-muted-foreground/30">
                            {item.title.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                          {badge && (
                            <span className={`inline-block mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium ${badge.className}`}>
                              {badge.label}
                            </span>
                          )}
                          {item.variantName && (
                            <p className="text-xs text-muted-foreground">{item.variantName}</p>
                          )}
                          {item.planName && !isPlan && (
                            <p className="text-xs text-primary">{item.planName}</p>
                          )}
                          {item.itemType === 'postpaid-plan' && (
                            <p className="text-xs text-muted-foreground mt-0.5">${item.price}/mo</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId, item.planId)}
                          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          aria-label={`Remove ${item.title}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        {isPlan ? (
                          <span className="text-[10px] text-muted-foreground">Qty: 1</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1, item.planId)}
                              className="flex size-7 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1, item.planId)}
                              className="flex size-7 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                        )}
                        <span className="text-sm font-semibold text-foreground">
                          {item.itemType === 'postpaid-plan'
                            ? `${item.currencyCode} $${item.price}/mo`
                            : formatPrice((item.price + (item.planPrice ?? 0)) * item.quantity, item.currencyCode)
                          }
                        </span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-foreground">Subtotal</span>
              <span className="text-lg font-bold text-foreground">
                {formatPrice(total, currencyCode)}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
