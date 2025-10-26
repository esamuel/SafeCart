'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import Logo from './Logo'

export default function Onboarding({ onComplete }: any) {
  const [step, setStep] = useState(0)
  const [diabetesType, setDiabetesType] = useState('')
  const [allergies, setAllergies] = useState<string[]>([])

  const diabetesOptions = ['Type 1', 'Type 2', 'Prediabetes', 'No']
  const allergyOptions = [
    { emoji: '🥜', label: 'Peanuts' },
    { emoji: '🥛', label: 'Dairy' },
    { emoji: '🥚', label: 'Eggs' },
    { emoji: '🐟', label: 'Fish' },
    { emoji: '🦐', label: 'Shellfish' },
    { emoji: '🌾', label: 'Wheat' },
  ]

  const toggleAllergy = (allergy: string) => {
    setAllergies(prev =>
      prev.includes(allergy)
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    )
  }

  const handleNext = () => {
    if (step === 0 && !diabetesType) {
      alert('Please select a diabetes type')
      return
    }
    if (step === 1) {
      onComplete({ diabetesType, allergies })
      return
    }
    setStep(step + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {step === 0 ? (
          <>
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo size="medium" variant="colored" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Health Profile</h2>
              <p className="text-gray-600">Help us understand your dietary needs</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Do you have diabetes?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {diabetesOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => setDiabetesType(option)}
                    className={`p-4 rounded-xl font-semibold transition ${
                      diabetesType === option
                        ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo size="medium" variant="colored" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Allergies</h2>
              <p className="text-gray-600">Choose all that apply</p>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-2 gap-3">
                {allergyOptions.map(({ emoji, label }) => (
                  <button
                    key={label}
                    onClick={() => toggleAllergy(label)}
                    className={`p-4 rounded-xl font-semibold transition text-center ${
                      allergies.includes(label)
                        ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-2xl mb-1">{emoji}</div>
                    <div className="text-sm">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-xl transition"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                Complete
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
