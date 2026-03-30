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

    console.log('Received body:', body)

    // Validate required fields
    if (!tier || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: tier and amount' },
        { status: 400 }
      )
    }

    // Log Razorpay credentials check
    console.log('Razorpay Key ID:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)
    console.log('Razorpay Key Secret exists:', !!process.env.RAZORPAY_KEY_SECRET)

    try {
      // Create Razorpay order
      // NOTE: Razorpay test mode supports INR, so we use INR for API calls
      const order = await razorpay.orders.create({
        amount: amount, // in cents (paise)
        currency: 'INR', // Razorpay test mode requires INR
        receipt: `receipt_${Date.now()}`,
        notes: {
          tier: tier,
          email: email || 'unknown@example.com',
          name: name || 'unknown',
          originalCurrency: currency || 'USD',
        },
      })

      console.log('Order created:', order.id)

      // Save order to database
      const { data: orderData, error: orderError } = await supabase
        .from('payments')
        .insert([
          {
            email: email || 'unknown@example.com',
            name: name || 'unknown',
            amount_paid: amount / 100,
            currency: 'INR',
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
          { error: 'Failed to create order record: ' + orderError.message },
          { status: 500 }
        )
      }

      console.log('Order saved to database')

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
    } catch (razorpayError: any) {
      console.error('Razorpay error details:', {
        message: razorpayError?.message,
        response: razorpayError?.response,
        statusCode: razorpayError?.statusCode,
        fullError: razorpayError,
      })

      return NextResponse.json(
        {
          success: false,
          error: 'Razorpay error: ' + (razorpayError?.message || 'Unknown error'),
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create order: ' + (error?.message || 'Unknown error'),
      },
      { status: 500 }
    )
  }
}
