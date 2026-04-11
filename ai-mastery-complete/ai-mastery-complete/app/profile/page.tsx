'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data } = await supabase
        .from('users')
        .select('id, email, name, tier, subscription_status, created_at')
        .eq('id', session.user.id)
        .single()

      if (data) setUser(data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const TIER_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
    basic: { bg: 'bg-slate-700', text: 'text-slate-200', icon: '🔵' },
    pro:   { bg: 'bg-blue-800',  text: 'text-blue-200',  icon: '⚡' },
    vip:   { bg: 'bg-yellow-800',text: 'text-yellow-200',icon: '👑' },
  }
  const tierStyle = TIER_STYLES[user?.tier] ?? TIER_STYLES.basic

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-gray-400 mb-8">Manage your account settings</p>

        <div className="bg-white/3 border border-white/8 rounded-xl p-8 mb-6">
          <h2 className="text-lg font-semibold mb-6">Account Information</h2>
          <div className="space-y-5">
            <div>
              <p className="text-xs text-gray-500 mb-1">Name</p>
              <p className="text-base font-medium">{user?.name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="text-base font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Current Plan</p>
              <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full font-semibold ${tierStyle.bg} ${tierStyle.text}`}>
                {tierStyle.icon} {user?.tier?.toUpperCase()} Plan
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Subscription Status</p>
              <span className={`text-sm font-medium ${user?.subscription_status === 'active' ? 'text-green-400' : 'text-gray-400'}`}>
                {user?.subscription_status === 'active' ? '✓ Active' : user?.subscription_status || 'Free'}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Member Since</p>
              <p className="text-sm text-gray-300">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {user?.tier !== 'vip' && (
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl px-6 py-4 mb-6 flex items-center justify-between">
            <p className="text-sm text-purple-300">Upgrade to unlock more content</p>
            <button
              onClick={() => router.push('/pricing')}
              className="text-xs bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-lg font-medium transition"
            >
              Upgrade →
            </button>
          </div>
        )}

        <div className="bg-white/3 border border-white/8 rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-3 text-red-400">Danger Zone</h3>
          <button
            onClick={handleLogout}
            className="bg-red-600/80 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg transition text-sm"
          >
            Sign Out
          </button>
          <p className="text-gray-500 text-xs mt-2">You will be redirected to the login page.</p>
        </div>
      </div>
    </div>
  )
}
