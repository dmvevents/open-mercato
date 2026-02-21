"use client"

import { POSTPAID_PLANS } from './types'

interface PlanSelectorProps {
  selectedPlanId: string
  onSelect: (planId: string) => void
  phonePrice: number
  currencyCode: string
}

function calcMonthly(principal: number, rate: number, months: number): number {
  if (rate === 0) return principal / months
  const factor = Math.pow(1 + rate, months)
  return principal * (rate * factor) / (factor - 1)
}

export function PlanSelector({ selectedPlanId, onSelect, phonePrice, currencyCode }: PlanSelectorProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">Choose a Mobile Plan</p>
      <div className="space-y-2">
        {POSTPAID_PLANS.map((plan) => {
          const isSelected = selectedPlanId === plan.id
          const bundleTotal = phonePrice + plan.commitmentValue
          const monthly = calcMonthly(bundleTotal, 0.0125, 8)

          return (
            <button
              key={plan.id}
              onClick={() => onSelect(plan.id)}
              className={`w-full flex items-start gap-3 rounded-md border p-4 text-left transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected ? 'border-primary' : 'border-muted-foreground'
                }`}
              >
                {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{plan.name}</p>
                    {plan.id === 'unlimited' && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">Popular</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    ${plan.monthlyPrice}/mo
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                  <span className="text-xs text-muted-foreground">{plan.data}</span>
                  <span className="text-xs text-muted-foreground">{plan.minutes}</span>
                  <span className="text-xs text-muted-foreground">{plan.texts}</span>
                </div>
                {plan.extras.length > 0 && (
                  <div className="mt-0.5 flex flex-wrap gap-x-2">
                    {plan.extras.map((e) => (
                      <span key={e} className="text-[10px] text-primary">{e}</span>
                    ))}
                  </div>
                )}
                <p className="mt-1 text-xs text-primary font-medium">
                  {currencyCode} ${monthly.toFixed(0)}/mo for 8 months (+${plan.commitmentValue.toLocaleString()} with device)
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{plan.commitment} commitment</p>
              </div>
            </button>
          )
        })}

        {/* Phone Only option */}
        <button
          onClick={() => onSelect('phone-only')}
          className={`w-full flex items-start gap-3 rounded-md border p-4 text-left transition-colors ${
            selectedPlanId === 'phone-only'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div
            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
              selectedPlanId === 'phone-only' ? 'border-primary' : 'border-muted-foreground'
            }`}
          >
            {selectedPlanId === 'phone-only' && <div className="h-2 w-2 rounded-full bg-primary" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Phone Only</p>
              <span className="text-sm font-semibold text-foreground">No plan</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Buy the phone without a mobile plan</p>
          </div>
        </button>
      </div>
    </div>
  )
}
