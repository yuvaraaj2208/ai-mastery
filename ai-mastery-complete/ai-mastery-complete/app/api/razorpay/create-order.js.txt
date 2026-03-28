// app/api/razorpay/create-order.js
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
);

const razorpay = new Razorpay({
key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
key_secret: process.env.RAZORPAY_KEY_SECRET
});

export default async function handler(req, res) {
if (req.method !== 'POST') {
return res.status(405).json({ message: 'Method not allowed' });
}

try {
const { tier, amount, currency, email, name } = req.body;

if (!tier || !amount || !email) {
return res.status(400).json({ message: 'Missing required fields' });
}

const order = await razorpay.orders.create({
amount: amount,
currency: currency || 'INR',
receipt: `receipt_${Date.now()}`,
notes: {
tier: tier,
email: email,
name: name
}
});

const { data: orderData, error: orderError } = await supabase
.from('payments')
.insert({
email: email,
amount_paid: amount / 100,
currency: currency || 'INR',
razorpay_order_id: order.id,
status: 'pending',
user_id: null
});

if (orderError) {
console.error('Supabase error:', orderError);
return res.status(500).json({ message: 'Failed to create order record' });
}

return res.status(200).json({
success: true,
orderId: order.id,
keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
amount: order.amount,
currency: order.currency
});

} catch (error) {
console.error('Order creation error:', error);
return res.status(500).json({
success: false,
message: 'Failed to create order: ' + error.message
});
}
}
