import { Monitor, Shirt, Home, Wrench, UtensilsCrossed, Heart } from 'lucide-react'
import type { ReactNode } from 'react'

interface Category {
  name: string
  icon: ReactNode
}

const CATEGORIES: Category[] = [
  { name: 'Electronics', icon: <Monitor className="size-6" /> },
  { name: 'Fashion', icon: <Shirt className="size-6" /> },
  { name: 'Home & Garden', icon: <Home className="size-6" /> },
  { name: 'Services', icon: <Wrench className="size-6" /> },
  { name: 'Food & Grocery', icon: <UtensilsCrossed className="size-6" /> },
  { name: 'Health & Beauty', icon: <Heart className="size-6" /> },
]

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="text-lg font-semibold text-foreground mb-6">Browse Categories</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((category) => (
          <button
            key={category.name}
            className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-center justify-center rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              {category.icon}
            </div>
            <span className="text-sm font-medium text-foreground">{category.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
