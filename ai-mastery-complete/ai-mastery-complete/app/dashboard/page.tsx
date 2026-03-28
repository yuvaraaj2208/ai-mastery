'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'tips' | 'prompts' | 'templates'>('tips')

  const tips = [
    { id: 1, title: 'How to Make $1000/Month with ChatGPT', category: 'Income', readTime: 5 },
    { id: 2, title: 'Advanced Prompt Engineering', category: 'Prompts', readTime: 8 },
    { id: 3, title: 'AI Tools Comparison', category: 'Tools', readTime: 6 },
  ]

  return (
    <div className="min-h-screen bg-dark text-white">
      <div className="bg-darker border-b border-purple/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome back! 👋</h1>
            <p className="text-gray-400">Your Pro membership is active</p>
          </div>
          <Link href="/login" className="bg-purple hover:bg-purple-dark px-4 py-2 rounded-lg transition">
            Logout
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-darker border border-purple/20 rounded-lg p-6">
            <div className="text-gray-400 text-sm">Total Tips Read</div>
            <div className="text-3xl font-bold mt-2">42</div>
          </div>
          <div className="bg-darker border border-purple/20 rounded-lg p-6">
            <div className="text-gray-400 text-sm">Prompts Saved</div>
            <div className="text-3xl font-bold mt-2">18</div>
          </div>
          <div className="bg-darker border border-purple/20 rounded-lg p-6">
            <div className="text-gray-400 text-sm">Templates Used</div>
            <div className="text-3xl font-bold mt-2">7</div>
          </div>
          <div className="bg-darker border border-purple/20 rounded-lg p-6">
            <div className="text-gray-400 text-sm">Learning Streak</div>
            <div className="text-3xl font-bold mt-2">12 days 🔥</div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex gap-4 border-b border-purple/20 mb-8">
            {['tips', 'prompts', 'templates'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 font-semibold transition border-b-2 ${
                  activeTab === tab
                    ? 'text-cyan border-cyan'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'tips' && (
            <div className="grid grid-cols-1 gap-4">
              {tips.map((tip) => (
                <div key={tip.id} className="bg-darker border border-purple/20 rounded-lg p-6 hover:border-cyan/50 transition">
                  <h3 className="text-xl font-semibold mb-2">{tip.title}</h3>
                  <div className="flex justify-between items-center">
                    <span className="bg-purple/20 text-cyan text-xs px-3 py-1 rounded-full">{tip.category}</span>
                    <span className="text-gray-500 text-sm">{tip.readTime} min read</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
