export interface StorefrontProduct {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  handle: string | null
  sku: string | null
  productType: string
  primaryCurrencyCode: string | null
  defaultUnit: string | null
  defaultMediaUrl: string | null
  isActive: boolean
  regularPrice: number | null
  salePrice: number | null
  currencyCode: string
  categoryName: string | null
  categoryPath: string | null
  variantCount: number
  variants: StorefrontVariant[]
}

export interface StorefrontVariant {
  id: string
  name: string
  sku: string | null
  optionValues: Record<string, string>
  isDefault: boolean
  regularPrice: number | null
  salePrice: number | null
  currencyCode: string
}

export interface CartItem {
  productId: string
  variantId: string | null
  title: string
  variantName: string | null
  price: number
  currencyCode: string
  imageUrl: string | null
  quantity: number
  handle: string | null
}

export interface MicroloanEligibility {
  eligible: boolean
  maxAmount: number
  currency: string
  products: MicroloanProduct[]
}

export interface MicroloanProduct {
  id: number
  amount: number
  term: string
  monthlyPayment: number
  interestRate: number
}

export interface MicroloanApplication {
  loanId: string
  status: 'PENDING' | 'APPROVED' | 'DISBURSED'
  amount: number
  term: string
  monthlyPayment: number
  currency: string
}
