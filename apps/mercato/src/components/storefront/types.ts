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

export type ItemType = 'device' | 'postpaid-plan' | 'prepaid-bundle' | 'device-bundle'

export interface PostpaidPlan {
  id: string
  name: string
  monthlyPrice: number      // TTD per month
  commitmentValue: number   // lump sum added to device price for bundle financing
  data: string
  minutes: string
  texts: string
  extras: string[]
  commitment: string        // "2 years"
}

export const POSTPAID_PLANS: PostpaidPlan[] = [
  { id: 'starter',        name: 'My Starter',        monthlyPrice: 89,  commitmentValue: 1200, data: '5GB',       minutes: '200 mins',   texts: '200 texts',  extras: [],                                                            commitment: '2 years' },
  { id: 'flex',           name: 'My Flex',           monthlyPrice: 150, commitmentValue: 2000, data: '15GB',      minutes: '500 mins',   texts: '500 texts',  extras: ['Free WhatsApp'],                                             commitment: '2 years' },
  { id: 'unlimited',      name: 'My Unlimited',      monthlyPrice: 250, commitmentValue: 3500, data: '30GB',      minutes: 'Unlimited',  texts: 'Unlimited',  extras: ['Free WhatsApp', 'Free Facebook'],                            commitment: '2 years' },
  { id: 'unlimited-plus', name: 'My Unlimited Plus', monthlyPrice: 350, commitmentValue: 5000, data: '50GB',      minutes: 'Unlimited',  texts: 'Unlimited',  extras: ['Free WhatsApp', 'Free Facebook', '10GB Roaming'],            commitment: '2 years' },
  { id: 'unlimited-max',  name: 'My Unlimited Max',  monthlyPrice: 450, commitmentValue: 6500, data: 'Unlimited', minutes: 'Unlimited',  texts: 'Unlimited',  extras: ['Free WhatsApp', 'Free Facebook', '25GB Roaming', 'HD Streaming'], commitment: '2 years' },
]

export interface PrepaidBundle {
  id: string
  name: string
  price: number          // one-time TTD
  validity: string       // "1 day", "7 days", "30 days"
  data: string
  minutes: string
  texts: string
  extras: string[]
}

export const PREPAID_BUNDLES: PrepaidBundle[] = [
  { id: 'day-pass',  name: 'My Data Day Pass',  price: 25,  validity: '1 day',   data: '1GB',  minutes: '30 mins',   texts: '30 texts',  extras: [] },
  { id: 'week-pass', name: 'My Data Week Pass', price: 50,  validity: '7 days',  data: '3GB',  minutes: '60 mins',   texts: '60 texts',  extras: [] },
  { id: '7day-75',   name: 'My 7 Day Plan',     price: 75,  validity: '7 days',  data: '5GB',  minutes: '120 mins',  texts: '120 texts', extras: ['Free WhatsApp'] },
  { id: '7day-120',  name: 'My 7 Day Plus',     price: 120, validity: '7 days',  data: '10GB', minutes: 'Unlimited', texts: 'Unlimited', extras: ['Free WhatsApp'] },
  { id: '30day-200', name: 'My 30 Day Plan',    price: 200, validity: '30 days', data: '20GB', minutes: 'Unlimited', texts: 'Unlimited', extras: ['Free WhatsApp', 'Free Facebook'] },
  { id: '30day-300', name: 'My 30 Day Max',     price: 300, validity: '30 days', data: '40GB', minutes: 'Unlimited', texts: 'Unlimited', extras: ['Free WhatsApp', 'Free Facebook', '5GB Hotspot'] },
]

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
  planId: string | null
  planName: string | null
  planPrice: number
  itemType?: ItemType
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
