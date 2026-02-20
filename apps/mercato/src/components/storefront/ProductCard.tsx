"use client"

import { ShoppingCart } from 'lucide-react'
import Image from 'next/image'
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
    })
  }

  return (
    <div className="group flex flex-col rounded-lg border border-border bg-card overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
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

      <div className="flex flex-1 flex-col p-4">
        {product.categoryName && (
          <span className="text-xs font-medium text-primary mb-1 uppercase tracking-wide">
            {product.categoryName}
          </span>
        )}

        <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2">
          {product.title}
        </h3>

        <div className="mt-auto flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(displayPrice, currency)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.regularPrice!, currency)}
            </span>
          )}
        </div>

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
