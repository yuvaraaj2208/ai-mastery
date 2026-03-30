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
const client = mg.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tier,
      email,
    } = body

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment details' },
        { status: 400 }
      )
    }

    // STEP 1: Verify Razorpay signature
    const signatureBody = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(signatureBody)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Payment signature verification failed' },
        { status: 400 }
      )
    }

    // STEP 2: Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id)

    if (payment.status !== 'captured') {
      return NextResponse.json(
        { success: false, error: 'Payment was not captured successfully' },
        { status: 400 }
      )
    }

    // STEP 3: Update payment status in database
    const { data: updateData, error: updateError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id: razorpay_payment_id,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update payment status' },
        { status: 500 }
      )
    }

    // STEP 4: Update user tier from 'trial' to paid tier
    const { data: userUpdate, error: userError } = await supabase
      .from('users')
      .update({
        tier: tier, // 'basic', 'pro', or 'vip'
        subscription_status: 'active',
        trial_until: null, // Clear trial date since they paid
        updated_at: new Date().toISOString(),
      })
      .eq('email', email)
      .select()

    if (userError) {
      console.error('User update error:', userError)
      // Don't fail, continue
    }

    // STEP 5: Send confirmation email
    try {
      await client.messages.create(process.env.MAILGUN_DOMAIN!, {
        from: process.env.MAILGUN_FROM_EMAIL!,
        to: email,
        subject: `🎉 Welcome to AI Mastery ${tier.toUpperCase()} - Payment Confirmed!`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #06B6D4;">Payment Confirmed! 🎉</h2>
            <p>Hi there,</p>
            <p>Thank you for subscribing to <strong>AI Mastery ${tier.toUpperCase()}</strong>!</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Payment Details:</strong></p>
              <ul>
                <li><strong>Plan:</strong> ${tier.toUpperCase()}</li>
                <li><strong>Amount:</strong> ₹${Number(payment.amount) / 100}</li>
                <li><strong>Payment ID:</strong> ${razorpay_payment_id}</li>
                <li><strong>Status:</strong> Completed ✅</li>
              </ul>
            </div>
            
            <p>Your subscription is now <strong>ACTIVE</strong>. Access all premium content immediately!</p>
            
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                 style="background-color: #06B6D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Go to Dashboard
              </a>
            </p>
            
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              Questions? Email us at support@aimastery.com<br>
              Best regards,<br>
              <strong>The AI Mastery Team</strong>
            </p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Don't fail the payment if email fails
    }

    // STEP 6: Return success
    return NextResponse.json(
      {
        success: true,
        message: 'Payment verified successfully',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        tier: tier,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Payment verification failed: ' + (error as Error).message,
      },
      { status: 500 }
    )
  }
}
