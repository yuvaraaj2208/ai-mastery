'use client'

import { useState } from 'react'

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  return (
    <div className="min-h-screen bg-dark text-white">
      <div className="bg-darker border-b border-purple/20 sticky top-0 z-40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Your Learning Analytics 📊</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-purple/30 to-purple/10 border border-purple/50 rounded-xl p-6">
            <div className="text-4xl font-bold mb-2">156</div>
            <p className="text-gray-400 text-sm">minutes this month</p>
          </div>
          <div className="bg-gradient-to-br from-cyan/30 to-cyan/10 border border-cyan/50 rounded-xl p-6">
            <div className="text-4xl font-bold mb-2">42</div>
            <p className="text-gray-400 text-sm">articles read</p>
          </div>
          <div className="bg-gradient-to-br from-pink/30 to-pink/10 border border-pink/50 rounded-xl p-6">
            <div className="text-4xl font-bold mb-2">18</div>
            <p className="text-gray-400 text-sm">prompts saved</p>
          </div>
          <div className="bg-gradient-to-br from-orange/30 to-orange/10 border border-orange/50 rounded-xl p-6">
            <div className="text-4xl font-bold mb-2">12</div>
            <p className="text-gray-400 text-sm">day streak 🔥</p>
          </div>
        </div>
      </div>
    </div>
  )
}
