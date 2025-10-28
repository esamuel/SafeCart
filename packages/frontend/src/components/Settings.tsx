'use client'

import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Eye, EyeOff, Save, Bell, Lock, Palette } from 'lucide-react'

interface SettingsProps {
  user: any
  onNavigateToProfile?: () => void
}

interface TabVisibility {
  home: boolean
  scanner: boolean
  shopping: boolean
  meals: boolean
  inventory: boolean
  discover: boolean
  analytics: boolean
  community: boolean
  profile: boolean
}

const DEFAULT_TABS: TabVisibility = {
  home: true,
  scanner: true,
  shopping: true,
  meals: true,
  inventory: true,
  discover: true,
  analytics: true,
  community: true,
  profile: true,
}

const TAB_INFO = [
  { id: 'home', label: 'Home', emoji: '🏠', description: 'Dashboard with quick stats' },
  { id: 'scanner', label: 'Scanner', emoji: '📷', description: 'Scan product barcodes' },
  { id: 'shopping', label: 'Shopping Lists', emoji: '📝', description: 'Manage your shopping lists' },
  { id: 'meals', label: 'Meal Planner', emoji: '📅', description: 'Plan diabetes-friendly meals' },
  { id: 'inventory', label: 'Inventory', emoji: '📦', description: 'Track pantry items' },
  { id: 'discover', label: 'Product Discovery', emoji: '🔍', description: 'Browse safe products' },
  { id: 'analytics', label: 'Analytics', emoji: '📊', description: 'Detailed health insights & AI recommendations' },
  { id: 'community', label: 'Community', emoji: '👥', description: 'Share tips and recipes' },
  { id: 'profile', label: 'Profile', emoji: '👤', description: 'Your health profile & settings' },
]

export default function Settings({ user, onNavigateToProfile }: SettingsProps) {
  const [tabVisibility, setTabVisibility] = useState<TabVisibility>(DEFAULT_TABS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load user preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem('tabVisibility')
    if (savedPrefs) {
      try {
        setTabVisibility(JSON.parse(savedPrefs))
      } catch (e) {
        console.error('Failed to load tab preferences:', e)
      }
    }
  }, [])

  const toggleTab = (tabId: keyof TabVisibility) => {
    // Prevent hiding home and profile tabs (required)
    if (tabId === 'home' || tabId === 'profile') {
      alert(`${tabId === 'home' ? 'Home' : 'Profile'} tab is required and cannot be hidden`)
      return
    }

    setTabVisibility(prev => ({
      ...prev,
      [tabId]: !prev[tabId]
    }))
  }

  const handleSave = () => {
    setSaving(true)

    // Save to localStorage
    localStorage.setItem('tabVisibility', JSON.stringify(tabVisibility))

    // Trigger event to notify Dashboard to reload preferences
    window.dispatchEvent(new CustomEvent('tabVisibilityChanged'))

    // Simulate API call (if you want to save to backend later)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)

      setTimeout(() => setSaved(false), 3000)
    }, 500)
  }

  const handleResetToDefault = () => {
    if (confirm('Reset all tabs to default visibility?')) {
      setTabVisibility(DEFAULT_TABS)
      localStorage.removeItem('tabVisibility')
    }
  }

  const visibleCount = Object.values(tabVisibility).filter(Boolean).length

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <SettingsIcon className="w-7 h-7" />
          Settings
        </h2>
        <p className="text-gray-600">Customize your SafeCart experience</p>
      </div>

      {/* Tab Visibility Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Navigation Tabs</h3>
            <p className="text-sm text-gray-600">
              Choose which tabs to show in the bottom navigation
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-600">{visibleCount}/{TAB_INFO.length}</p>
            <p className="text-xs text-gray-500">visible</p>
          </div>
        </div>

        {/* Tab List */}
        <div className="space-y-3">
          {TAB_INFO.map(tab => {
            const isVisible = tabVisibility[tab.id as keyof TabVisibility]
            const isRequired = tab.id === 'home' || tab.id === 'profile'

            return (
              <div
                key={tab.id}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition ${
                  isVisible
                    ? 'bg-purple-50 border-purple-200'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-3xl">{tab.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{tab.label}</p>
                      {isRequired && (
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-semibold">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{tab.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleTab(tab.id as keyof TabVisibility)}
                  disabled={isRequired}
                  className={`p-3 rounded-lg transition ${
                    isVisible
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                  } ${isRequired ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  {isVisible ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Hide tabs you don't use to simplify your navigation.
            You can always show them again later. The Analytics tab will always be accessible
            from the "View Analytics" button on the Home page, even if hidden.
          </p>
        </div>

        {/* Save Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
          <button
            onClick={handleResetToDefault}
            className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-xl font-semibold transition"
          >
            Reset to Default
          </button>
        </div>
      </div>

      {/* Other Settings Sections */}
      <div className="space-y-4">
        {/* Profile (Link to Profile page) */}
        {onNavigateToProfile && (
          <button
            onClick={onNavigateToProfile}
            className="w-full bg-white hover:bg-gray-50 p-6 rounded-2xl shadow-lg transition flex items-center justify-between"
          >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <SettingsIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">Your Profile</p>
              <p className="text-sm text-gray-600">Manage health profile and personal info</p>
            </div>
          </div>
          <span className="text-gray-400">›</span>
        </button>
        )}

        {/* Notifications */}
        <button className="w-full bg-white hover:bg-gray-50 p-6 rounded-2xl shadow-lg transition flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">Notifications</p>
              <p className="text-sm text-gray-600">Manage alerts and reminders</p>
            </div>
          </div>
          <span className="text-gray-400">›</span>
        </button>

        {/* Privacy */}
        <button className="w-full bg-white hover:bg-gray-50 p-6 rounded-2xl shadow-lg transition flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">Privacy & Security</p>
              <p className="text-sm text-gray-600">Control your data and permissions</p>
            </div>
          </div>
          <span className="text-gray-400">›</span>
        </button>

        {/* Appearance */}
        <button className="w-full bg-white hover:bg-gray-50 p-6 rounded-2xl shadow-lg transition flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Palette className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">Appearance</p>
              <p className="text-sm text-gray-600">Theme, colors, and display options</p>
            </div>
          </div>
          <span className="text-gray-400">›</span>
        </button>
      </div>
    </div>
  )
}
