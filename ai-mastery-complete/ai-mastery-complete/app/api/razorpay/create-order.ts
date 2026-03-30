import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tier, amount, currency, email, name } = body

    // Validate required fields
    if (!tier || !amount || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount, // in paise
      currency: currency || 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        tier: tier,
        email: email,
        name: name,
      },
    })

    // Save order to database
    const { data: orderData, error: orderError } = await supabase
      .from('payments')
      .insert([
        {
          email: email,
          name: name,
          amount_paid: amount / 100, // convert to rupees
          currency: currency || 'INR',
          razorpay_order_id: order.id,
          tier: tier,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (orderError) {
      console.error('Supabase error:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order record' },
        { status: 500 }
      )
    }

    // Return success with order details
    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create order: ' + (error as Error).message,
      },
      { status: 500 }
    )
  }
}
