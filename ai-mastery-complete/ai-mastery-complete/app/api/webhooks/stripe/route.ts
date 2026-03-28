import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature') || ''

    console.log('Webhook received:', { signature })

    let event

    try {
      event = JSON.parse(body)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Checkout completed:', event.data.object)
        break
      case 'customer.subscription.created':
        console.log('Subscription created:', event.data.object)
        break
      case 'customer.subscription.updated':
        console.log('Subscription updated:', event.data.object)
        break
      case 'customer.subscription.deleted':
        console.log('Subscription deleted:', event.data.object)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler error' },
      { status: 500 }
    )
  }
}
