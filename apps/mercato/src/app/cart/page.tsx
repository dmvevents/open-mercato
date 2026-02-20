"use client"

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, CreditCard } from 'lucide-react'
import { useCart } from '@/components/storefront/CartProvider'

export default function CartPage() {
  const { items, itemCount, total, currencyCode, updateQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <main className="min-h-svh bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Your cart is empty</h1>
              <p className="mt-2 text-muted-foreground">
                Looks like you haven't added anything yet.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Shopping Cart
          </h1>
          <span className="text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="divide-y divide-border rounded-lg border border-border bg-card">
              {items.map((item) => {
                const itemKey = `${item.productId}-${item.variantId ?? 'default'}`
                return (
                  <div key={itemKey} className="flex gap-4 p-4 sm:p-6">
                    <Link
                      href={item.handle ? `/shop/${item.handle}` : '#'}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-background sm:h-24 sm:w-24"
                    >
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-contain p-1"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div className="flex-1">
                        <Link
                          href={item.handle ? `/shop/${item.handle}` : '#'}
                          className="text-sm font-medium text-foreground hover:text-primary transition-colors sm:text-base"
                        >
                          {item.title}
                        </Link>
                        {item.variantName && (
                          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                            {item.variantName}
                          </p>
                        )}
                        <p className="mt-1 text-sm font-medium text-foreground sm:hidden">
                          {item.currencyCode} ${item.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="hidden text-right sm:block">
                          <p className="text-sm font-medium text-foreground">
                            {item.currencyCode} ${item.price.toFixed(2)}
                          </p>
                        </div>

                        <div className="inline-flex items-center rounded-md border border-border">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.variantId, item.quantity - 1)
                            }
                            className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-accent transition-colors rounded-l-md"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="flex h-8 w-10 items-center justify-center border-x border-border text-xs font-medium text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.variantId, item.quantity + 1)
                            }
                            className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-accent transition-colors rounded-r-md"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <p className="w-24 text-right text-sm font-semibold text-foreground">
                          {item.currencyCode} ${(item.price * item.quantity).toFixed(2)}
                        </p>

                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {currencyCode} ${total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Delivery</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">FREE</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-foreground">Total</span>
                    <span className="text-base font-bold text-foreground">
                      {currencyCode} ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Proceed to Checkout
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <CreditCard className="h-3.5 w-3.5" />
                <span>Finance with TSTT MicroLoan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
