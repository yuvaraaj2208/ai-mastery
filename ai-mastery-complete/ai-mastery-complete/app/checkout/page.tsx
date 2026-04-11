'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tier = searchParams?.get('tier') || 'basic'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD')
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [currentTier, setCurrentTier] = useState('')
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  const TIERS = {
    basic: { name: 'Basic', usd: 35, inr: 2999,  usdPaise: 299900,  inrPaise: 299900  },
    pro:   { name: 'Pro',   usd: 99, inr: 7999,  usdPaise: 799900,  inrPaise: 799900  },
    vip:   { name: 'VIP',  usd: 299, inr: 24999, usdPaise: 2499900, inrPaise: 2499900 },
  }

  const TIER_RANK: Record<string, number> = { basic: 1, pro: 2, vip: 3 }
  const selectedTier = TIERS[tier as keyof typeof TIERS] || TIERS.basic

  // Load user session
  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      setUserId(session.user.id)
      setUserEmail(session.user.email ?? '')

      const { data } = await supabase
        .from('users')
        .select('tier')
        .eq('id', session.user.id)
        .single()

      if (data) {
        setCurrentTier(data.tier)
        // Redirect if already on this tier or higher
        if (TIER_RANK[data.tier] >= TIER_RANK[tier]) {
          router.push('/pricing')
        }
      }

      // Detect country for currency default
      try {
        const res = await fetch('https://ipapi.co/json/')
        const geo = await res.json()
        if (geo.country === 'IN') setCurrency('INR')
      } catch {
        // default USD
      }
    }
    loadUser()
  }, [])

  // Load Razorpay script
  useEffect(() => {
    if ((window as any).Razorpay) { setRazorpayLoaded(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setRazorpayLoaded(true)
    script.onerror = () => setError('Failed to load payment gateway. Please refresh.')
    document.body.appendChild(script)
  }, [])

  const handlePayment = async () => {
    if (!razorpayLoaded) { setError('Payment gateway loading. Please wait.'); return }
    if (!userId) { setError('Session expired. Please log in again.'); return }

    setLoading(true)
    setError('')

    try {
      const amount = currency === 'INR' ? selectedTier.inrPaise : selectedTier.usdPaise

      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          amount,
          currency,
          email: userEmail,
          userId,
        }),
      })

      const data = await response.json()
      if (!response.ok) { setError(data.error || 'Failed to create order'); setLoading(false); return }

      const razorpay = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: 'AI Mastery',
        description: `${selectedTier.name} Plan`,
        prefill: { email: userEmail },
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: data.orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              tier,
              userId,
              email: userEmail,
            }),
          })

          const verifyData = await verifyRes.json()
          if (verifyRes.ok && verifyData.success) {
            router.push('/dashboard?upgraded=true')
          } else {
            setError(verifyData.error || 'Payment verification failed')
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      })

      razorpay.open()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-darker to-dark text-white">
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="bg-darker border border-purple/20 rounded-lg p-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
            <p className="text-gray-400 mb-6">Secure payment with Razorpay</p>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {/* Currency Toggle */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-gray-400">Currency:</span>
              <div className="flex bg-dark border border-purple/20 rounded-lg overflow-hidden">
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-4 py-2 text-sm font-medium transition ${currency === 'USD' ? 'bg-purple text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  $ USD
                </button>
                <button
                  onClick={() => setCurrency('INR')}
                  className={`px-4 py-2 text-sm font-medium transition ${currency === 'INR' ? 'bg-purple text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  ₹ INR
                </button>
              </div>
            </div>

            <div className="bg-dark border border-purple/20 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-2">{selectedTier.name} Plan</h2>
              <div className="text-4xl font-bold mb-1">
                {currency === 'INR' ? `₹${selectedTier.inr}` : `$${selectedTier.usd}`}
                <span className="text-lg text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Billed in {currency}. Cancel anytime.
              </p>

              <button
                onClick={handlePayment}
                disabled={loading || !razorpayLoaded}
                className="w-full bg-cyan hover:bg-cyan-dark text-dark font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {!razorpayLoaded ? 'Loading...' : loading ? 'Processing...' : `Pay ${currency === 'INR' ? `₹${selectedTier.inr}` : `$${selectedTier.usd}`} Now`}
              </button>

              <p className="text-center text-xs text-gray-500 mt-3">
                30-day money-back guarantee.
              </p>
            </div>

            <Link href="/pricing" className="text-center block text-cyan hover:text-cyan-dark text-sm">
              ← Back to Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
