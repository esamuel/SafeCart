'use client'

import { useState, useEffect } from 'react'
import { User, Heart, AlertTriangle, Settings, LogOut, Edit, Save, X } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { usersAPI } from '@/lib/api'

const DIABETES_TYPES = ['Type 1', 'Type 2', 'Prediabetes', 'Gestational', 'No Diabetes']

const COMMON_ALLERGENS = [
  { emoji: '🥜', label: 'Peanuts' },
  { emoji: '🌰', label: 'Tree Nuts' },
  { emoji: '🥛', label: 'Dairy' },
  { emoji: '🥚', label: 'Eggs' },
  { emoji: '🐟', label: 'Fish' },
  { emoji: '🦐', label: 'Shellfish' },
  { emoji: '🌾', label: 'Wheat/Gluten' },
  { emoji: '🫘', label: 'Soy' },
  { emoji: '🌽', label: 'Corn' },
  { emoji: '🍅', label: 'Nightshades' },
]

export default function Profile({ user }: any) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Personal information state
  const [displayName, setDisplayName] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [height, setHeight] = useState<number | ''>('') // in cm
  const [weight, setWeight] = useState<number | ''>('') // in kg

  // Health profile state
  const [diabetesType, setDiabetesType] = useState('Type 1')
  const [targetGlucoseMin, setTargetGlucoseMin] = useState(80)
  const [targetGlucoseMax, setTargetGlucoseMax] = useState(130)
  const [dailyCarbLimit, setDailyCarbLimit] = useState(200)
  const [allergies, setAllergies] = useState<string[]>(['Peanuts', 'Dairy'])
  const [usesInsulin, setUsesInsulin] = useState(true)

  // Load user health profile on mount
  useEffect(() => {
    // Load personal information
    if (user?.name) setDisplayName(user.name)
    if (user?.displayName) setDisplayName(user.displayName)
    if (user?.age) setAge(user.age)
    if (user?.height) setHeight(user.height)
    if (user?.weight) setWeight(user.weight)

    // Load health profile
    if (user?.healthProfiles && user.healthProfiles.length > 0) {
      const profile = user.healthProfiles[0]
      if (profile.diabetesType) setDiabetesType(profile.diabetesType)
      if (profile.targetGlucoseMin) setTargetGlucoseMin(profile.targetGlucoseMin)
      if (profile.targetGlucoseMax) setTargetGlucoseMax(profile.targetGlucoseMax)
      if (profile.dailyCarbLimit) setDailyCarbLimit(profile.dailyCarbLimit)
      if (profile.allergies) setAllergies(profile.allergies)
      if (profile.usesInsulin !== undefined) setUsesInsulin(profile.usesInsulin)
    }
  }, [user])

  const handleLogout = async () => {
    await signOut(auth)
  }

  const toggleAllergy = (allergen: string) => {
    setAllergies(prev =>
      prev.includes(allergen)
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    )
  }

  const handleSaveProfile = async () => {
    // Support both database user (id) and Firebase user (uid)
    const userId = user?.id || user?.uid
    if (!userId) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await usersAPI.saveHealthProfile(userId, {
        displayName,
        age: age || undefined,
        height: height || undefined,
        weight: weight || undefined,
        diabetesType,
        targetGlucoseMin,
        targetGlucoseMax,
        dailyCarbLimit,
        allergies,
        usesInsulin,
      })

      setSuccess('Profile saved successfully!')
      setIsEditing(false)

      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Failed to save profile:', err)
      setError('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setError('')
    // Reload from user data if needed
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-8 rounded-3xl mb-6 text-center shadow-lg">
        <h2 className="text-3xl font-bold">{displayName || user?.name || user?.displayName || 'User'}</h2>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-4 flex items-center gap-2">
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Personal Information Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Personal Information
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                placeholder="Your preferred name"
              />
            </div>

            {/* Age, Height, Weight */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  placeholder="25"
                  min="1"
                  max="120"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  placeholder="170"
                  min="50"
                  max="250"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  placeholder="70"
                  min="20"
                  max="300"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {displayName && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Name</p>
                <p className="font-semibold text-gray-900">{displayName}</p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              {age && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Age</p>
                  <p className="font-semibold text-gray-900">{age} years</p>
                </div>
              )}
              {height && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Height</p>
                  <p className="font-semibold text-gray-900">{height} cm</p>
                </div>
              )}
              {weight && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Weight</p>
                  <p className="font-semibold text-gray-900">{weight} kg</p>
                </div>
              )}
            </div>
            {!displayName && !age && !height && !weight && (
              <p className="text-gray-600 text-sm italic">No personal information added yet</p>
            )}
          </div>
        )}
      </div>

      {/* Health Profile Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600" />
            Health Profile
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            {/* Diabetes Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Diabetes Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DIABETES_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setDiabetesType(type)}
                    className={`p-3 rounded-xl font-semibold transition ${
                      diabetesType === type
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Glucose Targets */}
            {diabetesType !== 'No Diabetes' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Blood Glucose Range (mg/dL)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={targetGlucoseMin}
                      onChange={(e) => setTargetGlucoseMin(Number(e.target.value))}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                      placeholder="Min"
                    />
                    <span className="text-gray-600">to</span>
                    <input
                      type="number"
                      value={targetGlucoseMax}
                      onChange={(e) => setTargetGlucoseMax(Number(e.target.value))}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Daily Carb Limit (grams)
                  </label>
                  <input
                    type="number"
                    value={dailyCarbLimit}
                    onChange={(e) => setDailyCarbLimit(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                    placeholder="200"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="usesInsulin"
                    checked={usesInsulin}
                    onChange={(e) => setUsesInsulin(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-600"
                  />
                  <label htmlFor="usesInsulin" className="text-sm font-semibold text-gray-700">
                    I use insulin
                  </label>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Diabetes Type</p>
              <p className="font-semibold text-gray-900">{diabetesType}</p>
            </div>
            {diabetesType !== 'No Diabetes' && (
              <>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Target Blood Glucose</p>
                  <p className="font-semibold text-gray-900">{targetGlucoseMin}-{targetGlucoseMax} mg/dL</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Daily Carb Limit</p>
                  <p className="font-semibold text-gray-900">{dailyCarbLimit}g</p>
                </div>
                {usesInsulin && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Insulin Use</p>
                    <p className="font-semibold text-gray-900">Yes</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Allergies Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-4">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Allergies & Intolerances
        </h3>

        {isEditing ? (
          <div>
            <p className="text-sm text-gray-600 mb-3">Select all that apply:</p>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_ALLERGENS.map(({ emoji, label }) => (
                <button
                  key={label}
                  onClick={() => toggleAllergy(label)}
                  className={`p-3 rounded-xl font-semibold transition text-left ${
                    allergies.includes(label)
                      ? 'bg-red-100 text-red-700 border-2 border-red-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allergies.map(allergen => {
                  const allergenData = COMMON_ALLERGENS.find(a => a.label === allergen)
                  return (
                    <span
                      key={allergen}
                      className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-medium text-sm"
                    >
                      {allergenData?.emoji} {allergen}
                    </span>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-sm italic">No allergies specified</p>
            )}
          </div>
        )}
      </div>

      {/* Settings Items */}
      {!isEditing && (
        <>
          <div className="space-y-2 mb-6">
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 p-4 rounded-xl transition flex items-center justify-between font-semibold">
              <span>Notification Settings</span>
              <span className="text-gray-400">›</span>
            </button>
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 p-4 rounded-xl transition flex items-center justify-between font-semibold">
              <span>Privacy & Security</span>
              <span className="text-gray-400">›</span>
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl transition font-semibold flex items-center justify-center gap-2 text-lg shadow-lg"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </>
      )}
    </div>
  )
}
