'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      // Save session
      localStorage.setItem('userToken', data.session.access_token)
      localStorage.setItem('userEmail', data.user.email)
      localStorage.setItem('userName', data.user.name)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-darker to-dark text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-dark/80 border-b border-purple/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="text-cyan">AI</span> Mastery
          </div>
          <Link href="/signup" className="hover:text-cyan transition">
            Don't have an account? Sign up
          </Link>
        </div>
      </nav>

      {/* Login Form */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="bg-darker border border-purple/20 rounded-lg p-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-400 mb-8">Login to access your content library</p>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-dark border border-purple/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-cyan focus:outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-dark border border-purple/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-cyan focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan hover:bg-cyan-dark text-dark font-semibold py-2 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <p className="text-center text-sm text-gray-400 mt-4">
                Don't have an account?{' '}
                <Link href="/signup" className="text-cyan hover:text-cyan-dark">
                  Sign up here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
