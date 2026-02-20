import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let body: {
    phone?: string
    amount?: number
    loanProductId?: number
    cartItems?: Array<{ productId: string; title: string; quantity: number; price: number }>
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { phone, amount, loanProductId, cartItems } = body

  if (!phone || typeof amount !== 'number' || !loanProductId) {
    return NextResponse.json(
      { error: 'Missing required fields: phone, amount, loanProductId' },
      { status: 400 },
    )
  }

  const apiUrl = process.env.MICROLOAN_API_URL
  const apiKey = process.env.MICROLOAN_API_KEY

  if (apiUrl && apiKey) {
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '')

      const clientResponse = await fetch(
        `${apiUrl}/bff/api/v1/clients`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            msisdn: cleanPhone,
            loanProductId,
            amount,
            cartItems,
          }),
        },
      )

      if (!clientResponse.ok) {
        const errorText = await clientResponse.text()
        return NextResponse.json(
          { error: 'Loan application failed', details: errorText },
          { status: 502 },
        )
      }

      const data = await clientResponse.json()
      return NextResponse.json(data)
    } catch {
      return NextResponse.json(
        { error: 'Microloan service unavailable' },
        { status: 502 },
      )
    }
  }

  const loanProducts: Record<number, { term: string; monthlyPayment: number }> = {
    1: { term: '3 months', monthlyPayment: 166.67 },
    2: { term: '3 months', monthlyPayment: 333.33 },
    3: { term: '3 months', monthlyPayment: 500.0 },
    4: { term: '3 months', monthlyPayment: 666.67 },
    5: { term: '3 months', monthlyPayment: 833.33 },
  }

  const selectedProduct = loanProducts[loanProductId]
  const suffix = crypto.randomUUID().split('-')[0].toUpperCase()

  return NextResponse.json({
    loanId: `TSTT-ML-2026-${suffix}`,
    status: 'APPROVED' as const,
    amount,
    term: selectedProduct?.term ?? '3 months',
    monthlyPayment: selectedProduct?.monthlyPayment ?? Math.round((amount / 3) * 100) / 100,
    currency: 'TTD',
  })
}
