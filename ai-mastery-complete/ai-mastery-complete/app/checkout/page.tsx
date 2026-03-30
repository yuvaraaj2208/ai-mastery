'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tier = searchParams?.get('tier') || 'basic'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const TIERS = {
    basic: { name: 'Basic', price: 3500, priceCents: 350000 },
    pro: { name: 'Pro', price: 9900, priceCents: 990000 },
    vip: { name: 'VIP', price: 29900, priceCents: 2990000 },
  }

  const selectedTier = TIERS[tier as keyof typeof TIERS] || TIERS.basic

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      // Call payment API
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: selectedTier.name,
          amount: selectedTier.priceCents, // in paise (cents)
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Payment initiation failed')
        return
      }

      // Razorpay script should open payment modal
      if ((window as any).Razorpay) {
        const razorpay = new (window as any).Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          order_id: data.orderId,
          handler: async (response: any) => {
            // Payment successful, verify on backend
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: data.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyResponse.ok) {
              // Redirect to dashboard
              router.push('/dashboard')
            } else {
              setError('Payment verification failed')
            }
          },
          prefill: {
            name: 'Customer Name',
            email: 'customer@example.com',
          },
        })
        razorpay.open()
      }
    } catch (err) {
      setError('Something went wrong')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-darker to-dark text-white">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-dark/80 border-b border-purple/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-cyan">AI</span> Mastery
          </Link>
        </div>
      </nav>

      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="bg-darker border border-purple/20 rounded-lg p-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
            <p className="text-gray-400 mb-8">Secure payment with Razorpay</p>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="bg-dark border border-purple/20 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">{selectedTier.name} Plan</h2>
              <div className="text-4xl font-bold mb-2">
                ₹{selectedTier.price}
                <span className="text-lg text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 mb-4">Renews monthly. Cancel anytime.</p>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-cyan hover:bg-cyan-dark text-dark font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Pay Now with Razorpay'}
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">
                30-day money-back guarantee. No questions asked.
              </p>
            </div>

            <Link href="/pricing" className="text-center block text-cyan hover:text-cyan-dark">
              ← Back to Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
