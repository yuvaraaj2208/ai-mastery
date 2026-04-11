import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js'
import mailgun from 'mailgun.js'
import FormData from 'form-data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const mg = new mailgun(FormData)
const client = mg.client({ username: 'api', key: process.env.MAILGUN_API_KEY || '' })

const TIER_RANK: Record<string, number> = { basic: 1, pro: 2, vip: 3 }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier, userId, email } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // STEP 1: Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Payment signature verification failed' }, { status: 400 })
    }

    // STEP 2: Check payment captured
    const payment = await razorpay.payments.fetch(razorpay_payment_id)
    if (payment.status !== 'captured') {
      return NextResponse.json({ success: false, error: 'Payment not captured' }, { status: 400 })
    }

    // STEP 3: Check user's current tier — prevent downgrade or duplicate
    const { data: currentUser } = await supabase
      .from('users')
      .select('tier')
      .eq('id', userId)
      .single()

    if (currentUser && TIER_RANK[currentUser.tier] >= TIER_RANK[tier]) {
      return NextResponse.json({
        success: false,
        error: `You already have ${currentUser.tier} plan or higher.`
      }, { status: 400 })
    }

    // STEP 4: Update user tier by ID (not email)
    const { error: userError } = await supabase
      .from('users')
      .update({
        tier,
        subscription_status: 'active',
        trial_until: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (userError) {
      console.error('User update error:', userError)
      return NextResponse.json({ success: false, error: 'Failed to update user tier' }, { status: 500 })
    }

    // STEP 5: Update payment record
    await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', razorpay_order_id)

    // STEP 6: Send confirmation email
    try {
      await client.messages.create(process.env.MAILGUN_DOMAIN!, {
        from: process.env.MAILGUN_FROM_EMAIL!,
        to: email,
        subject: `🎉 Welcome to AI Mastery ${tier.toUpperCase()}!`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #06B6D4;">Payment Confirmed! 🎉</h2>
            <p>Thank you for upgrading to <strong>AI Mastery ${tier.toUpperCase()}</strong>!</p>
            <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
            <p><strong>Amount:</strong> ${Number(payment.amount) / 100} ${payment.currency}</p>
            <p>Your subscription is now active. <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Go to Dashboard</a></p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Email error:', emailError)
    }

    return NextResponse.json({ success: true, tier }, { status: 200 })

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 500 })
  }
}
