'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<'tips' | 'prompts' | 'templates'>('tips')
  const [tips, setTips] = useState<any[]>([])
  const [prompts, setPrompts] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data: tipsData } = await supabase
          .from('content_items')
          .select('*')
          .eq('content_type', 'tip')
          .order('created_at', { ascending: false })

        setTips(tipsData || [])

        const { data: promptsData } = await supabase
          .from('content_items')
          .select('*')
          .eq('content_type', 'prompt')
          .order('created_at', { ascending: false })

        setPrompts(promptsData || [])

        const { data: templatesData } = await supabase
          .from('content_items')
          .select('*')
          .eq('content_type', 'template')
          .order('created_at', { ascending: false })

        setTemplates(templatesData || [])
      } catch (error) {
        console.error('Error fetching content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  const filteredTips = tips.filter(tip =>
    tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tip.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPrompts = prompts.filter(prompt =>
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-darker to-dark text-white">
      {/* Header with Search */}
      <div className="bg-darker border-b border-purple/20 sticky top-0 z-40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Content Library 📚</h1>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tips, prompts, templates..."
              className="w-full px-5 py-3 bg-dark border border-purple/30 rounded-lg focus:border-cyan focus:outline-none transition"
            />
            <span className="absolute right-4 top-3.5 text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 border-b border-purple/20 mb-8">
          <button
            onClick={() => setActiveTab('tips')}
            className={`pb-4 font-semibold ${
              activeTab === 'tips'
                ? 'border-b-2 border-cyan text-cyan'
                : 'text-gray-400 hover:text-cyan'
            }`}
          >
            💡 Tips ({filteredTips.length})
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`pb-4 font-semibold ${
              activeTab === 'prompts'
                ? 'border-b-2 border-cyan text-cyan'
                : 'text-gray-400 hover:text-cyan'
            }`}
          >
            ✨ Prompts ({filteredPrompts.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-4 font-semibold ${
              activeTab === 'templates'
                ? 'border-b-2 border-cyan text-cyan'
                : 'text-gray-400 hover:text-cyan'
            }`}
          >
            📋 Templates ({filteredTemplates.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <p>Loading content...</p>
          </div>
        ) : (
          <>
            {/* TIPS */}
            {activeTab === 'tips' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTips.length > 0 ? (
                  filteredTips.map((tip) => (
                    <div key={tip.id} className="bg-darker border border-purple/20 hover:border-cyan/50 rounded-lg p-6 transition">
                      <h3 className="text-lg font-semibold mb-3">{tip.title}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{tip.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs bg-purple/20 px-2 py-1 rounded">{tip.difficulty}</span>
                        <Link
                          href={`/library/tip/${tip.id}`}
                          className="bg-cyan hover:bg-cyan-dark text-dark px-4 py-1 rounded font-semibold text-sm transition"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No tips found</p>
                )}
              </div>
            )}

            {/* PROMPTS */}
            {activeTab === 'prompts' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrompts.length > 0 ? (
                  filteredPrompts.map((prompt) => (
                    <div key={prompt.id} className="bg-darker border border-purple/20 hover:border-purple/50 rounded-lg p-6 transition">
                      <h3 className="text-lg font-semibold mb-3">{prompt.title}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{prompt.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs bg-purple/20 px-2 py-1 rounded">{prompt.difficulty}</span>
                        <Link
                          href={`/library/prompt/${prompt.id}`}
                          className="bg-purple hover:bg-purple-dark text-white px-4 py-1 rounded font-semibold text-sm transition"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No prompts found</p>
                )}
              </div>
            )}

            {/* TEMPLATES */}
            {activeTab === 'templates' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((template) => (
                    <div key={template.id} className="bg-darker border border-purple/20 hover:border-yellow/50 rounded-lg p-6 transition">
                      <h3 className="text-lg font-semibold mb-3">{template.title}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs bg-yellow/20 px-2 py-1 rounded">{template.difficulty}</span>
                        <Link
                          href={`/library/template/${template.id}`}
                          className="bg-yellow hover:bg-yellow-dark text-dark px-4 py-1 rounded font-semibold text-sm transition"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No templates found</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
