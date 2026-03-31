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
        // Fetch tips
        const { data: tipsData, error: tipsError } = await supabase
          .from('content_items')
          .select('*')
          .eq('content_type', 'tip')

        if (tipsError) console.error('Tips error:', tipsError)
        setTips(tipsData || [])

        // Fetch prompts
        const { data: promptsData, error: promptsError } = await supabase
          .from('content_items')
          .select('*')
          .eq('content_type', 'prompt')

        if (promptsError) console.error('Prompts error:', promptsError)
        setPrompts(promptsData || [])

        // Fetch templates
        const { data: templatesData, error: templatesError } = await supabase
          .from('content_items')
          .select('*')
          .eq('content_type', 'template')

        if (templatesError) console.error('Templates error:', templatesError)
        console.log('Templates fetched:', templatesData)
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
    tip.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPrompts = prompts.filter(prompt =>
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-darker to-dark text-white">
      {/* Header */}
      <div className="bg-darker border-b border-purple/20 sticky top-0 z-40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Content Library 📚</h1>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tips, prompts, templates..."
              className="w-full px-5 py-3 bg-dark border border-purple/30 rounded-lg focus:border-cyan focus:outline-none"
            />
            <span className="absolute right-4 top-3.5 text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 border-b border-purple/20 mb-8">
          <button
            onClick={() => setActiveTab('tips')}
            className={`pb-4 font-semibold ${activeTab === 'tips' ? 'border-b-2 border-cyan text-cyan' : 'text-gray-400'}`}
          >
            💡 Tips ({filteredTips.length})
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`pb-4 font-semibold ${activeTab === 'prompts' ? 'border-b-2 border-cyan text-cyan' : 'text-gray-400'}`}
          >
            ✨ Prompts ({filteredPrompts.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-4 font-semibold ${activeTab === 'templates' ? 'border-b-2 border-cyan text-cyan' : 'text-gray-400'}`}
          >
            📋 Templates ({filteredTemplates.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : (
          <>
            {/* TIPS */}
            {activeTab === 'tips' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTips.map(tip => (
                  <div key={tip.id} className="bg-darker border border-purple/20 hover:border-cyan/50 rounded-lg p-6 transition">
                    <h3 className="text-lg font-semibold mb-3">{tip.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{tip.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{tip.difficulty}</span>
                      <Link href={`/library/tip/${tip.id}`} className="bg-cyan hover:bg-cyan-dark text-dark px-4 py-1 rounded font-semibold text-sm">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PROMPTS */}
            {activeTab === 'prompts' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrompts.map(prompt => (
                  <div key={prompt.id} className="bg-darker border border-purple/20 hover:border-purple/50 rounded-lg p-6 transition">
                    <h3 className="text-lg font-semibold mb-3">{prompt.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{prompt.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{prompt.difficulty}</span>
                      <Link href={`/library/prompt/${prompt.id}`} className="bg-purple hover:bg-purple-dark text-white px-4 py-1 rounded font-semibold text-sm">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TEMPLATES */}
            {activeTab === 'templates' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map(template => (
                    <div key={template.id} className="bg-darker border border-purple/20 hover:border-yellow/50 rounded-lg p-6 transition">
                      <h3 className="text-lg font-semibold mb-3">{template.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{template.difficulty}</span>
                        <Link href={`/library/template/${template.id}`} className="bg-yellow hover:bg-yellow-dark text-dark px-4 py-1 rounded font-semibold text-sm">
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
