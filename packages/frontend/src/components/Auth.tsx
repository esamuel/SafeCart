'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import Logo from './Logo'

export default function Auth() {
  const { t } = useTranslation('auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!resetEmail) {
        setError(t('resetPassword.errorEmpty'))
        setLoading(false)
        return
      }
      await sendPasswordResetEmail(auth, resetEmail)
      setSuccess(t('resetPassword.successMessage'))
      setResetEmail('')
      setTimeout(() => {
        setShowForgotPassword(false)
        setSuccess('')
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="large" variant="colored" />
          </div>
          <p className="text-gray-600 mt-2">{t('tagline')}</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <div className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5">✓</div>
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {!showForgotPassword ? (
          <>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
                  placeholder={t('emailPlaceholder')}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition pr-12"
                    placeholder={t('passwordPlaceholder')}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-purple-600 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-3 rounded-xl transition transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? t('loading') : isSignUp ? t('signUp') : t('signIn')}
              </button>
            </form>

            <div className="mt-6 space-y-3">
              {!isSignUp && (
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="w-full text-purple-600 hover:text-purple-700 font-semibold text-sm py-2 transition"
                >
                  {t('forgotPassword')}
                </button>
              )}
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="ml-1 text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    {isSignUp ? t('signIn') : t('signUp')}
                  </button>
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <p className="text-gray-600 text-sm mb-4">
                {t('resetPassword.description')}
              </p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('resetPassword.emailLabel')}
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
                  placeholder={t('emailPlaceholder')}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-3 rounded-xl transition transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? t('resetPassword.sending') : t('resetPassword.sendButton')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setShowForgotPassword(false)
                  setResetEmail('')
                  setError('')
                }}
                className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
              >
                {t('resetPassword.backToSignIn')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
