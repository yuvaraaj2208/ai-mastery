'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PromptDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [prompt, setPrompt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const { data: promptData, error: promptError } = await supabase
          .from('content_items')
          .select('*')
          .eq('id', id)
          .single()

        if (promptError) throw promptError

        const { data: detailData, error: detailError } = await supabase
          .from('prompts_content')
          .select('*')
          .eq('content_id', id)
          .single()

        if (detailError) throw detailError

        setPrompt({ ...promptData, ...detailData })
      } catch (err) {
        setError('Failed to load prompt')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchPrompt()
  }, [id])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="min-h-screen bg-dark text-white flex items-center justify-center">Loading...</div>
  if (error) return <div className="min-h-screen bg-dark text-white flex items-center justify-center text-red-400">{error}</div>
  if (!prompt) return <div className="min-h-screen bg-dark text-white flex items-center justify-center">Prompt not found</div>

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
          <div className="inline-block bg-purple/20 text-purple px-4 py-2 rounded-lg mb-4 text-sm">
            Prompt
          </div>
          <h1 className="text-5xl font-bold mb-4">{prompt.title}</h1>
          <p className="text-xl text-gray-400 mb-6">{prompt.description}</p>
          <div className="flex gap-4">
            <span className="bg-purple/20 text-purple px-3 py-1 rounded text-sm">
              {prompt.difficulty}
            </span>
            <span className="bg-cyan/20 text-cyan px-3 py-1 rounded text-sm">
              {prompt.tier_required}
            </span>
          </div>
        </div>

        {/* Use Case */}
        <div className="bg-darker border-l-4 border-purple p-6 mb-8 rounded">
          <h2 className="text-lg font-bold mb-2">📌 Use Case</h2>
          <p className="text-gray-200">{prompt.use_case}</p>
        </div>

        {/* The Prompt */}
        <div className="bg-darker border-2 border-cyan p-8 mb-8 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">💬 The Prompt</h2>
            <button
              onClick={() => copyToClipboard(prompt.prompt_text)}
              className="bg-cyan hover:bg-cyan-dark text-dark font-bold px-4 py-2 rounded transition"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-gray-200 font-mono whitespace-pre-wrap bg-black/50 p-4 rounded border border-cyan/20">
            {prompt.prompt_text}
          </p>
        </div>

        {/* Example Input */}
        {prompt.example_input && (
          <div className="bg-darker border border-purple/20 p-8 mb-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">📥 Example Input</h2>
            <p className="text-gray-300 font-mono whitespace-pre-wrap bg-black/50 p-4 rounded">
              {prompt.example_input}
            </p>
          </div>
        )}

        {/* Example Output */}
        {prompt.example_output && (
          <div className="bg-darker border border-purple/20 p-8 mb-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">📤 Example Output</h2>
            <p className="text-gray-300 font-mono whitespace-pre-wrap bg-black/50 p-4 rounded">
              {prompt.example_output}
            </p>
          </div>
        )}

        {/* Variations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🔄 Variations</h2>
          <div className="space-y-4">
            {prompt.variation_1 && (
              <div className="bg-darker border border-purple/20 p-6 rounded-lg">
                <h3 className="font-bold text-purple mb-2">Variation 1: {prompt.variation_1.split(':')[0]}</h3>
                <p className="text-gray-300">{prompt.variation_1}</p>
              </div>
            )}
            {prompt.variation_2 && (
              <div className="bg-darker border border-purple/20 p-6 rounded-lg">
                <h3 className="font-bold text-purple mb-2">Variation 2: {prompt.variation_2.split(':')[0]}</h3>
                <p className="text-gray-300">{prompt.variation_2}</p>
              </div>
            )}
            {prompt.variation_3 && (
              <div className="bg-darker border border-purple/20 p-6 rounded-lg">
                <h3 className="font-bold text-purple mb-2">Variation 3: {prompt.variation_3.split(':')[0]}</h3>
                <p className="text-gray-300">{prompt.variation_3}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tools */}
        {prompt.tools_compatible && prompt.tools_compatible.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">🛠️ Works With</h2>
            <div className="flex flex-wrap gap-2">
              {prompt.tools_compatible.map((tool: string) => (
                <span key={tool} className="bg-purple/20 text-purple px-4 py-2 rounded-lg">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-purple to-cyan p-1 rounded-lg">
          <div className="bg-dark p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Try this prompt today</h3>
            <p className="text-gray-400 mb-6">Copy above and paste into your AI tool of choice.</p>
            <Link
              href="/library"
              className="inline-block bg-purple hover:bg-purple-dark text-white font-bold px-8 py-3 rounded-lg transition"
            >
              Explore More Prompts
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
