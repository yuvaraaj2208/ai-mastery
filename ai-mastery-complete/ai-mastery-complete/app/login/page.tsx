'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-darker to-dark flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-cyan">AI</span> Mastery
          </h1>
          <p className="text-gray-400">Welcome back to your AI learning journey</p>
        </div>

        <div className="bg-darker/80 backdrop-blur-xl border border-purple/30 rounded-2xl p-8 shadow-2xl">
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-dark border border-purple/30 rounded-lg focus:border-cyan focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-dark border border-purple/30 rounded-lg focus:border-cyan focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-cyan"
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-cyan to-purple hover:from-cyan-dark hover:to-purple-dark text-dark font-bold py-3 rounded-lg transition">
              Login to Your Account
            </button>
          </form>

          <p className="text-center mt-6 text-gray-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-cyan hover:underline font-semibold">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
