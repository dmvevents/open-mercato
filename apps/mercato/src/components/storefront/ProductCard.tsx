"use client"

import { ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from './CartProvider'
import type { StorefrontProduct } from './types'

function formatPrice(amount: number, currencyCode: string): string {
  return `${currencyCode} $${amount.toFixed(2)}`
}

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const { addItem } = useCart()

  const displayPrice = product.salePrice ?? product.regularPrice ?? 0
  const hasDiscount = product.salePrice !== null && product.regularPrice !== null && product.salePrice < product.regularPrice
  const currency = product.currencyCode || product.primaryCurrencyCode || 'TTD'

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: null,
      title: product.title,
      variantName: null,
      price: displayPrice,
      currencyCode: currency,
      imageUrl: product.defaultMediaUrl,
      handle: product.handle,
      planId: null,
      planName: null,
      planPrice: 0,
      itemType: 'device',
    })
  }

  return (
    <div className="group flex flex-col rounded-lg border border-border bg-card overflow-hidden transition-all hover:shadow-lg">
      <Link href={product.handle ? `/shop/${product.handle}` : '#'} className="contents">
        <div className="relative aspect-square overflow-hidden bg-muted cursor-pointer">
          {product.defaultMediaUrl ? (
            <Image
              src={product.defaultMediaUrl}
              alt={product.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
              <span className="text-3xl font-bold text-muted-foreground/30">
                {product.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col p-4 pb-0">
          {product.categoryName && (
            <span className="text-xs font-medium text-primary mb-1 uppercase tracking-wide">
              {product.categoryName}
            </span>
          )}

          <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2">
            {product.title}
          </h3>
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-4 pb-4">
        <div className="mt-auto flex items-baseline gap-2 mb-1">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(displayPrice, currency)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.regularPrice!, currency)}
            </span>
          )}
        </div>

        {displayPrice >= 3000 && (
          <p className="text-xs text-muted-foreground mb-3">
            from {currency} ${(() => {
              const bundlePrice = displayPrice + 3500 // Standard plan
              const r = 0.0125
              const n = 8
              const pmt = bundlePrice * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
              return pmt.toFixed(0)
            })()}/mo with 2-Year Plan
          </p>
        )}

        {displayPrice < 3000 && <div className="mb-3" />}

        <button
          onClick={handleAddToCart}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          <ShoppingCart className="size-4" />
          Add to Cart
        </button>
      </div>
    </div>
  )
}
