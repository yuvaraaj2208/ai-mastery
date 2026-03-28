'use client'

import { useState } from 'react'

export default function ContentLibrary() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-dark text-white">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: '💡', title: 'How to Make $1000/Month with ChatGPT', views: 2340 },
            { icon: '✨', title: 'Advanced Prompt Engineering', views: 1450 },
            { icon: '📋', title: 'Content Creation Templates', views: 890 },
          ].map((item, idx) => (
            <div key={idx} className="bg-darker border border-purple/20 rounded-lg p-6">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">👁️ {item.views.toLocaleString()}</span>
                <button className="bg-cyan hover:bg-cyan-dark text-dark px-4 py-1 rounded font-semibold text-sm transition">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
