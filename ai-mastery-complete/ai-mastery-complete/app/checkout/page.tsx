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
  const [userEmail, setUserEmail] = useState('')
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  const TIERS = {
    basic: { name: 'Basic', price: 35, priceCents: 299900, currency: 'USD' },
    pro: { name: 'Pro', price: 99, priceCents: 799900, currency: 'USD' },
    vip: { name: 'VIP', price: 299, priceCents: 2499900, currency: 'USD' },
  }

  const selectedTier = TIERS[tier as keyof typeof TIERS] || TIERS.basic

  useEffect(() => {
    const email = localStorage.getItem('userEmail') || 'unknown@example.com'
    setUserEmail(email)
  }, [])

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      console.log('✅ Razorpay script loaded successfully')
      setRazorpayLoaded(true)
    }
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script')
      setError('Failed to load payment gateway. Please refresh the page.')
    }
    document.body.appendChild(script)
  }, [])

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      setError('Payment gateway is loading. Please wait a moment and try again.')
      return
    }

    setLoading(true)
    setError('')

    console.log('=== PAYMENT INITIATED ===')
    console.log('Tier:', tier)
    console.log('Amount (paise):', selectedTier.priceCents)
    console.log('Email:', userEmail)

    try {
      // Step 1: Create order
      console.log('Step 1: Creating order...')
      const createOrderBody = {
        tier: tier,
        amount: selectedTier.priceCents,
        currency: 'USD',
        email: userEmail,
      }
      console.log('Request body:', createOrderBody)

      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createOrderBody),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        console.error('API error:', data.error)
        setError(data.error || 'Payment initiation failed')
        setLoading(false)
        return
      }

      console.log('✅ Order created. Order ID:', data.orderId)

      // Step 2: Open Razorpay modal
      console.log('Step 2: Opening Razorpay modal...')
      console.log('Window.Razorpay exists:', !!(window as any).Razorpay)

      if ((window as any).Razorpay) {
        console.log('✅ Creating Razorpay instance...')
        const razorpay = new (window as any).Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          order_id: data.orderId,
          handler: async (response: any) => {
            console.log('✅ Payment successful! Response:', response)

            // Step 3: Verify payment
            console.log('Step 3: Verifying payment...')
            const verifyBody = {
              razorpay_order_id: data.orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              tier: tier,
              email: userEmail,
            }

            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(verifyBody),
            })

            const verifyData = await verifyResponse.json()
            console.log('Verify response:', verifyData)

            if (verifyResponse.ok) {
              console.log('✅ Payment verified! Redirecting to dashboard...')
              localStorage.removeItem('userEmail')
              router.push('/dashboard')
            } else {
              console.error('❌ Verification failed:', verifyData.error)
              setError(verifyData.error || 'Payment verification failed')
              setLoading(false)
            }
          },
          modal: {
            ondismiss: () => {
              console.log('⚠️ Razorpay modal closed by user')
              setLoading(false)
            },
          },
          prefill: {
            email: userEmail,
          },
        })

        console.log('✅ Opening Razorpay modal...')
        razorpay.open()
      } else {
        console.error('❌ Razorpay is not available on window')
        setError('Razorpay payment gateway failed to load. Please refresh and try again.')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('❌ Payment error:', err)
      setError(err.message || 'Something went wrong')
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
                <p className="font-semibold mb-2">⚠️ Error:</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {!razorpayLoaded && (
              <div className="bg-yellow/20 border border-yellow/50 text-yellow p-4 rounded-lg mb-6">
                <p className="text-sm">Loading payment gateway...</p>
              </div>
            )}

            <div className="bg-dark border border-purple/20 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">{selectedTier.name} Plan</h2>
              <div className="text-4xl font-bold mb-2">
                ${selectedTier.price}
                <span className="text-lg text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 mb-4">Renews monthly in USD. Cancel anytime.</p>

              <button
                onClick={handlePayment}
                disabled={loading || !razorpayLoaded}
                className="w-full bg-cyan hover:bg-cyan-dark text-dark font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {!razorpayLoaded ? 'Loading...' : loading ? 'Processing...' : 'Pay Now with Razorpay'}
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
