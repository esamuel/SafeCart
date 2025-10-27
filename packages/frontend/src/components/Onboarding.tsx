'use client'

import { useState } from 'react'
import { usersAPI } from '@/lib/api'
import { auth } from '@/lib/firebase'
import { ChevronRight, AlertCircle } from 'lucide-react'

const ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Soy',
  'Wheat',
  'Fish',
  'Shellfish',
  'Sesame',
]

const DIABETES_TYPES = ['Type 1', 'Type 2', 'Prediabetes', 'Gestational']

export default function Onboarding({ onComplete }: any) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    displayName: '',
    age: '',
    height: '',
    weight: '',
    diabetesType: 'Type 1',
    allergies: [] as string[],
    targetGlucoseMin: 80,
    targetGlucoseMax: 130,
    dailyCarbLimit: 200,
    usesInsulin: true,
  })

  const user = auth.currentUser

  const handleAllergenToggle = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergen)
        ? prev.allergies.filter(a => a !== allergen)
        : [...prev.allergies, allergen],
    }))
  }

  const handleSubmit = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')

      await usersAPI.saveHealthProfile(user.uid, {
        displayName: formData.displayName,
        age: parseInt(formData.age),
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        diabetesType: formData.diabetesType,
        allergies: formData.allergies,
        targetGlucoseMin: formData.targetGlucoseMin,
        targetGlucoseMax: formData.targetGlucoseMax,
        dailyCarbLimit: formData.dailyCarbLimit,
        usesInsulin: formData.usesInsulin,
      })

      onComplete()
    } catch (err: any) {
      setError(err.message || 'Failed to save profile')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to SafeCart!</h1>
          <p className="text-purple-100">Step {step} of 3: Let's set up your health profile</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={e =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  placeholder="Your name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    placeholder="25"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={e => setFormData({ ...formData, height: e.target.value })}
                    placeholder="170"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="70"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.displayName || !formData.age || !formData.height || !formData.weight}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Diabetes Information */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Diabetes Information</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Diabetes Type
                </label>
                <select
                  value={formData.diabetesType}
                  onChange={e =>
                    setFormData({ ...formData, diabetesType: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                >
                  {DIABETES_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Glucose Min (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={formData.targetGlucoseMin}
                    onChange={e =>
                      setFormData({ ...formData, targetGlucoseMin: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Glucose Max (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={formData.targetGlucoseMax}
                    onChange={e =>
                      setFormData({ ...formData, targetGlucoseMax: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Daily Carb Limit (g)
                </label>
                <input
                  type="number"
                  value={formData.dailyCarbLimit}
                  onChange={e =>
                    setFormData({ ...formData, dailyCarbLimit: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="insulin"
                  checked={formData.usesInsulin}
                  onChange={e => setFormData({ ...formData, usesInsulin: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded"
                />
                <label htmlFor="insulin" className="text-gray-700 font-medium">
                  I use insulin
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-lg font-semibold transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                >
                  Next <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Allergies */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Food Allergies</h2>
              <p className="text-gray-600">Select all your allergies. You can update this later.</p>

              <div className="grid grid-cols-2 gap-3">
                {ALLERGENS.map(allergen => (
                  <button
                    key={allergen}
                    onClick={() => handleAllergenToggle(allergen)}
                    className={`p-4 rounded-lg font-medium transition border-2 ${
                      formData.allergies.includes(allergen)
                        ? 'border-purple-600 bg-purple-50 text-purple-900'
                        : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-purple-400'
                    }`}
                  >
                    {formData.allergies.includes(allergen) ? '✓ ' : ''}{allergen}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-lg font-semibold transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition"
                >
                  {loading ? 'Saving...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex gap-2 mt-8 justify-center">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-2 w-8 rounded-full transition ${
                  s <= step ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
