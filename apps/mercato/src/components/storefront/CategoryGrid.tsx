import { Smartphone, Headphones, Wifi, DollarSign } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface Category {
  name: string
  icon: ReactNode
  href: string
}

const CATEGORIES: Category[] = [
  { name: 'Apple',        icon: <Smartphone className="size-6" />,  href: '/shop?brand=apple' },
  { name: 'Samsung',      icon: <Smartphone className="size-6" />,  href: '/shop?brand=samsung' },
  { name: 'Google',       icon: <Smartphone className="size-6" />,  href: '/shop?brand=google' },
  { name: 'Budget Phones', icon: <DollarSign className="size-6" />, href: '/shop?budget=true' },
  { name: 'Accessories',  icon: <Headphones className="size-6" />,  href: '/shop?category=accessories' },
  { name: 'TSTT Plans',   icon: <Wifi className="size-6" />,        href: '/plans' },
]

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="text-lg font-semibold text-foreground mb-6">Browse Categories</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-center justify-center rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              {category.icon}
            </div>
            <span className="text-sm font-medium text-foreground">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
