"use client"

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Plus, Minus, ChevronRight } from 'lucide-react'
import { useCart } from '@/components/storefront/CartProvider'
import type { StorefrontProduct, StorefrontVariant } from '@/components/storefront/types'

interface ProductDetailClientProps {
  product: StorefrontProduct
  imageMap: Record<string, string[]>
}

export function ProductDetailClient({ product, imageMap }: ProductDetailClientProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0] ?? null

  const optionKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const variant of product.variants) {
      for (const key of Object.keys(variant.optionValues)) {
        keys.add(key)
      }
    }
    return Array.from(keys)
  }, [product.variants])

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    if (!defaultVariant) return {}
    return { ...defaultVariant.optionValues }
  })

  const selectedVariant = useMemo<StorefrontVariant | null>(() => {
    if (product.variants.length === 0) return null
    return (
      product.variants.find((v) =>
        Object.entries(selectedOptions).every(
          ([key, value]) => v.optionValues[key] === value,
        ),
      ) ?? defaultVariant
    )
  }, [product.variants, selectedOptions, defaultVariant])

  const activePrice = selectedVariant?.salePrice ?? selectedVariant?.regularPrice ?? product.salePrice ?? product.regularPrice ?? 0
  const originalPrice = selectedVariant?.regularPrice ?? product.regularPrice ?? null
  const hasSale = originalPrice !== null && originalPrice > activePrice
  const currencyCode = selectedVariant?.currencyCode ?? product.currencyCode ?? 'TTD'
  const monthlyPayment = activePrice > 0 ? (activePrice / 3).toFixed(2) : null

  const currentImages = useMemo(() => {
    const colorValue = selectedOptions.Color ?? selectedOptions.color ?? null
    if (colorValue && imageMap[colorValue]) return imageMap[colorValue]
    if (imageMap['_default']) return imageMap['_default']
    const firstKey = Object.keys(imageMap)[0]
    return firstKey ? imageMap[firstKey] : ['/examples/atlas-runner-midnight-1.png']
  }, [selectedOptions, imageMap])

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const activeImage = currentImages[activeImageIndex] ?? currentImages[0]

  function handleOptionSelect(key: string, value: string) {
    setSelectedOptions((prev) => ({ ...prev, [key]: value }))
    setActiveImageIndex(0)
  }

  function handleAddToCart() {
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      title: product.title,
      variantName: selectedVariant?.name ?? null,
      price: activePrice,
      currencyCode,
      imageUrl: currentImages[0] ?? product.defaultMediaUrl,
      handle: product.handle,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const breadcrumbParts = product.categoryPath
    ? product.categoryPath.split(' > ')
    : product.categoryName
      ? [product.categoryName]
      : []

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {breadcrumbParts.length > 0 && (
          <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Shop
            </Link>
            {breadcrumbParts.map((part, index) => (
              <span key={index} className="flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5" />
                <span
                  className={
                    index === breadcrumbParts.length - 1
                      ? 'text-foreground font-medium'
                      : ''
                  }
                >
                  {part}
                </span>
              </span>
            ))}
          </nav>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card">
              <Image
                src={activeImage}
                alt={product.title}
                fill
                className="object-contain p-4"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            {currentImages.length > 1 && (
              <div className="flex gap-3">
                {currentImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative h-20 w-20 overflow-hidden rounded-md border-2 transition-colors ${
                      index === activeImageIndex
                        ? 'border-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-contain p-1"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {product.subtitle && (
              <p className="text-sm font-medium uppercase tracking-wider text-primary">
                {product.subtitle}
              </p>
            )}

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {product.title}
            </h1>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-foreground">
                {currencyCode} ${activePrice.toFixed(2)}
              </span>
              {hasSale && originalPrice !== null && (
                <span className="text-lg text-muted-foreground line-through">
                  {currencyCode} ${originalPrice.toFixed(2)}
                </span>
              )}
              {hasSale && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Sale
                </span>
              )}
            </div>

            {optionKeys.length > 0 && (
              <div className="space-y-4">
                {optionKeys.map((key) => {
                  const values = Array.from(
                    new Set(
                      product.variants
                        .map((v) => v.optionValues[key])
                        .filter(Boolean),
                    ),
                  )
                  return (
                    <div key={key}>
                      <p className="mb-2 text-sm font-medium text-foreground">
                        {key}: <span className="text-muted-foreground">{selectedOptions[key]}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {values.map((value) => (
                          <button
                            key={value}
                            onClick={() => handleOptionSelect(key, value)}
                            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                              selectedOptions[key] === value
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border text-foreground hover:border-primary/50'
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Quantity</p>
              <div className="inline-flex items-center rounded-md border border-border">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-accent transition-colors rounded-l-md"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex h-10 w-12 items-center justify-center border-x border-border text-sm font-medium text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-accent transition-colors rounded-r-md"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  for (let i = 0; i < quantity; i++) handleAddToCart()
                }}
                className={`flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-base font-semibold transition-colors ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                {added ? 'Added to Cart!' : 'Add to Cart'}
              </button>

              {monthlyPayment && (
                <p className="text-center text-sm text-muted-foreground">
                  or finance for{' '}
                  <span className="font-medium text-primary">
                    {currencyCode} ${monthlyPayment}/mo
                  </span>{' '}
                  with TSTT MicroLoan
                </p>
              )}
            </div>

            {product.description && (
              <div className="border-t border-border pt-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
                  Description
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </div>
            )}

            {product.sku && (
              <div className="text-xs text-muted-foreground">
                SKU: {selectedVariant?.sku ?? product.sku}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
