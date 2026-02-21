"use client"

import Link from 'next/link'
import { Check, Smartphone } from 'lucide-react'
import { NavBar } from '@/components/storefront/NavBar'
import { Footer } from '@/components/storefront/Footer'
import { useCart } from '@/components/storefront/CartProvider'
import { POSTPAID_PLANS, PREPAID_BUNDLES } from '@/components/storefront/types'

export default function PlansPage() {
  const { addItem } = useCart()

  function handleSubscribe(plan: typeof POSTPAID_PLANS[number]) {
    addItem({
      productId: plan.id,
      variantId: null,
      title: plan.name,
      variantName: null,
      price: plan.monthlyPrice,
      currencyCode: 'TTD',
      imageUrl: null,
      handle: null,
      planId: plan.id,
      planName: plan.name,
      planPrice: 0,
      itemType: 'postpaid-plan',
    })
  }

  function handleBuyPrepaid(bundle: typeof PREPAID_BUNDLES[number]) {
    addItem({
      productId: bundle.id,
      variantId: null,
      title: bundle.name,
      variantName: bundle.validity,
      price: bundle.price,
      currencyCode: 'TTD',
      imageUrl: null,
      handle: null,
      planId: null,
      planName: null,
      planPrice: 0,
      itemType: 'prepaid-bundle',
    })
  }

  return (
    <div className="flex min-h-svh flex-col">
      <NavBar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            TSTT Mobile Plans
          </h1>
          <p className="mt-4 text-lg text-white/85">
            Find the perfect plan for your lifestyle. Unlimited data, calls & texts starting at $89/mo.
          </p>
        </div>
      </section>

      {/* Postpaid Plans */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Postpaid Plans</h2>
        <p className="text-muted-foreground mb-8">2-year commitment. Bring your own device or bundle with a new phone.</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {POSTPAID_PLANS.map((plan) => {
            const isPopular = plan.id === 'unlimited'
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-lg border p-5 ${
                  isPopular
                    ? 'border-primary shadow-lg ring-2 ring-primary/20'
                    : 'border-border'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">${plan.monthlyPrice}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{plan.commitment} commitment</p>

                <div className="mt-4 flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{plan.data} data</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{plan.minutes}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{plan.texts}</span>
                  </div>
                  {plan.extras.map((extra) => (
                    <div key={extra} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{extra}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                  +${plan.commitmentValue.toLocaleString()} with device bundle
                </div>

                <button
                  onClick={() => handleSubscribe(plan)}
                  className={`mt-4 w-full rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
                    isPopular
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'border border-primary text-primary hover:bg-primary/5'
                  }`}
                >
                  Subscribe
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Prepaid Bundles */}
      <section id="prepaid" className="bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Prepaid Data Bundles</h2>
          <p className="text-muted-foreground mb-8">No commitment. Top up anytime with data, calls & texts.</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PREPAID_BUNDLES.map((bundle) => (
              <div
                key={bundle.id}
                className="flex flex-col rounded-lg border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">{bundle.name}</h3>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {bundle.validity}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">${bundle.price}</span>
                  <span className="text-sm text-muted-foreground">TTD</span>
                </div>

                <div className="mt-3 space-y-1.5 flex-1">
                  <p className="text-sm text-foreground">{bundle.data} data</p>
                  <p className="text-sm text-muted-foreground">{bundle.minutes} &middot; {bundle.texts}</p>
                  {bundle.extras.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {bundle.extras.map((extra) => (
                        <span key={extra} className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">
                          {extra}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleBuyPrepaid(bundle)}
                  className="mt-4 w-full rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bundle CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center">
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-8">
          <Smartphone className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-xl font-bold text-foreground">Want a new phone with your plan?</h2>
          <p className="mt-2 text-muted-foreground">
            Bundle any plan with the latest smartphones. Finance up to $25,000 TTD over 8 months.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Browse Devices
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
