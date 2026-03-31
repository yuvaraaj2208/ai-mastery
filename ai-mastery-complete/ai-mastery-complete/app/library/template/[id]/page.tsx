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
        console.log('Fetching template with ID:', id)

        const { data: templateData, error: templateError } = await supabase
          .from('content_items')
          .select('*')
          .eq('id', id)
          .single()

        if (templateError) {
          console.error('Error fetching template:', templateError)
          throw templateError
        }

        console.log('Template data:', templateData)

        const { data: detailData, error: detailError } = await supabase
          .from('templates_content')
          .select('*')
          .eq('content_id', id)
          .single()

        if (detailError) {
          console.error('Error fetching template details:', detailError)
          throw detailError
        }

        console.log('Template details:', detailData)

        setTemplate({ ...templateData, ...detailData })
      } catch (err: any) {
        console.error('Template fetch error:', err)
        setError(err.message || 'Failed to load template')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchTemplate()
  }, [id])

  const handleDownload = () => {
    if (!template) return

    // Create comprehensive template content
    const content = `
================================================================================
                          ${template.title?.toUpperCase() || 'TEMPLATE'}
================================================================================

DESCRIPTION:
${template.description || 'N/A'}

TEMPLATE TYPE:
${template.template_type || 'N/A'}

TIME SAVED:
${template.time_saved || 'N/A'}

================================================================================
                            WHAT'S INCLUDED
================================================================================
${template.included_elements && template.included_elements.length > 0
  ? template.included_elements.map((item: string) => `✓ ${item}`).join('\n')
  : 'No elements listed'}

================================================================================
                              USE CASES
================================================================================
${template.use_cases && template.use_cases.length > 0
  ? template.use_cases.map((useCase: string) => `• ${useCase}`).join('\n')
  : 'No use cases listed'}

================================================================================
                        CUSTOMIZATION LEVEL
================================================================================
${template.customization_level || 'Easy'}

Difficulty to Use: ${template.difficulty_to_use || 'Beginner friendly'}

================================================================================
                            HOW TO USE
================================================================================

1. Download this template
2. Open in your text editor or word processor
3. Fill in the sections with your own content
4. Customize as needed for your specific use case
5. Save and use!

================================================================================
                         TEMPLATE SECTIONS
================================================================================

[SECTION 1: YOUR MAIN CONTENT HERE]
Add your content in this section. Replace this placeholder with your actual 
information. You can add as much detail as you need.

[SECTION 2: ADDITIONAL INFORMATION]
Add more details, examples, or instructions here. This is where you expand 
on the main content.

[SECTION 3: ACTION ITEMS]
- Action 1
- Action 2
- Action 3

[SECTION 4: NOTES]
Add any additional notes or reminders specific to your use case.

================================================================================
                           QUICK TIPS
================================================================================

- This template is designed to be flexible and customizable
- You can add or remove sections as needed
- Feel free to adjust the structure to match your workflow
- Save multiple versions if you're testing different approaches
- Share with your team and get feedback

================================================================================

Downloaded from AI Mastery
Date: ${new Date().toLocaleString()}
Platform: https://ai-mastery-roan.vercel.app

This template is part of your AI Mastery membership. 
For more templates, tips, and prompts, visit your dashboard.

================================================================================
    `.trim()

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${template.title?.replace(/\s+/g, '-').toLowerCase() || 'template'}-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <p>Loading template...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/library" className="text-cyan hover:text-cyan-dark">
            ← Back to Library
          </Link>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Template not found</p>
          <Link href="/library" className="text-cyan hover:text-cyan-dark">
            ← Back to Library
          </Link>
        </div>
      </div>
    )
  }

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
          <div className="inline-block bg-cyan/20 text-cyan px-4 py-2 rounded-lg mb-4 text-sm">
            Template
          </div>
          <h1 className="text-5xl font-bold mb-4">{template.title}</h1>
          <p className="text-xl text-gray-400 mb-6">{template.description}</p>
          <div className="flex gap-4">
            <span className="bg-cyan/20 text-cyan px-3 py-1 rounded text-sm">
              {template.difficulty_to_use || 'Easy'}
            </span>
            <span className="bg-cyan/20 text-cyan px-3 py-1 rounded text-sm">
              {template.tier_required || 'Basic'}
            </span>
          </div>
        </div>

        {/* Type & Time Saved */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-darker border border-purple/20 p-6 rounded-lg">
            <h3 className="text-sm text-gray-400 mb-2">Template Type</h3>
            <p className="text-2xl font-bold">{template.template_type || 'Template'}</p>
          </div>
          <div className="bg-darker border border-purple/20 p-6 rounded-lg">
            <h3 className="text-sm text-gray-400 mb-2">Time Saved</h3>
            <p className="text-2xl font-bold text-cyan">{template.time_saved || '5+ hours'}</p>
          </div>
        </div>

        {/* Use Cases */}
        {template.use_cases && template.use_cases.length > 0 && (
          <div className="bg-darker border-l-4 border-cyan p-6 mb-8 rounded">
            <h2 className="text-lg font-bold mb-4">📌 Perfect For</h2>
            <ul className="space-y-2">
              {template.use_cases.map((useCase: string, idx: number) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-cyan">✓</span>
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
              {template.included_elements.map((element: string, idx: number) => (
                <div key={idx} className="bg-darker border border-cyan/20 p-4 rounded-lg flex gap-3">
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
          <p className="text-lg text-gray-200 mb-4">{template.customization_level || 'Easy to customize'}</p>
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
              onClick={handleDownload}
              className="inline-block bg-cyan hover:bg-cyan-dark text-dark font-bold px-8 py-3 rounded-lg transition"
            >
              📥 Download Template
            </button>
            <p className="text-sm text-gray-400 mt-4">Saves you {template.time_saved || '5+ hours'} of work</p>
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
