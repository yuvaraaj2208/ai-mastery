// app/api/razorpay/verify-payment.js
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import mailgun from 'mailgun.js';
import formData from 'form-data';

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
);

const razorpay = new Razorpay({
key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
key_secret: process.env.RAZORPAY_KEY_SECRET
});
const mg = new mailgun(formData);
const client = mg.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || ''
});

export default async function handler(req, res) {
if (req.method !== 'POST') {
return res.status(405).json({ message: 'Method not allowed' });
}

try {
const {
razorpay_order_id,
razorpay_payment_id,
razorpay_signature,
tier,
email
} = req.body;

if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
return res.status(400).json({
success: false,
message: 'Missing payment details'
});
}

const body = razorpay_order_id + '|' + razorpay_payment_id;
const expectedSignature = crypto
.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
.update(body)
.digest('hex');

if (expectedSignature !== razorpay_signature) {
return res.status(400).json({
success: false,
message: 'Payment signature verification failed'
});
}

const payment = await razorpay.payments.fetch(razorpay_payment_id);

if (payment.status !== 'captured') {
return res.status(400).json({
success: false,
message: 'Payment was not captured successfully'
});
}

const { data: updateData, error: updateError } = await supabase
.from('payments')
.update({
razorpay_payment_id: razorpay_payment_id,
status: 'completed',
updated_at: new Date().toISOString()
})
.eq('razorpay_order_id', razorpay_order_id);

if (updateError) {
console.error('Update error:', updateError);
return res.status(500).json({
success: false,
message: 'Failed to update payment status'
});
}

const { data: customer, error: customerError } = await supabase
.from('customers')
.upsert({
email: email,
subscription_tier: tier,
razorpay_customer_id: payment.customer_id,
updated_at: new Date().toISOString()
}, {
onConflict: 'email'
})
.select();

const { data: subscription, error: subError } = await supabase
.from('subscriptions')
.insert({
customer_id: customer?.[0]?.id,
user_id: null,
tier: tier,
status: 'active',
started_at: new Date().toISOString(),
expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
auto_renew: true
});

try {
await client.messages.create(process.env.MAILGUN_DOMAIN, {
from: process.env.MAILGUN_FROM_EMAIL,
to: email,
subject: `Welcome to AI Mastery ${tier.toUpperCase()} - Payment Confirmed!`,
html: `
<h2>Payment Confirmed! 🎉</h2>
<p>Hi there,</p>
<p>Thank you for subscribing to <strong>AI Mastery ${tier.toUpperCase()}</strong>!</p>
<p><strong>Payment Details:</strong></p>
<ul>
<li>Amount: ₹${payment.amount / 100}</li>
<li>Payment ID: ${razorpay_payment_id}</li>
<li>Status: Completed</li>
</ul>
<p>Your 30-day free trial starts now. Access all premium content immediately!</p>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a></p>
<p>Questions? Contact us at support@aimastery.com</p>
<p>Best regards,<br>The AI Mastery Team</p>
`
});
} catch (emailError) {
console.error('Email sending error:', emailError);
}

return res.status(200).json({
success: true,
message: 'Payment verified successfully',
orderId: razorpay_order_id,
paymentId: razorpay_payment_id
});

} catch (error) {
console.error('Verification error:', error);
return res.status(500).json({
success: false,
message: 'Payment verification failed: ' + error.message
});
}
}

