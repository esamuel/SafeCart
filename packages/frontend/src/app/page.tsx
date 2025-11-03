'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { authAPI, usersAPI } from '@/lib/api'
import Dashboard from '@/components/Dashboard'
import Auth from '@/components/Auth'
import Onboarding from '@/components/Onboarding'
import Logo from '@/components/Logo'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [dbUser, setDbUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          // Just set the user, don't fetch profile yet
          setUser(currentUser)
          setError('')
          // Profile will be checked by Dashboard when it loads
        } else {
          setUser(null)
          setDbUser(null)
          setShowOnboarding(false)
        }
      } catch (err: any) {
        console.error('Auth error:', err)
        setError(err.message)
        setUser(null)
        setDbUser(null)
        setShowOnboarding(false)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-purple-900">
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <Logo size="xlarge" variant="white" />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-purple-900">
        <div className="text-center text-white">
          <p className="text-lg mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  // Dashboard will handle profile checks and onboarding
  return <Dashboard user={user} />
}
