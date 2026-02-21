import { createRequestContainer } from '@open-mercato/shared/lib/di/container'
import type { EntityManager } from '@mikro-orm/postgresql'
import { NavBar } from '@/components/storefront/NavBar'
import { Hero } from '@/components/storefront/Hero'
import { CategoryGrid } from '@/components/storefront/CategoryGrid'
import { ProductGrid } from '@/components/storefront/ProductGrid'
import { Footer } from '@/components/storefront/Footer'
import { FeaturedPlans } from '@/components/storefront/FeaturedPlans'
import type { StorefrontProduct } from '@/components/storefront/types'

const DEMO_PRODUCTS: StorefrontProduct[] = [
  {
    id: 'demo-1',
    title: 'iPhone 16 Pro Max',
    subtitle: 'Apple flagship smartphone',
    description: null,
    handle: 'iphone-16-pro-max',
    sku: 'APPLE-IP16PM',
    productType: 'configurable',
    primaryCurrencyCode: 'TTD',
    defaultUnit: 'unit',
    defaultMediaUrl: 'https://images.unsplash.com/photo-1727013884184-b313982327f3?w=800&q=80',
    isActive: true,
    regularPrice: 13499,
    salePrice: null,
    currencyCode: 'TTD',
    categoryName: 'Smartphones',
    categoryPath: 'Smartphones > Apple',
    variantCount: 3,
    variants: [],
  },
  {
    id: 'demo-2',
    title: 'Samsung Galaxy S25 Ultra',
    subtitle: 'Samsung flagship smartphone',
    description: null,
    handle: 'samsung-galaxy-s25-ultra',
    sku: 'SAM-S25U',
    productType: 'configurable',
    primaryCurrencyCode: 'TTD',
    defaultUnit: 'unit',
    defaultMediaUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
    isActive: true,
    regularPrice: 12999,
    salePrice: 11999,
    currencyCode: 'TTD',
    categoryName: 'Smartphones',
    categoryPath: 'Smartphones > Samsung',
    variantCount: 3,
    variants: [],
  },
  {
    id: 'demo-3',
    title: 'Google Pixel 9 Pro',
    subtitle: 'Google AI-powered smartphone',
    description: null,
    handle: 'google-pixel-9-pro',
    sku: 'GOOG-PX9P',
    productType: 'configurable',
    primaryCurrencyCode: 'TTD',
    defaultUnit: 'unit',
    defaultMediaUrl: 'https://images.unsplash.com/photo-1724438192720-c19a90e24a69?w=800&q=80',
    isActive: true,
    regularPrice: 8999,
    salePrice: null,
    currencyCode: 'TTD',
    categoryName: 'Smartphones',
    categoryPath: 'Smartphones > Google',
    variantCount: 2,
    variants: [],
  },
  {
    id: 'demo-4',
    title: 'iPhone 16',
    subtitle: 'Apple smartphone',
    description: null,
    handle: 'iphone-16',
    sku: 'APPLE-IP16',
    productType: 'configurable',
    primaryCurrencyCode: 'TTD',
    defaultUnit: 'unit',
    defaultMediaUrl: 'https://images.unsplash.com/photo-1727093493770-7e25186d4d0a?w=800&q=80',
    isActive: true,
    regularPrice: 7999,
    salePrice: 7499,
    currencyCode: 'TTD',
    categoryName: 'Smartphones',
    categoryPath: 'Smartphones > Apple',
    variantCount: 3,
    variants: [],
  },
  {
    id: 'demo-5',
    title: 'Samsung Galaxy A55',
    subtitle: 'Samsung mid-range smartphone',
    description: null,
    handle: 'samsung-galaxy-a55',
    sku: 'SAM-A55',
    productType: 'configurable',
    primaryCurrencyCode: 'TTD',
    defaultUnit: 'unit',
    defaultMediaUrl: 'https://images.unsplash.com/photo-1723054072995-af2b91c5cbb6?w=800&q=80',
    isActive: true,
    regularPrice: 3499,
    salePrice: 2999,
    currencyCode: 'TTD',
    categoryName: 'Smartphones',
    categoryPath: 'Smartphones > Samsung',
    variantCount: 2,
    variants: [],
  },
  {
    id: 'demo-6',
    title: 'Xiaomi Redmi Note 14 Pro',
    subtitle: 'Xiaomi value smartphone',
    description: null,
    handle: 'xiaomi-redmi-note-14-pro',
    sku: 'XIAO-RN14P',
    productType: 'configurable',
    primaryCurrencyCode: 'TTD',
    defaultUnit: 'unit',
    defaultMediaUrl: 'https://images.unsplash.com/photo-1624947216381-b994eb54e9b7?w=800&q=80',
    isActive: true,
    regularPrice: 3299,
    salePrice: null,
    currencyCode: 'TTD',
    categoryName: 'Smartphones',
    categoryPath: 'Smartphones > Xiaomi',
    variantCount: 2,
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
      <FeaturedPlans />
      <Footer />
    </div>
  )
}
