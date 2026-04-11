'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type UserProfile = {
  id: string
  email: string
  name: string
  tier: string
}

const TIER_COUNTS: Record<string, { tips: string; prompts: string; templates: string }> = {
  basic: { tips: '58',  prompts: '135', templates: '46'  },
  pro:   { tips: '113', prompts: '460', templates: '126' },
  vip:   { tips: '178', prompts: '591', templates: '231' },
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState<'library' | 'courses' | 'community'>('library')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data } = await supabase
        .from('users')
        .select('id, email, name, tier')
        .eq('id', session.user.id)
        .single()

      if (data) setUser(data)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const tier = user?.tier ?? 'basic'
  const counts = TIER_COUNTS[tier] ?? TIER_COUNTS.basic

  const contentCategories = [
    { name: 'Tips',      icon: '💡', count: counts.tips,      href: '/library?type=tip'      },
    { name: 'Prompts',   icon: '🤖', count: counts.prompts,   href: '/library?type=prompt'   },
    { name: 'Templates', icon: '📄', count: counts.templates, href: '/library?type=template' },
    { name: 'Videos',    icon: '🎥', count: 'Soon',           href: '#'                      },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-darker to-dark text-white">

      {/* Welcome */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-2">
          {user ? `Welcome, ${user.name || user.email.split('@')[0]}! 👋` : 'Welcome! 👋'}
        </h1>
        <p className="text-gray-400">
          {tier === 'vip'
            ? 'You have full VIP access to all content.'
            : tier === 'pro'
            ? 'You have Pro access. Upgrade to VIP to unlock everything.'
            : 'You are on the Basic plan. Upgrade to unlock 400+ more items.'}
        </p>
        {tier !== 'vip' && (
          <Link href="/pricing" className="inline-block mt-3 text-sm bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-medium transition">
            Upgrade Plan →
          </Link>
        )}
      </section>

      {/* Content Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {contentCategories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="bg-darker border border-purple/20 hover:border-cyan/50 rounded-lg p-6 text-center transition"
            >
              <div className="text-4xl mb-3">{cat.icon}</div>
              <h3 className="font-bold mb-1">{cat.name}</h3>
              <p className="text-cyan text-sm">{cat.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 border-b border-purple/20 mb-8">
          <button
            onClick={() => setActiveTab('library')}
            className={`pb-4 font-semibold ${activeTab === 'library' ? 'border-b-2 border-cyan text-cyan' : 'text-gray-400'}`}
          >
            📚 Content Library
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-4 font-semibold ${activeTab === 'courses' ? 'border-b-2 border-cyan text-cyan' : 'text-gray-400'}`}
          >
            🎓 Courses
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`pb-4 font-semibold ${activeTab === 'community' ? 'border-b-2 border-cyan text-cyan' : 'text-gray-400'}`}
          >
            💬 Community
          </button>
        </div>

        {activeTab === 'library' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">📚 Content Library</h2>
            <p className="text-gray-400 mb-6">
              You have access to {parseInt(counts.tips) + parseInt(counts.prompts) + parseInt(counts.templates)}+ items on your {tier} plan.
            </p>
            <Link
              href="/library"
              className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Browse Full Library →
            </Link>
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">🎓 Courses</h2>
            <div className="bg-darker border border-purple/20 rounded-lg p-8 text-center">
              <p className="text-gray-400">Courses are being prepared — coming soon!</p>
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">💬 Community</h2>
            <div className="bg-darker border border-purple/20 rounded-lg p-8 text-center">
              <p className="text-gray-400 mb-4">Join our Discord community to connect with other members!</p>
              <a
                href="https://discord.gg/your-invite-link"
                className="inline-block bg-cyan hover:bg-cyan-dark text-dark px-6 py-2 rounded-lg font-semibold transition"
              >
                Join Discord
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
