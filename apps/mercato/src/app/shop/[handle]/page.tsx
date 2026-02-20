import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductDetailClient } from './ProductDetailClient'
import type { StorefrontProduct, StorefrontVariant } from '@/components/storefront/types'

interface ProductRow {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  handle: string | null
  sku: string | null
  product_type: string
  primary_currency_code: string | null
  default_unit: string | null
  default_media_url: string | null
  is_active: boolean
}

interface VariantRow {
  id: string
  name: string
  sku: string | null
  option_values: Record<string, string> | null
  is_default: boolean
}

interface PriceRow {
  variant_id: string | null
  product_id: string | null
  regular_amount: number | null
  sale_amount: number | null
  currency_code: string
}

interface CategoryRow {
  name: string
  path: string | null
}

const DEMO_PRODUCT: StorefrontProduct = {
  id: 'demo-atlas-runner',
  title: 'Atlas Runner Sneaker',
  subtitle: 'Lightweight Performance Shoe',
  description:
    'The Atlas Runner is a premium lightweight sneaker designed for everyday comfort and performance. Features breathable mesh upper, responsive cushioning, and a durable rubber outsole. Available in Midnight and Glacier colorways.',
  handle: 'atlas-runner-sneaker',
  sku: 'ATL-RUN-001',
  productType: 'configurable',
  primaryCurrencyCode: 'TTD',
  defaultUnit: null,
  defaultMediaUrl: '/examples/atlas-runner-midnight-1.png',
  isActive: true,
  regularPrice: 168,
  salePrice: 148,
  currencyCode: 'TTD',
  categoryName: 'Footwear',
  categoryPath: 'Fashion > Men > Footwear',
  variantCount: 2,
  variants: [
    {
      id: 'demo-midnight',
      name: 'Midnight',
      sku: 'ATL-RUN-MID',
      optionValues: { Color: 'Midnight' },
      isDefault: true,
      regularPrice: 168,
      salePrice: 148,
      currencyCode: 'TTD',
    },
    {
      id: 'demo-glacier',
      name: 'Glacier',
      sku: 'ATL-RUN-GLC',
      optionValues: { Color: 'Glacier' },
      isDefault: false,
      regularPrice: 168,
      salePrice: 148,
      currencyCode: 'TTD',
    },
  ],
}

const VARIANT_IMAGES: Record<string, string[]> = {
  Midnight: ['/examples/atlas-runner-midnight-1.png', '/examples/atlas-runner-midnight-2.png'],
  Glacier: ['/examples/atlas-runner-glacier-1.png', '/examples/atlas-runner-glacier-2.png'],
}

function isValidHandle(handle: string): boolean {
  return /^[a-zA-Z0-9-]+$/.test(handle)
}

async function fetchProduct(handle: string): Promise<StorefrontProduct | null> {
  if (!isValidHandle(handle)) return null

  try {
    const { createRequestContainer } = await import(
      '@open-mercato/shared/lib/di/container'
    )
    const container = await createRequestContainer()
    const em = container.resolve<any>('em')
    const connection = em.getConnection()

    const productRows: ProductRow[] = await connection.execute(
      `SELECT p.id, p.title, p.subtitle, p.description, p.handle, p.sku,
              p.product_type, p.primary_currency_code, p.default_unit,
              p.default_media_url, p.is_active
       FROM catalog_products p
       WHERE p.handle = ? AND p.deleted_at IS NULL
       LIMIT 1`,
      [handle],
    )

    if (!productRows.length) return null
    const row = productRows[0]

    let categoryName: string | null = null
    let categoryPath: string | null = null
    try {
      const categoryRows: CategoryRow[] = await connection.execute(
        `SELECT c.name, c.path
         FROM catalog_categories c
         JOIN catalog_product_categories pc ON pc.category_id = c.id
         WHERE pc.product_id = ? AND c.deleted_at IS NULL
         LIMIT 1`,
        [row.id],
      )
      if (categoryRows.length) {
        categoryName = categoryRows[0].name
        categoryPath = categoryRows[0].path
      }
    } catch {
      // categories may not exist
    }

    const variantRows: VariantRow[] = await connection.execute(
      `SELECT v.id, v.name, v.sku, v.option_values, v.is_default
       FROM catalog_variants v
       WHERE v.product_id = ? AND v.deleted_at IS NULL
       ORDER BY v.is_default DESC, v.name ASC`,
      [row.id],
    )

    const allIds = [row.id, ...variantRows.map((v) => v.id)]
    const placeholders = allIds.map(() => '?').join(',')
    const priceRows: PriceRow[] = await connection.execute(
      `SELECT pr.variant_id, pr.product_id, pr.regular_amount, pr.sale_amount, pr.currency_code
       FROM catalog_prices pr
       WHERE (pr.product_id IN (${placeholders}) OR pr.variant_id IN (${placeholders}))
         AND pr.deleted_at IS NULL
       ORDER BY pr.variant_id NULLS LAST`,
      [...allIds, ...allIds],
    )

    const productPrice = priceRows.find(
      (p) => p.product_id === row.id && !p.variant_id,
    )

    const variants: StorefrontVariant[] = variantRows.map((v) => {
      const variantPrice = priceRows.find((p) => p.variant_id === v.id)
      const price = variantPrice ?? productPrice
      return {
        id: v.id,
        name: v.name,
        sku: v.sku,
        optionValues: v.option_values ?? {},
        isDefault: v.is_default,
        regularPrice: price?.regular_amount ?? null,
        salePrice: price?.sale_amount ?? null,
        currencyCode: price?.currency_code ?? row.primary_currency_code ?? 'TTD',
      }
    })

    return {
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      handle: row.handle,
      sku: row.sku,
      productType: row.product_type,
      primaryCurrencyCode: row.primary_currency_code,
      defaultUnit: row.default_unit,
      defaultMediaUrl: row.default_media_url,
      isActive: row.is_active,
      regularPrice: productPrice?.regular_amount ?? variants[0]?.regularPrice ?? null,
      salePrice: productPrice?.sale_amount ?? variants[0]?.salePrice ?? null,
      currencyCode:
        productPrice?.currency_code ?? row.primary_currency_code ?? 'TTD',
      categoryName,
      categoryPath,
      variantCount: variants.length,
      variants,
    }
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const product = await fetchProduct(handle)
  if (!product) {
    return { title: 'Product Not Found | TSTT Marketplace' }
  }
  return {
    title: `${product.title} | TSTT Marketplace`,
    description: product.description ?? product.subtitle ?? undefined,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params

  let product = await fetchProduct(handle)

  if (!product) {
    if (handle === 'atlas-runner-sneaker' || handle === 'demo') {
      product = DEMO_PRODUCT
    } else {
      notFound()
    }
  }

  const imageMap: Record<string, string[]> = {}
  if (product.id.startsWith('demo')) {
    Object.assign(imageMap, VARIANT_IMAGES)
  } else if (product.defaultMediaUrl) {
    imageMap['_default'] = [product.defaultMediaUrl]
    for (const variant of product.variants) {
      const colorValue =
        variant.optionValues?.Color ?? variant.optionValues?.color ?? null
      if (colorValue) {
        const slug = colorValue.toLowerCase().replace(/\s+/g, '-')
        const handleBase = product.handle ?? product.id
        imageMap[colorValue] = [
          `/examples/${handleBase}-${slug}-1.png`,
          `/examples/${handleBase}-${slug}-2.png`,
        ]
      }
    }
  }

  if (Object.keys(imageMap).length === 0 && product.defaultMediaUrl) {
    imageMap['_default'] = [product.defaultMediaUrl]
  }
  if (Object.keys(imageMap).length === 0) {
    imageMap['_default'] = ['/examples/atlas-runner-midnight-1.png']
  }

  return <ProductDetailClient product={product} imageMap={imageMap} />
}
