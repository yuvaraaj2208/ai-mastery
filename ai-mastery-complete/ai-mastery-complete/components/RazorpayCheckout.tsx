'use client';
import { useState } from 'react';
import axios from 'axios';

export default function RazorpayCheckout({ tier, price }) {
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const tiers = {
basic: {
name: 'Basic',
price: 35,
description: 'Perfect for getting started',
features: ['100+ AI tips', '200+ prompts', 'Community access', 'Email support']
},
pro: {
name: 'Pro',
price: 99,
description: 'Most popular choice',
features: ['Everything in Basic', '500+ prompts', 'Priority support', 'Advanced templates']
},
vip: {
name: 'VIP',
price: 299,
description: 'All-in-one premium',
features: ['Everything in Pro', '1000+ resources', '1-on-1 coaching', 'Lifetime updates']
}
};

const tierData = tiers[tier] || tiers.basic;

const handlePayment = async () => {
try {
setLoading(true);
setError('');

const response = await axios.post('/api/razorpay/create-order', {
tier: tier,
amount: tierData.price * 100,
currency: 'INR',
email: (document.querySelector('input[type="email"]') as HTMLInputElement)?.value || '',
name: (document.querySelector('input[name="name"]') as HTMLInputElement)?.value || 'Customer'
});

const { orderId, keyId } = response.data;

const options = {
key: keyId,
amount: tierData.price * 100,
currency: 'INR',
name: 'AI Mastery',
description: `${tierData.name} Plan - ${tierData.price}`,
order_id: orderId,
handler: async function (response) {
try {
const verifyResponse = await axios.post('/api/razorpay/verify-payment', {
razorpay_order_id: response.razorpay_order_id,
razorpay_payment_id: response.razorpay_payment_id,
razorpay_signature: response.razorpay_signature,
tier: tier,
email: (document.querySelector('input[type="email"]') as HTMLInputElement)?.value
});

if (verifyResponse.data.success) {
window.location.href = '/success?orderId=' + orderId;
} else {
setError('Payment verification failed. Please contact support.');
}
} catch (err) {
setError('Payment verification failed: ' + (err.response?.data?.message || err.message));
}
},
prefill: {
name: document.querySelector('input[name="name"]')?.value || '',
email: document.querySelector('input[type="email"]')?.value || '',
contact: document.querySelector('input[type="tel"]')?.value || ''
},
theme: {
color: '#3b82f6'
}
};

const Razorpay = window.Razorpay;
if (!Razorpay) {
setError('Razorpay is not loaded. Please refresh the page.');
return;
}

const razorpayInstance = new Razorpay(options);
razorpayInstance.open();

} catch (err) {
setError('Failed to initialize payment: ' + (err.response?.data?.message || err.message));
} finally {
setLoading(false);
}
};

return (
<div className="w-full max-w-md mx-auto p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-cyan-500/30">
<h2 className="text-2xl font-bold text-white mb-2">{tierData.name}</h2>
<p className="text-cyan-400 mb-4">{tierData.description}</p>

<div className="mb-6">
<span className="text-4xl font-bold text-white">${tierData.price}</span>
<span className="text-gray-400">/month</span>
</div>

<ul className="mb-6 space-y-2">
{tierData.features.map((feature, idx) => (
<li key={idx} className="flex items-center text-gray-300">
<span className="text-cyan-400 mr-2">✓</span>
{feature}
</li>
))}
</ul>

{error && (
<div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded">
{error}
</div>
)}

<button
onClick={handlePayment}
disabled={loading}
className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-200"
>
{loading ? 'Processing...' : `Start Free Trial - ₹${tierData.price}`}
</button>

<p className="text-center text-gray-400 text-sm mt-4">
30-day money-back guarantee. Cancel anytime.
</p>
</div>
);
}
