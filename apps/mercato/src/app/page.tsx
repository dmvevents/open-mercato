import { createRequestContainer } from '@open-mercato/shared/lib/di/container'
import type { EntityManager } from '@mikro-orm/postgresql'
import { NavBar } from '@/components/storefront/NavBar'
import { Hero } from '@/components/storefront/Hero'
import { CategoryGrid } from '@/components/storefront/CategoryGrid'
import { ProductGrid } from '@/components/storefront/ProductGrid'
import { Footer } from '@/components/storefront/Footer'
import type { StorefrontProduct } from '@/components/storefront/types'

const DEMO_PRODUCTS: StorefrontProduct[] = [
  {
    id: 'demo-1',
    title: 'Atlas Runner Sneaker - Midnight',
    subtitle: 'Lightweight road sneaker',
    description: null,
    handle: 'atlas-runner-sneaker-midnight',
    sku: 'ATLAS-RUN-MID',
    productType: 'configurable',
    primaryCurrencyCode: 'TTD',
    defaultUnit: 'pair',
    defaultMediaUrl: '/examples/atlas-runner-midnight-1.png',
    isActive: true,
    regularPrice: 168,
    salePrice: 148,
    currencyCode: 'TTD',
    categoryName: 'Footwear',
    categoryPath: 'Fashion > Men > Footwear',
    variantCount: 2,
    variants: [],
  },
  {
    id: 'demo-2',
    title: 'Atlas Runner Sneaker - Glacier',
    subtitle: 'Lightweight road sneaker',
    description: null,
    handle: 'atlas-runner-sneaker-glacier',
    sku: 'ATLAS-RUN-GLA',
    productType: 'configurable',
    primaryCurrencyCode: 'TTD',
    defaultUnit: 'pair',
    defaultMediaUrl: '/examples/atlas-runner-glacier-1.png',
    isActive: true,
    regularPrice: 168,
    salePrice: null,
    currencyCode: 'TTD',
    categoryName: 'Footwear',
    categoryPath: 'Fashion > Men > Footwear',
    variantCount: 2,
    variants: [],
  },
  {
    id: 'demo-3',
    title: 'Aurora Wrap - Rosewood',
    subtitle: 'Elegant evening wrap',
    description: null,
    handle: 'aurora-wrap-rosewood',
    sku: 'AURORA-ROSE',
    productType: 'simple',
    primaryCurrencyCode: 'TTD',
    defaultUnit: 'piece',
    defaultMediaUrl: '/examples/aurora-wrap-rosewood.png',
    isActive: true,
    regularPrice: 245,
    salePrice: 199,
    currencyCode: 'TTD',
    categoryName: 'Fashion',
    categoryPath: 'Fashion > Women > Accessories',
    variantCount: 0,
    variants: [],
  },
  {
    id: 'demo-4',
    title: 'Aurora Wrap - Celestial',
    subtitle: 'Elegant evening wrap',
    description: null,
    handle: 'aurora-wrap-celestial',
    sku: 'AURORA-CEL',
    productType: 'simple',
    primaryCurrencyCode: 'TTD',
    defaultUnit: 'piece',
    defaultMediaUrl: '/examples/aurora-wrap-celestial.png',
    isActive: true,
    regularPrice: 245,
    salePrice: null,
    currencyCode: 'TTD',
    categoryName: 'Fashion',
    categoryPath: 'Fashion > Women > Accessories',
    variantCount: 0,
    variants: [],
  },
  {
    id: 'demo-5',
    title: 'Professional Hairdresser Service',
    subtitle: 'Expert styling and grooming',
    description: null,
    handle: 'hairdresser-service',
    sku: 'SVC-HAIR',
    productType: 'service',
    primaryCurrencyCode: 'TTD',
    defaultUnit: 'session',
    defaultMediaUrl: '/examples/hairdresser-service.png',
    isActive: true,
    regularPrice: 120,
    salePrice: null,
    currencyCode: 'TTD',
    categoryName: 'Services',
    categoryPath: 'Services > Personal Care',
    variantCount: 0,
    variants: [],
  },
  {
    id: 'demo-6',
    title: 'Therapeutic Massage',
    subtitle: 'Full body relaxation massage',
    description: null,
    handle: 'massage-service',
    sku: 'SVC-MASSAGE',
    productType: 'service',
    primaryCurrencyCode: 'TTD',
    defaultUnit: 'session',
    defaultMediaUrl: '/examples/massage-service.png',
    isActive: true,
    regularPrice: 350,
    salePrice: 299,
    currencyCode: 'TTD',
    categoryName: 'Services',
    categoryPath: 'Services > Wellness',
    variantCount: 0,
    variants: [],
  },
]

async function fetchProducts(): Promise<StorefrontProduct[]> {
  try {
    const container = await createRequestContainer()
    const em = container.resolve<EntityManager>('em')
    const connection = em.getConnection()

    const rows = await connection.execute(
      `SELECT p.id, p.title, p.subtitle, p.handle, p.sku, p.product_type,
              p.primary_currency_code, p.default_media_url, p.is_active
       FROM catalog_products p
       WHERE p.is_active = true AND p.deleted_at IS NULL
       ORDER BY p.created_at DESC
       LIMIT 12`
    )

    if (!rows || rows.length === 0) return DEMO_PRODUCTS

    const productIds = rows.map((r: Record<string, unknown>) => r.id as string)

    let priceMap: Record<string, { regularPrice: number | null; salePrice: number | null; currencyCode: string }> = {}
    try {
      const priceRows = await connection.execute(
        `SELECT pp.product_id, pp.currency_code,
                pp.unit_price_gross, pp.kind
         FROM catalog_product_variant_prices pp
         WHERE pp.product_id = ANY($1)
         ORDER BY pp.kind ASC`,
        [productIds]
      )
      for (const pr of priceRows) {
        const pid = pr.product_id as string
        const kind = pr.kind as string
        const price = Number(pr.unit_price_gross)
        const currency = pr.currency_code as string
        if (!priceMap[pid]) {
          priceMap[pid] = { regularPrice: null, salePrice: null, currencyCode: currency }
        }
        if (kind === 'sale') {
          priceMap[pid].salePrice = price
        } else {
          priceMap[pid].regularPrice = price
        }
        priceMap[pid].currencyCode = currency
      }
    } catch {
      // price fetch failed, continue without prices
    }

    let categoryMap: Record<string, { name: string; path: string | null }> = {}
    try {
      const catRows = await connection.execute(
        `SELECT pca.product_id, c.name, c.tree_path
         FROM catalog_product_category_assignments pca
         JOIN catalog_product_categories c ON c.id = pca.category_id
         WHERE pca.product_id = ANY($1)`,
        [productIds]
      )
      for (const cr of catRows) {
        const pid = cr.product_id as string
        if (!categoryMap[pid]) {
          categoryMap[pid] = { name: cr.name as string, path: cr.tree_path as string | null }
        }
      }
    } catch {
      // category fetch failed, continue without categories
    }

    return rows.map((r: Record<string, unknown>) => {
      const pid = r.id as string
      const prices = priceMap[pid]
      const category = categoryMap[pid]
      return {
        id: pid,
        title: r.title as string,
        subtitle: (r.subtitle as string) ?? null,
        description: null,
        handle: (r.handle as string) ?? null,
        sku: (r.sku as string) ?? null,
        productType: r.product_type as string,
        primaryCurrencyCode: (r.primary_currency_code as string) ?? 'TTD',
        defaultUnit: null,
        defaultMediaUrl: (r.default_media_url as string) ?? null,
        isActive: true,
        regularPrice: prices?.regularPrice ?? null,
        salePrice: prices?.salePrice ?? null,
        currencyCode: prices?.currencyCode ?? (r.primary_currency_code as string) ?? 'TTD',
        categoryName: category?.name ?? null,
        categoryPath: category?.path ?? null,
        variantCount: 0,
        variants: [],
      }
    })
  } catch {
    return DEMO_PRODUCTS
  }
}

export default async function StorefrontPage() {
  const products = await fetchProducts()

  return (
    <div className="flex min-h-svh flex-col">
      <NavBar />
      <Hero />
      <CategoryGrid />
      <ProductGrid products={products} />
      <Footer />
    </div>
  )
}
