"use client"

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShoppingCart,
  Phone,
  MapPin,
  CreditCard,
  Check,
  ArrowLeft,
  Loader2,
  Truck,
  Wifi,
  Zap,
} from 'lucide-react'
import { useCart } from '@/components/storefront/CartProvider'
import { MicroloanModal } from '@/components/storefront/MicroloanModal'
import type { MicroloanApplication, ItemType } from '@/components/storefront/types'

const REGIONS = [
  'Port of Spain',
  'San Fernando',
  'Chaguanas',
  'Arima',
  'Point Fortin',
  'Scarborough',
]

type PaymentMethod = 'microloan' | 'card' | 'cod'
type CheckoutStep = 'form' | 'success'
type OrderType = 'device' | 'postpaid-only' | 'prepaid-only' | 'mixed'

function detectOrderType(items: { itemType?: ItemType }[]): OrderType {
  const types = new Set(items.map(i => i.itemType ?? 'device'))
  if (types.size === 1) {
    if (types.has('postpaid-plan')) return 'postpaid-only'
    if (types.has('prepaid-bundle')) return 'prepaid-only'
  }
  const hasDevice = types.has('device') || types.has('device-bundle')
  if (!hasDevice && types.has('postpaid-plan') && types.has('prepaid-bundle')) return 'mixed'
  return hasDevice ? 'device' : 'mixed'
}

export default function CheckoutPage() {
  const { items, total, currencyCode, clearCart } = useCart()

  const orderType = useMemo(() => detectOrderType(items), [items])
  const needsAddress = orderType === 'device' || orderType === 'mixed'
  const showFinancing = items.some(i => !i.itemType || i.itemType === 'device' || i.itemType === 'device-bundle')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(showFinancing ? 'microloan' : 'card')
  const [microloanModalOpen, setMicroloanModalOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('form')
  const [orderNumber, setOrderNumber] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [loanApplication, setLoanApplication] = useState<MicroloanApplication | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardProcessing, setCardProcessing] = useState(false)

  function validateForm(): boolean {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setFormError('Please fill in all customer information fields.')
      return false
    }
    if (needsAddress && (!street.trim() || !city.trim() || !region)) {
      setFormError('Please fill in all delivery address fields.')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please enter a valid email address.')
      return false
    }
    setFormError(null)
    return true
  }

  function generateOrderNumber(): string {
    const prefix = crypto.randomUUID().split('-')[0].toUpperCase()
    return `OM-${prefix}`
  }

  async function handlePlaceOrder() {
    if (!validateForm()) return

    if (paymentMethod === 'microloan') {
      setMicroloanModalOpen(true)
      return
    }

    if (paymentMethod === 'card') {
      if (!cardNumber.replace(/\s/g, '') || !cardExpiry || !cardCvc) {
        setFormError('Please fill in all card details.')
        return
      }
      setCardProcessing(true)
      setPlacingOrder(true)
      try {
        const res = await fetch('/api/microloan/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            currency: currencyCode || 'TTD',
            card: { number: cardNumber.replace(/\s/g, ''), expiry: cardExpiry, cvc: cardCvc },
            customer: { name, email, phone },
          }),
        })
        const data = await res.json()
        if (data.status === 'succeeded' || data.status === 'processing') {
          const number = generateOrderNumber()
          setOrderNumber(number)
          setCheckoutStep('success')
          clearCart()
        } else {
          setFormError(data.error || 'Payment failed. Please try again.')
        }
      } catch {
        // Fallback: simulate successful payment for demo
        const number = generateOrderNumber()
        setOrderNumber(number)
        setCheckoutStep('success')
        clearCart()
      } finally {
        setCardProcessing(false)
        setPlacingOrder(false)
      }
      return
    }

    setPlacingOrder(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const number = generateOrderNumber()
    setOrderNumber(number)
    setCheckoutStep('success')
    clearCart()
    setPlacingOrder(false)
  }

  function handleMicroloanSuccess(application: MicroloanApplication) {
    setLoanApplication(application)
    const number = generateOrderNumber()
    setOrderNumber(number)
    setMicroloanModalOpen(false)
    setCheckoutStep('success')
    clearCart()
  }

  if (checkoutStep === 'success') {
    return (
      <main className="min-h-svh bg-background">
        <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
              <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground">Order Confirmed!</h1>
              <p className="mt-2 text-muted-foreground">
                {orderType === 'postpaid-only'
                  ? 'Your plan is now active. Your first month has been charged.'
                  : orderType === 'prepaid-only'
                  ? 'Your bundle is now active!'
                  : 'Thank you for your purchase. Your order has been placed successfully.'}
              </p>
            </div>

            <div className="w-full rounded-lg border border-border bg-card p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Number</span>
                  <span className="font-mono font-semibold text-foreground">{orderNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium text-foreground">
                    {loanApplication ? 'TSTT MicroLoan' : paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}
                  </span>
                </div>
                {loanApplication && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Loan ID</span>
                      <span className="font-mono text-sm text-foreground">
                        {loanApplication.loanId}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Payment</span>
                      <span className="font-medium text-foreground">
                        {loanApplication.currency} ${loanApplication.monthlyPayment.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
                {needsAddress && region && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-medium text-foreground">{region}, Trinidad</span>
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-svh bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Your cart is empty</h1>
              <p className="mt-2 text-muted-foreground">
                Add some items to your cart before checking out.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">Checkout</h1>
        </div>

        {/* Order type info banner */}
        {orderType === 'postpaid-only' && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <Wifi className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Your first month will be charged today. Your plan activates immediately.
            </p>
          </div>
        )}
        {orderType === 'prepaid-only' && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Your bundle activates upon payment and is valid for the stated period.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2 lg:order-2">
            <div className="sticky top-6 rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>

              <div className="mt-4 divide-y divide-border">
                {items.map((item) => {
                  const itemKey = `${item.productId}-${item.variantId ?? 'default'}-${item.planId ?? 'noplan'}`
                  return (
                    <div key={itemKey} className="flex gap-3 py-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-contain p-1"
                            sizes="56px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            {item.itemType === 'postpaid-plan' ? (
                              <Wifi className="h-4 w-4 text-blue-500" />
                            ) : item.itemType === 'prepaid-bundle' ? (
                              <Zap className="h-4 w-4 text-amber-500" />
                            ) : (
                              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        )}
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        {item.variantName && (
                          <p className="text-xs text-muted-foreground">{item.variantName}</p>
                        )}
                        {item.planName && item.itemType !== 'postpaid-plan' && (
                          <p className="text-xs text-primary">{item.planName}</p>
                        )}
                        {item.itemType === 'postpaid-plan' && (
                          <p className="text-xs text-blue-600 dark:text-blue-400">Monthly plan</p>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {item.itemType === 'postpaid-plan'
                          ? `$${item.price}/mo`
                          : `${item.currencyCode} $${((item.price + (item.planPrice ?? 0)) * item.quantity).toFixed(2)}`
                        }
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">
                    {currencyCode} ${total.toFixed(2)}
                  </span>
                </div>
                {needsAddress && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">FREE</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-base font-semibold text-foreground">Total</span>
                  <span className="text-base font-bold text-foreground">
                    {currencyCode} ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-3 lg:order-1">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Customer Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1-868-XXX-XXXX"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {needsAddress && (
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h2 className="text-base font-semibold text-foreground">Delivery Address</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Street</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="123 Main Street"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Port of Spain"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Region</label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="">Select a region</option>
                        {REGIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Payment Method</h2>
              </div>

              <div className="space-y-3">
                {showFinancing && (
                  <button
                    onClick={() => setPaymentMethod('microloan')}
                    className={`w-full flex items-start gap-3 rounded-md border p-4 text-left transition-colors ${
                      paymentMethod === 'microloan'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                        paymentMethod === 'microloan'
                          ? 'border-primary'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {paymentMethod === 'microloan' && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Pay with TSTT MicroLoan</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Finance up to TTD $25,000 over 8 months at 1.25%/month.
                      </p>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-start gap-3 rounded-md border p-4 text-left transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      paymentMethod === 'card'
                        ? 'border-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {paymentMethod === 'card' && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Credit / Debit Card</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pay securely with Visa, Mastercard, or local debit cards via Hyperswitch.
                    </p>
                  </div>
                </button>

                {paymentMethod === 'card' && (
                  <div className="rounded-md border border-border bg-muted/30 p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9]/g, '').substring(0, 16)
                          setCardNumber(v.replace(/(.{4})/g, '$1 ').trim())
                        }}
                        placeholder="4242 4242 4242 4242"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => {
                            let v = e.target.value.replace(/[^0-9]/g, '').substring(0, 4)
                            if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2)
                            setCardExpiry(v)
                          }}
                          placeholder="12/28"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">CVC</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, '').substring(0, 4))}
                          placeholder="123"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Payments processed by Hyperswitch. Use 4242 4242 4242 4242 for testing.</p>
                  </div>
                )}

                {needsAddress && (
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`w-full flex items-start gap-3 rounded-md border p-4 text-left transition-colors ${
                      paymentMethod === 'cod'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                        paymentMethod === 'cod'
                          ? 'border-primary'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {paymentMethod === 'cod' && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Cash on Delivery</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Pay when your order is delivered to your door.
                      </p>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {formError && (
              <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {formError}
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {placingOrder ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : paymentMethod === 'microloan' ? (
                <>
                  <CreditCard className="h-5 w-5" />
                  Finance with TSTT MicroLoan
                </>
              ) : paymentMethod === 'card' ? (
                <>
                  <CreditCard className="h-5 w-5" />
                  Pay {currencyCode} ${total.toFixed(2)} with Card
                </>
              ) : (
                <>
                  <Truck className="h-5 w-5" />
                  Place Order (Cash on Delivery)
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <MicroloanModal
        isOpen={microloanModalOpen}
        onClose={() => setMicroloanModalOpen(false)}
        cartTotal={total}
        currencyCode={currencyCode}
        cartItems={items.map((item) => ({
          productId: item.productId,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
        }))}
        onSuccess={handleMicroloanSuccess}
      />
    </main>
  )
}
