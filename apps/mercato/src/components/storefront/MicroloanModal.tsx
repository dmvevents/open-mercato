"use client"

import { useState } from 'react'
import { X, Phone, Loader2, Check, CreditCard, ArrowRight } from 'lucide-react'
import type { MicroloanEligibility, MicroloanProduct, MicroloanApplication } from './types'

interface MicroloanModalProps {
  isOpen: boolean
  onClose: () => void
  cartTotal: number
  currencyCode: string
  cartItems: Array<{ productId: string; title: string; quantity: number; price: number }>
  onSuccess: (application: MicroloanApplication) => void
}

type Step = 'phone' | 'eligibility' | 'terms' | 'confirmation'

export function MicroloanModal({
  isOpen,
  onClose,
  cartTotal,
  currencyCode,
  cartItems,
  onSuccess,
}: MicroloanModalProps) {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [eligibility, setEligibility] = useState<MicroloanEligibility | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<MicroloanProduct | null>(null)
  const [application, setApplication] = useState<MicroloanApplication | null>(null)

  if (!isOpen) return null

  function resetAndClose() {
    setStep('phone')
    setPhone('')
    setLoading(false)
    setError(null)
    setEligibility(null)
    setSelectedProduct(null)
    setApplication(null)
    onClose()
  }

  async function checkEligibility() {
    const cleaned = phone.replace(/[^0-9]/g, '')
    if (cleaned.length < 7) {
      setError('Please enter a valid Trinidad phone number')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/microloan/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned, amount: cartTotal }),
      })

      if (!response.ok) {
        throw new Error('Failed to check eligibility')
      }

      const data: MicroloanEligibility = await response.json()
      setEligibility(data)
      setStep('eligibility')
    } catch {
      setError('Unable to check eligibility. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function applyForLoan() {
    if (!selectedProduct) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/microloan/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.replace(/[^0-9]/g, ''),
          amount: selectedProduct.amount,
          loanProductId: selectedProduct.id,
          cartItems: cartItems.map((item) => ({
            productId: item.productId,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Loan application failed')
      }

      const data: MicroloanApplication = await response.json()
      setApplication(data)
      setStep('confirmation')
      onSuccess(data)
    } catch {
      setError('Unable to process loan application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function formatPhone(value: string) {
    const digits = value.replace(/[^0-9]/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={resetAndClose} />
      <div className="relative w-full max-w-md rounded-lg bg-card border border-border shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-primary">TSTT MicroLoan</h2>
          <button
            onClick={resetAndClose}
            className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'phone' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3">
                <CreditCard className="h-5 w-5 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Finance your purchase</p>
                  <p className="text-muted-foreground">
                    {currencyCode} ${cartTotal.toFixed(2)} with 0% interest
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Phone Number
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground shrink-0">+1-868-</span>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={formatPhone(phone)}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="XXX-XXXX"
                      className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      maxLength={8}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <button
                onClick={checkEligibility}
                disabled={loading || phone.replace(/[^0-9]/g, '').length < 7}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Check Eligibility
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'eligibility' && eligibility && (
            <div className="space-y-4">
              {eligibility.eligible ? (
                <>
                  <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
                    <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-emerald-800 dark:text-emerald-300">
                        You are eligible!
                      </p>
                      <p className="text-emerald-600 dark:text-emerald-400">
                        Maximum loan: {eligibility.currency} ${eligibility.maxAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">
                      Select a loan plan:
                    </p>
                    <div className="space-y-2">
                      {eligibility.products.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            setSelectedProduct(product)
                            setStep('terms')
                          }}
                          className={`w-full rounded-md border p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 ${
                            selectedProduct?.id === product.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">
                              {eligibility.currency} ${product.amount.toFixed(2)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {product.term}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            ${product.monthlyPayment.toFixed(2)}/mo
                            {product.interestRate === 0 ? ' at 0% interest' : ` at ${product.interestRate}%`}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-3">
                  <X className="h-5 w-5 text-destructive shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Not eligible at this time</p>
                    <p className="text-muted-foreground">
                      Please try again later or choose a different payment method.
                    </p>
                  </div>
                </div>
              )}

              {!eligibility.eligible && (
                <button
                  onClick={resetAndClose}
                  className="w-full rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          )}

          {step === 'terms' && selectedProduct && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Loan Summary</h3>

              <div className="rounded-lg border border-border divide-y divide-border">
                <div className="flex justify-between p-3">
                  <span className="text-sm text-muted-foreground">Loan Amount</span>
                  <span className="text-sm font-medium text-foreground">
                    TTD ${selectedProduct.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-sm text-muted-foreground">Term</span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedProduct.term}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-sm text-muted-foreground">Monthly Payment</span>
                  <span className="text-sm font-medium text-foreground">
                    TTD ${selectedProduct.monthlyPayment.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-sm text-muted-foreground">Interest Rate</span>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {selectedProduct.interestRate}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                By proceeding, you agree to the TSTT MicroLoan terms and conditions.
                Repayments will be charged to your TSTT mobile account.
              </p>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('eligibility')}
                  className="flex-1 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={applyForLoan}
                  disabled={loading}
                  className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Confirm Loan
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'confirmation' && application && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
                <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground">Loan Approved!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your microloan has been processed successfully.
                </p>
              </div>

              <div className="rounded-lg border border-border divide-y divide-border text-left">
                <div className="flex justify-between p-3">
                  <span className="text-sm text-muted-foreground">Loan ID</span>
                  <span className="text-sm font-mono font-medium text-foreground">
                    {application.loanId}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                    {application.status}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-sm font-medium text-foreground">
                    {application.currency} ${application.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-sm text-muted-foreground">Monthly Payment</span>
                  <span className="text-sm font-medium text-foreground">
                    {application.currency} ${application.monthlyPayment.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={resetAndClose}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
