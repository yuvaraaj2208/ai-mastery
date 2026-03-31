'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'pricing'>('form')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const PRICING_TIERS = [
    {
      name: 'Basic',
      price: 35,
      description: 'Get started with AI education',
      features: ['100+ AI tips & tutorials', '500+ copy-paste prompts', '200+ pre-filled templates', 'Discord community'],
    },
    {
      name: 'Pro',
      price: 99,
      description: 'Accelerate your AI journey',
      features: ['Everything in Basic +', '2x monthly group webinars', 'Priority Discord support', 'Early template access'],
      highlighted: true,
    },
    {
      name: 'VIP',
      price: 299,
      description: 'Premium AI mastery',
      features: ['Everything in Pro +', '1-on-1 monthly coaching', 'Custom AI workflow setup', 'Direct Slack channel'],
    },
  ]

  // STEP 1: Handle signup form submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // Call signup API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          trialUntil: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Signup failed')
        return
      }

      // Signup successful - show pricing (they still need to pay for ongoing access)
      localStorage.setItem('userEmail', formData.email)
      setStep('pricing')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // STEP 2: Handle tier selection (after signup)
  const handleSelectTier = (tier: string) => {
    router.push(`/checkout?tier=${tier}&trialEnded=true`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-darker to-dark text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-dark/80 border-b border-purple/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="text-cyan">AI</span> Mastery
          </div>
          <Link href="/login" className="hover:text-cyan transition">
            Already have an account? Login
          </Link>
        </div>
      </nav>

      {step === 'form' ? (
        // SIGNUP FORM
        <section className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md">
            <div className="bg-darker border border-purple/20 rounded-lg p-8">
              <h1 className="text-3xl font-bold mb-2">Start Your Free Trial</h1>
              <p className="text-gray-400 mb-8">Get 48 hours of full access. No credit card required.</p>

              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-dark border border-purple/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-cyan focus:outline-none"
                    placeholder="Sarah Johnson"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-dark border border-purple/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-cyan focus:outline-none"
                    placeholder="sarah@example.com"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-dark border border-purple/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-cyan focus:outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-dark border border-purple/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-cyan focus:outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan hover:bg-cyan-dark text-dark font-semibold py-2 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Starting Trial...' : 'Start Your Free Trial (48 Hours)'}
                </button>

                <p className="text-center text-sm text-gray-400 mt-4">
                  By signing up, you agree to our Terms of Service
                </p>
              </form>
            </div>
          </div>
        </section>
      ) : (
        // PRICING SELECTION (After signup, before payment)
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-gray-400">Your 48-hour trial ends soon. Choose how to continue.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-lg p-8 transition ${
                  tier.highlighted
                    ? 'bg-gradient-to-b from-purple/30 to-purple/10 border-2 border-cyan scale-105 shadow-2xl'
                    : 'bg-darker border border-purple/20 hover:border-cyan/50'
                }`}
              >
                {tier.highlighted && <div className="text-cyan text-sm font-semibold mb-4">POPULAR</div>}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-gray-400 mb-6 text-sm">{tier.description}</p>
                <div className="mb-6">
                  <div className="text-5xl font-bold mb-2">
                    ${tier.price}<span className="text-lg text-gray-400">/month</span>
                  </div>
                </div>
                <button
                  onClick={() => handleSelectTier(tier.name.toLowerCase())}
                  className={`w-full py-3 rounded-lg font-semibold mb-8 transition ${
                    tier.highlighted ? 'bg-cyan text-dark hover:bg-cyan-dark' : 'bg-purple hover:bg-purple-dark'
                  }`}
                >
                  Choose {tier.name}
                </button>
                <div className="space-y-4">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex gap-3">
                      <span className="text-cyan">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
