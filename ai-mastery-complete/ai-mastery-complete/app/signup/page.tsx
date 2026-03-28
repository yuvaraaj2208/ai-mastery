'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SignupPage() {
  const [step, setStep] = useState<'tier-select' | 'details'>('tier-select')
  const [selectedTier, setSelectedTier] = useState<'basic' | 'pro' | 'vip' | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark to-darker text-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-cyan">AI</span> Mastery
          </h1>
          <p className="text-gray-400">Join thousands of successful members today</p>
        </div>

        <div className="bg-darker/80 border border-purple/30 rounded-2xl p-8">
          {step === 'tier-select' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
              {[
                { id: 'basic', name: 'Basic', price: 35 },
                { id: 'pro', name: 'Pro', price: 99 },
                { id: 'vip', name: 'VIP', price: 299 },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => {
                    setSelectedTier(tier.id )
                    setStep('details')
                  }}
                  className="w-full text-left p-4 border-2 border-purple/30 rounded-lg hover:border-cyan hover:bg-cyan/5 transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{tier.name}</h3>
                      <p className="text-gray-400 text-sm">${tier.price}/month</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">Create Your Account</h2>

              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 bg-darker border border-purple/30 rounded-lg focus:border-cyan focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 bg-darker border border-purple/30 rounded-lg focus:border-cyan focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-darker border border-purple/30 rounded-lg focus:border-cyan focus:outline-none transition"
                />
              </div>

              <div className="space-y-4 pt-4">
                <button className="w-full bg-cyan hover:bg-cyan-dark text-dark py-2 rounded-lg font-semibold transition">
                  Continue to Payment
                </button>
                <button
                  onClick={() => setStep('tier-select')}
                  className="w-full bg-darker border border-purple/30 hover:border-cyan py-2 rounded-lg font-semibold transition"
                >
                  Back
                </button>
              </div>

              <p className="text-center text-gray-400 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-cyan hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
