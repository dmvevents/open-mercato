import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let body: { phone?: string; amount?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { phone, amount } = body

  if (!phone || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json(
      { error: 'Missing or invalid phone and amount' },
      { status: 400 },
    )
  }

  const apiUrl = process.env.MICROLOAN_API_URL
  const apiKey = process.env.MICROLOAN_API_KEY

  if (apiUrl && apiKey) {
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '')
      const response = await fetch(
        `${apiUrl}/bff/api/v1/clients/msisdn_${cleanPhone}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        return NextResponse.json(
          { eligible: false, maxAmount: 0, currency: 'TTD', products: [] },
          { status: 200 },
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch {
      return NextResponse.json(
        { error: 'Microloan service unavailable' },
        { status: 502 },
      )
    }
  }

  const maxAmount = 2500
  const products = [
    { id: 1, amount: 500, term: '3 months', monthlyPayment: 166.67, interestRate: 0 },
    { id: 2, amount: 1000, term: '3 months', monthlyPayment: 333.33, interestRate: 0 },
    { id: 3, amount: 1500, term: '3 months', monthlyPayment: 500.0, interestRate: 0 },
    { id: 4, amount: 2000, term: '3 months', monthlyPayment: 666.67, interestRate: 0 },
    { id: 5, amount: 2500, term: '3 months', monthlyPayment: 833.33, interestRate: 0 },
  ].filter((p) => p.amount <= Math.max(amount, maxAmount))

  return NextResponse.json({
    eligible: amount <= maxAmount,
    maxAmount,
    currency: 'TTD',
    products,
  })
}
