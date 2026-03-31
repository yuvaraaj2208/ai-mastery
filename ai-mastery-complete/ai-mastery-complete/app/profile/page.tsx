'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const email = localStorage.getItem('userEmail')
    const name = localStorage.getItem('userName')
    
    if (!email) {
      router.push('/login')
      return
    }

    setUser({
      email,
      name,
    })
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    router.push('/login')
  }

  if (loading) {
    return <div className="min-h-screen bg-dark text-white flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-darker to-dark text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-dark/80 border-b border-purple/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-cyan">AI</span> Mastery
          </Link>
          <Link href="/dashboard" className="hover:text-cyan transition">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Profile Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Your Profile</h1>
          <p className="text-gray-400">Manage your account settings</p>
        </div>

        {/* Profile Card */}
        <div className="bg-darker border border-purple/20 rounded-lg p-8 mb-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Account Information</h2>
            <div className="space-y-6">
              <div>
                <label className="text-gray-400 text-sm">Name</label>
                <p className="text-xl font-semibold mt-2">{user?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Email</label>
                <p className="text-xl font-semibold mt-2">{user?.email}</p>
              </div>
            </div>
          </div>

          <hr className="border-purple/20 my-8" />

          {/* Logout Button */}
          <div className="mt-8">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg transition"
            >
              Logout
            </button>
            <p className="text-gray-400 text-sm mt-3">You will be logged out and redirected to the login page.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
