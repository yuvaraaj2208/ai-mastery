import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, tier } = await request.json()

    if (!userId || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const priceIds: Record<string, string> = {
      basic: process.env.STRIPE_PRICE_BASIC || 'price_basic',
      pro: process.env.STRIPE_PRICE_PRO || 'price_pro',
      vip: process.env.STRIPE_PRICE_VIP || 'price_vip',
    }

    const priceId = priceIds[tier]
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      )
    }

    const sessionId = Math.random().toString(36).substring(7)

    return NextResponse.json({
      checkoutUrl: `https://checkout.stripe.com/session/${sessionId}`,
      sessionId: sessionId,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
