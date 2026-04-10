'use client'

import { useEffect, useState, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

type UserProfile = {
  id: string
  email: string
  full_name: string
  tier: string
}

const TIER_STYLES: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  basic: { bg: 'bg-slate-700',  text: 'text-slate-200',  label: 'Basic',  icon: '🔵' },
  pro:   { bg: 'bg-blue-800',   text: 'text-blue-200',   label: 'Pro',    icon: '⚡' },
  vip:   { bg: 'bg-yellow-800', text: 'text-yellow-200', label: 'VIP',    icon: '👑' },
}

const NAV_LINKS = [
  { href: '/dashboard',  label: 'Dashboard', icon: '🏠' },
  { href: '/library',    label: 'Library',   icon: '📚' },
  { href: '/profile',    label: 'Profile',   icon: '👤' },
]

export default function TopNav() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase
        .from('users')
        .select('id, email, full_name, tier')
        .eq('id', session.user.id)
        .single()
      if (data) setUser(data)
    }
    loadUser()
  }, [])

  // Close menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const tier = user?.tier ?? 'basic'
  const tierStyle = TIER_STYLES[tier] ?? TIER_STYLES.basic
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

        {/* LEFT — Logo + Nav links */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-base font-bold tracking-tight">
            <span className="text-purple-400">AI</span>
            <span className="text-white"> Mastery</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => {
              const active = pathname === link.href || pathname?.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                    active
                      ? 'bg-purple-600/20 text-purple-300 font-medium'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-xs">{link.icon}</span>
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* RIGHT — Tier badge + avatar menu */}
        <div className="flex items-center gap-3" ref={menuRef}>

          {/* Tier badge */}
          {user && (
            <span className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${tierStyle.bg} ${tierStyle.text}`}>
              {tierStyle.icon} {tierStyle.label}
            </span>
          )}

          {/* Avatar button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white hover:bg-purple-500 transition"
          >
            {initials}
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute top-14 right-4 w-64 bg-[#111118] border border-white/10 rounded-xl shadow-2xl overflow-hidden">

              {/* User info */}
              <div className="px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user?.full_name || 'Member'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${tierStyle.bg} ${tierStyle.text}`}>
                    {tierStyle.icon} {tierStyle.label} Plan
                  </span>
                  {tier !== 'vip' && (
                    <Link
                      href="/pricing"
                      onClick={() => setMenuOpen(false)}
                      className="text-xs text-purple-400 hover:text-purple-300 underline"
                    >
                      Upgrade →
                    </Link>
                  )}
                </div>
              </div>

              {/* Nav links (mobile + dropdown) */}
              <div className="py-1">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </Link>
                ))}

                <Link
                  href="/pricing"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                >
                  <span>💎</span>
                  Plans & Pricing
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-white/5 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
                >
                  <span>🚪</span>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
