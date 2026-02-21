"use client"

import Link from 'next/link'
import { Check } from 'lucide-react'
import { POSTPAID_PLANS } from './types'

const FEATURED_IDS = ['flex', 'unlimited', 'unlimited-plus']

export function FeaturedPlans() {
  const featured = POSTPAID_PLANS.filter(p => FEATURED_IDS.includes(p.id))

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Popular Plans</h2>
        <Link href="/plans" className="text-sm font-medium text-primary hover:underline">
          See All Plans
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {featured.map((plan) => {
          const isPopular = plan.id === 'unlimited'
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-lg border p-5 ${
                isPopular
                  ? 'border-primary shadow-md ring-1 ring-primary/20'
                  : 'border-border'
              }`}
            >
              {isPopular && (
                <span className="absolute -top-2.5 left-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white">
                  Popular
                </span>
              )}
              <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">${plan.monthlyPrice}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <div className="mt-3 space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{plan.data} data</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{plan.minutes}</span>
                </div>
                {plan.extras.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{plan.extras[0]}</span>
                  </div>
                )}
              </div>
              <Link
                href="/plans"
                className="mt-4 flex items-center justify-center rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
              >
                Learn More
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}
