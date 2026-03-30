'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<number | null>(null)

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-darker to-dark text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-dark/80 border-b border-purple/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-cyan">AI</span> Mastery
          </Link>
          <Link href="/login" className="hover:text-cyan transition">
            Login
          </Link>
        </div>
      </nav>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h1>
        <p className="text-center text-gray-400 mb-16">Choose the plan that's right for you</p>

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
                  ${tier.price}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
              </div>
              <Link
                href={`/checkout?tier=${tier.name.toLowerCase()}`}
                className={`w-full py-3 rounded-lg font-semibold mb-8 transition block text-center ${
                  tier.highlighted
                    ? 'bg-cyan text-dark hover:bg-cyan-dark'
                    : 'bg-purple hover:bg-purple-dark'
                }`}
              >
                Start Free Trial
              </Link>
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

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Do I need prior AI knowledge?', a: 'No! Our content is designed for beginners.' },
            { q: 'What if I don\'t like it?', a: '30-day money-back guarantee. No questions asked.' },
            { q: 'Can I cancel anytime?', a: 'Yes. You can cancel anytime with no hidden fees.' },
          ].map((faq, idx) => (
            <div key={idx} className="border border-purple/20 rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveTab(activeTab === idx ? null : idx)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-darker/50 transition"
              >
                <span className="font-semibold">{faq.q}</span>
                <span className={`text-cyan transition transform ${activeTab === idx ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {activeTab === idx && (
                <div className="px-6 pb-6 text-gray-400 border-t border-purple/20">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple/20 py-12 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
        <p>&copy; 2024 AI Mastery. All rights reserved.</p>
      </footer>
    </div>
  )
}
