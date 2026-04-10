'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type ContentItem = {
  id: string
  content_type: 'tip' | 'prompt' | 'template'
  title: string
  description: string
  difficulty: string
  tier_required: string
  tags: string[]
  rating: number
  view_count: number
}

type UserProfile = {
  id: string
  email: string
  full_name: string
  tier: string
}

const TIER_ACCESS: Record<string, string[]> = {
  basic: ['basic'],
  pro:   ['basic', 'pro'],
  vip:   ['basic', 'pro', 'vip'],
}

const TIER_COLORS: Record<string, string> = {
  basic: 'bg-slate-700 text-slate-300',
  pro:   'bg-blue-900 text-blue-300',
  vip:   'bg-yellow-900 text-yellow-300',
}

const TYPE_ICONS: Record<string, string> = {
  tip:      '💡',
  prompt:   '🤖',
  template: '📄',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     'text-green-400',
  intermediate: 'text-yellow-400',
  advanced:     'text-red-400',
}

export default function LibraryPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [items, setItems] = useState<ContentItem[]>([])
  const [filtered, setFiltered] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeType, setActiveType] = useState<'all' | 'tip' | 'prompt' | 'template'>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 60

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: profile, error: profileErr } = await supabase
        .from('users')
        .select('id, email, full_name, tier')
        .eq('id', session.user.id)
        .single()

      if (profileErr || !profile) {
        setError('Could not load your profile. Please log out and back in.')
        setLoading(false)
        return
      }

      setUser(profile)

      const allowedTiers = TIER_ACCESS[profile.tier] ?? ['basic']
      const { data, error: fetchErr } = await supabase
        .from('content_items')
        .select('id, content_type, title, description, difficulty, tier_required, tags, rating, view_count')
        .eq('content_status', 'published')
        .in('tier_required', allowedTiers)
        .order('created_at', { ascending: false })

      if (fetchErr) {
        setError('Failed to load content: ' + fetchErr.message)
      } else {
        setItems(data ?? [])
        setFiltered(data ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    let result = items
    if (activeType !== 'all') result = result.filter(i => i.content_type === activeType)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        (i.tags ?? []).some(t => t.toLowerCase().includes(q))
      )
    }
    setFiltered(result)
    setPage(1)
  }, [activeType, search, items])

  const counts = {
    all:      items.length,
    tip:      items.filter(i => i.content_type === 'tip').length,
    prompt:   items.filter(i => i.content_type === 'prompt').length,
    template: items.filter(i => i.content_type === 'template').length,
  }

  const visible = filtered.slice(0, page * PER_PAGE)
  const hasMore = visible.length < filtered.length

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading your content library…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-8 max-w-md text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-400 hover:text-white underline">Back to dashboard</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Content Library</h1>
        <div className="flex items-center gap-3">
          {user && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${TIER_COLORS[user.tier] ?? 'bg-gray-700 text-gray-300'}`}>
              {user.tier}
            </span>
          )}
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-1.5 text-sm w-52 focus:outline-none focus:border-purple-500 placeholder-gray-500"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {user && user.tier !== 'vip' && (
          <div className="mb-6 bg-purple-900/20 border border-purple-500/30 rounded-xl px-5 py-3 flex items-center justify-between">
            <p className="text-sm text-purple-300">
              You are on the <span className="font-semibold capitalize">{user.tier}</span> plan.{' '}
              {user.tier === 'basic' ? 'Upgrade to Pro or VIP to unlock 400+ more items.' : 'Upgrade to VIP to unlock exclusive content.'}
            </p>
            <button
              onClick={() => router.push('/pricing')}
              className="text-xs bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-lg font-medium transition"
            >
              Upgrade
            </button>
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'tip', 'prompt', 'template'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeType === t
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {t === 'all' ? 'All' : `${TYPE_ICONS[t]} ${t.charAt(0).toUpperCase() + t.slice(1)}s`}
              <span className="ml-2 text-xs opacity-60">{counts[t]}</span>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Showing {visible.length} of {filtered.length} items
          {search && ` matching "${search}"`}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-3">🔍</p>
            <p>No content found{search ? ` for "${search}"` : ''}.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visible.map(item => (
                <div
                  key={item.id}
                  className="bg-white/3 border border-white/8 rounded-xl p-5 flex flex-col gap-3 hover:border-purple-500/40 transition group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xl">{TYPE_ICONS[item.content_type]}</span>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${TIER_COLORS[item.tier_required] ?? 'bg-gray-700 text-gray-300'}`}>
                        {item.tier_required}
                      </span>
                      <span className={`text-xs font-medium ${DIFFICULTY_COLORS[item.difficulty] ?? 'text-gray-400'}`}>
                        {item.difficulty}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold leading-snug text-white/90 line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-xs text-gray-500">⭐ {item.rating} · {item.view_count} views</span>
                    <button
                      onClick={() => router.push(`/library/${item.content_type}/${item.id}`)}
                      className="text-xs bg-purple-600/80 hover:bg-purple-500 px-3 py-1.5 rounded-lg font-medium transition group-hover:bg-purple-500"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2.5 rounded-xl text-sm font-medium transition"
                >
                  Load more ({filtered.length - visible.length} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
