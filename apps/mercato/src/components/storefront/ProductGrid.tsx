import { ProductCard } from './ProductCard'
import type { StorefrontProduct } from './types'

export function ProductGrid({ products }: { products: StorefrontProduct[] }) {
  return (
    <section id="products" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="text-lg font-semibold text-foreground mb-6">Featured Products</h2>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <p className="text-muted-foreground">No products yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Products will appear here once they are added to the catalog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
