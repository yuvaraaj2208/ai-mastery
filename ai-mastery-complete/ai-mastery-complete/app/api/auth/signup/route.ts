import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, tier } = await request.json()

    if (!email || !password || !fullName || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const user = {
      id: Math.random().toString(36).substring(7),
      email,
      fullName,
      subscription_tier: tier,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      tier: user.subscription_tier,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
