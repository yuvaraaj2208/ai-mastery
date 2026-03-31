'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function TemplateDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [template, setTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const { data: templateData, error: templateError } = await supabase
          .from('content_items')
          .select('*')
          .eq('id', id)
          .single()

        if (templateError) throw templateError

        const { data: detailData, error: detailError } = await supabase
          .from('templates_content')
          .select('*')
          .eq('content_id', id)
          .single()

        if (detailError) throw detailError

        setTemplate({ ...templateData, ...detailData })
      } catch (err) {
        setError('Failed to load template')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchTemplate()
  }, [id])

  if (loading) return <div className="min-h-screen bg-dark text-white flex items-center justify-center">Loading...</div>
  if (error) return <div className="min-h-screen bg-dark text-white flex items-center justify-center text-red-400">{error}</div>
  if (!template) return <div className="min-h-screen bg-dark text-white flex items-center justify-center">Template not found</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-darker to-dark text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-dark/80 border-b border-purple/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/library" className="text-cyan hover:text-cyan-dark">
            ← Back to Library
          </Link>
        </div>
      </nav>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-block bg-yellow/20 text-yellow px-4 py-2 rounded-lg mb-4 text-sm">
            Template
          </div>
          <h1 className="text-5xl font-bold mb-4">{template.title}</h1>
          <p className="text-xl text-gray-400 mb-6">{template.description}</p>
          <div className="flex gap-4">
            <span className="bg-yellow/20 text-yellow px-3 py-1 rounded text-sm">
              {template.difficulty_to_use}
            </span>
            <span className="bg-cyan/20 text-cyan px-3 py-1 rounded text-sm">
              {template.tier_required}
            </span>
          </div>
        </div>

        {/* Type & Time Saved */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-darker border border-purple/20 p-6 rounded-lg">
            <h3 className="text-sm text-gray-400 mb-2">Template Type</h3>
            <p className="text-2xl font-bold">{template.template_type}</p>
          </div>
          <div className="bg-darker border border-purple/20 p-6 rounded-lg">
            <h3 className="text-sm text-gray-400 mb-2">Time Saved</h3>
            <p className="text-2xl font-bold text-cyan">{template.time_saved}</p>
          </div>
        </div>

        {/* Use Cases */}
        {template.use_cases && template.use_cases.length > 0 && (
          <div className="bg-darker border-l-4 border-purple p-6 mb-8 rounded">
            <h2 className="text-lg font-bold mb-4">📌 Perfect For</h2>
            <ul className="space-y-2">
              {template.use_cases.map((useCase: string) => (
                <li key={useCase} className="flex gap-3">
                  <span className="text-purple">✓</span>
                  <span>{useCase}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Included Elements */}
        {template.included_elements && template.included_elements.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">📦 What's Included</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {template.included_elements.map((element: string) => (
                <div key={element} className="bg-darker border border-cyan/20 p-4 rounded-lg flex gap-3">
                  <span className="text-cyan text-xl">📋</span>
                  <span>{element}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customization Level */}
        <div className="bg-darker border-2 border-cyan p-8 mb-12 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">🎨 Customization Level</h2>
          <p className="text-lg text-gray-200 mb-4">{template.customization_level}</p>
          <div className="w-full bg-dark rounded-full h-3">
            <div className="bg-gradient-to-r from-cyan to-purple h-3 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <p className="text-sm text-gray-400 mt-2">Easy to customize - Just fill in your details</p>
        </div>

        {/* Download CTA */}
        <div className="bg-gradient-to-r from-cyan to-purple p-1 rounded-lg mb-12">
          <div className="bg-dark p-12 rounded-lg text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to use this template?</h3>
            <p className="text-gray-400 mb-8">Download and customize for your needs</p>
            <button
              onClick={() => alert('Download feature coming soon! Check back in 24 hours.')}
              className="inline-block bg-cyan hover:bg-cyan-dark text-dark font-bold px-8 py-3 rounded-lg transition"
            >
              📥 Download Template
            </button>
            <p className="text-sm text-gray-400 mt-4">Saves you {template.time_saved} of work</p>
          </div>
        </div>

        {/* Related */}
        <div className="text-center">
          <Link
            href="/library"
            className="inline-block bg-purple hover:bg-purple-dark text-white font-bold px-8 py-3 rounded-lg transition"
          >
            Explore More Templates
          </Link>
        </div>
      </section>
    </div>
  )
}
