'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
const [activeTab, setActiveTab] = useState<'library' | 'courses' | 'community'>('library')

const contentCategories = [
{ name: 'Tips', icon: '📄', count: '100+' },
{ name: 'Prompts', icon: '📋', count: '500+' },
{ name: 'Templates', icon: '🎨', count: '200+' },
{ name: 'Videos', icon: '🎥', count: '50+' },
]

return (
<div className="min-h-screen bg-gradient-to-b from-dark via-darker to-dark text-white">
{/* Navigation */}
<nav className="sticky top-0 z-50 backdrop-blur-md bg-dark/80 border-b border-purple/20">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
<div className="text-2xl font-bold">
<span className="text-cyan">AI</span> Mastery
</div>
<div className="flex gap-4">
<Link href="/profile" className="hover:text-cyan transition">
Profile
</Link>
<button className="text-red-400 hover:text-red-300">Logout</button>
</div>
</div>
</nav>

{/* Welcome Section */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
<h1 className="text-4xl font-bold mb-2">Welcome back! 👋</h1>
<p className="text-gray-400">You have full access to all content below</p>
</section>

{/* Content Categories */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
{contentCategories.map((cat) => (
<Link
key={cat.name}
href={`/library?type=${cat.name.toLowerCase()}`}
className="bg-darker border border-purple/20 hover:border-cyan/50 rounded-lg p-6 text-center transition"
>
<div className="text-4xl mb-3">{cat.icon}</div>
<h3 className="font-bold mb-1">{cat.name}</h3>
<p className="text-cyan text-sm">{cat.count}</p>
</Link>
))}
</div>
</section>

{/* Tabs */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="flex gap-4 border-b border-purple/20 mb-8">
<button
onClick={() => setActiveTab('library')}
className={`pb-4 font-semibold ${activeTab === 'library' ? 'border-b-2 border-cyan text-cyan' : 'text-gray-400'}`}
>
📚 Content Library
</button>
<button
onClick={() => setActiveTab('courses')}
className={`pb-4 font-semibold ${activeTab === 'courses' ? 'border-b-2 border-cyan text-cyan' : 'text-gray-400'}`}
>
🎓 Courses
</button>
<button
onClick={() => setActiveTab('community')}
className={`pb-4 font-semibold ${activeTab === 'community' ? 'border-b-2 border-cyan text-cyan' : 'text-gray-400'}`}
>
💬 Community
</button>
</div>

{activeTab === 'library' && (
<div>
<h2 className="text-2xl font-bold mb-6">📚 Content Library</h2>
<p className="text-gray-400 mb-6">Coming soon: 100+ tips, 500+ prompts, 200+ templates</p>
<div className="bg-darker border border-purple/20 rounded-lg p-8 text-center">
<p className="text-gray-400">Content is being loaded from our database...</p>
</div>
</div>
)}

{activeTab === 'courses' && (
<div>
<h2 className="text-2xl font-bold mb-6">🎓 Courses</h2>
<p className="text-gray-400 mb-6">Deep-dive courses to master AI</p>
<div className="bg-darker border border-purple/20 rounded-lg p-8 text-center">
<p className="text-gray-400">Courses are being prepared...</p>
</div>
</div>
)}

{activeTab === 'community' && (
<div>
<h2 className="text-2xl font-bold mb-6">💬 Community</h2>
<div className="bg-darker border border-purple/20 rounded-lg p-8 text-center">
<p className="text-gray-400 mb-4">Join our Discord community to connect with other members!</p>
<a
href="https://discord.gg/your-invite-link"
className="inline-block bg-cyan hover:bg-cyan-dark text-dark px-6 py-2 rounded-lg font-semibold transition"
>
Join Discord
</a>
</div>
</div>
)}
</section>
</div>
)
}
