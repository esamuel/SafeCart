'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('profile')
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
    const loadUserData = async () => {
      try {
        const firebaseUser = auth.currentUser
        if (!firebaseUser) return

        // Fetch the latest user data from backend
        const dbUser = await usersAPI.getProfile(firebaseUser.uid)
        console.log('[PROFILE] Loaded user data:', dbUser)

        // Load personal information
        if (dbUser?.name) {
          setDisplayName(dbUser.name)
        } else if (dbUser?.displayName) {
          setDisplayName(dbUser.displayName)
        } else if (user?.name) {
          setDisplayName(user.name)
        } else if (user?.displayName) {
          setDisplayName(user.displayName)
        }
        
        if (dbUser?.age !== undefined && dbUser?.age !== null) {
          setAge(dbUser.age)
        } else if (user?.age !== undefined && user?.age !== null) {
          setAge(user.age)
        }
        
        if (dbUser?.height !== undefined && dbUser?.height !== null) {
          setHeight(dbUser.height)
        } else if (user?.height !== undefined && user?.height !== null) {
          setHeight(user.height)
        }
        
        if (dbUser?.weight !== undefined && dbUser?.weight !== null) {
          setWeight(dbUser.weight)
        } else if (user?.weight !== undefined && user?.weight !== null) {
          setWeight(user.weight)
        }

        // Load health profile
        if (dbUser?.healthProfiles && dbUser.healthProfiles.length > 0) {
          const profile = dbUser.healthProfiles[0]
          if (profile.diabetesType) setDiabetesType(profile.diabetesType)
          if (profile.targetGlucoseMin !== undefined) setTargetGlucoseMin(profile.targetGlucoseMin)
          if (profile.targetGlucoseMax !== undefined) setTargetGlucoseMax(profile.targetGlucoseMax)
          if (profile.dailyCarbLimit !== undefined) setDailyCarbLimit(profile.dailyCarbLimit)
          if (profile.allergies && Array.isArray(profile.allergies)) setAllergies(profile.allergies)
          if (profile.usesInsulin !== undefined) setUsesInsulin(profile.usesInsulin)
        } else if (user?.healthProfiles && user.healthProfiles.length > 0) {
          const profile = user.healthProfiles[0]
          if (profile.diabetesType) setDiabetesType(profile.diabetesType)
          if (profile.targetGlucoseMin !== undefined) setTargetGlucoseMin(profile.targetGlucoseMin)
          if (profile.targetGlucoseMax !== undefined) setTargetGlucoseMax(profile.targetGlucoseMax)
          if (profile.dailyCarbLimit !== undefined) setDailyCarbLimit(profile.dailyCarbLimit)
          if (profile.allergies && Array.isArray(profile.allergies)) setAllergies(profile.allergies)
          if (profile.usesInsulin !== undefined) setUsesInsulin(profile.usesInsulin)
        }
      } catch (err) {
        console.error('[PROFILE] Error loading user data:', err)
      }
    }

    loadUserData()
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
    const firebaseUser = auth.currentUser
    if (!firebaseUser) {
      console.error('[PROFILE] No Firebase user!')
      setError(t('errors.noUser'))
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const data = {
        displayName,
        age: typeof age === 'number' ? age : undefined,
        height: typeof height === 'number' ? height : undefined,
        weight: typeof weight === 'number' ? weight : undefined,
        diabetesType,
        targetGlucoseMin,
        targetGlucoseMax,
        dailyCarbLimit,
        allergies,
        usesInsulin,
      }
      console.log('[PROFILE] Sending data:', data)

      const response = await usersAPI.saveHealthProfile(firebaseUser.uid, data)
      console.log('[PROFILE] Save successful! Response:', response)

      setSuccess(t('profile.saved'))
      setIsEditing(false)

      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('[PROFILE] Save failed with error:', err)
      console.error('[PROFILE] Error details:', err.message, err.stack)
      setError(t('profile.error'))
    } finally {
      setSaving(false)
      console.log('[PROFILE] Save process completed')
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
        <h2 className="text-3xl font-bold">{displayName || user?.name || user?.displayName || t('profileTitle', { defaultValue: 'User' })}</h2>
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
            {t('personalInfo.title')}
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm"
            >
              <Edit className="w-4 h-4" />
              {t('profile.edit')}
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('personalInfo.displayName')}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                placeholder={t('personalInfo.displayNamePlaceholder')}
              />
            </div>

            {/* Age, Height, Weight */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('personalInfo.age')}
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  placeholder={t('personalInfo.agePlaceholder')}
                  min="1"
                  max="120"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('personalInfo.height')}
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  placeholder={t('personalInfo.heightPlaceholder')}
                  min="50"
                  max="250"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('personalInfo.weight')}
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  placeholder={t('personalInfo.weightPlaceholder')}
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
                <p className="text-sm text-gray-600 mb-1">{t('personalInfo.name')}</p>
                <p className="font-semibold text-gray-900">{displayName}</p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              {age && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">{t('personalInfo.age')}</p>
                  <p className="font-semibold text-gray-900">{age} {t('personalInfo.ageUnit')}</p>
                </div>
              )}
              {height && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">{t('personalInfo.height').replace(' (cm)', '')}</p>
                  <p className="font-semibold text-gray-900">{height} {t('personalInfo.heightUnit')}</p>
                </div>
              )}
              {weight && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">{t('personalInfo.weight').replace(' (kg)', '')}</p>
                  <p className="font-semibold text-gray-900">{weight} {t('personalInfo.weightUnit')}</p>
                </div>
              )}
            </div>
            {!displayName && !age && !height && !weight && (
              <p className="text-gray-600 text-sm italic">{t('personalInfo.noInfo')}</p>
            )}
          </div>
        )}
      </div>

      {/* Health Profile Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600" />
            {t('healthProfile.title')}
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm"
            >
              <Edit className="w-4 h-4" />
              {t('profile.edit')}
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            {/* Diabetes Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('healthProfile.diabetesType')}
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
                    {t(`healthProfile.types.${type}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Glucose Targets */}
            {diabetesType !== 'No Diabetes' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('healthProfile.targetGlucose')}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={targetGlucoseMin}
                      onChange={(e) => setTargetGlucoseMin(Number(e.target.value))}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                      placeholder={t('healthProfile.min')}
                    />
                    <span className="text-gray-600">{t('healthProfile.to')}</span>
                    <input
                      type="number"
                      value={targetGlucoseMax}
                      onChange={(e) => setTargetGlucoseMax(Number(e.target.value))}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                      placeholder={t('healthProfile.max')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('healthProfile.dailyCarbLimit')}
                  </label>
                  <input
                    type="number"
                    value={dailyCarbLimit}
                    onChange={(e) => setDailyCarbLimit(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                    placeholder={t('healthProfile.dailyCarbPlaceholder')}
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
                    {t('healthProfile.usesInsulin')}
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
                {saving ? t('buttons.saving') : t('buttons.save')}
              </button>
              <button
                onClick={cancelEdit}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
              >
                <X className="w-4 h-4" />
                {t('buttons.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">{t('healthProfile.diabetesType')}</p>
              <p className="font-semibold text-gray-900">{t(`healthProfile.types.${diabetesType}`)}</p>
            </div>
            {diabetesType !== 'No Diabetes' && (
              <>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">{t('healthProfile.targetGlucoseDisplay')}</p>
                  <p className="font-semibold text-gray-900">{targetGlucoseMin}-{targetGlucoseMax} mg/dL</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">{t('healthProfile.dailyCarbDisplay')}</p>
                  <p className="font-semibold text-gray-900">{dailyCarbLimit}g</p>
                </div>
                {usesInsulin && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">{t('healthProfile.insulinUse')}</p>
                    <p className="font-semibold text-gray-900">{t('healthProfile.yes')}</p>
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
          {t('allergies.title')}
        </h3>

        {isEditing ? (
          <div>
            <p className="text-sm text-gray-600 mb-3">{t('allergies.selectAll')}</p>
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
              <p className="text-gray-600 text-sm italic">{t('allergies.noneSpecified')}</p>
            )}
          </div>
        )}
      </div>

      {/* Settings Items */}
      {!isEditing && (
        <>
          <div className="space-y-2 mb-6">
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 p-4 rounded-xl transition flex items-center justify-between font-semibold">
              <span>{t('settings.notifications')}</span>
              <span className="text-gray-400">›</span>
            </button>
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 p-4 rounded-xl transition flex items-center justify-between font-semibold">
              <span>{t('settings.privacy')}</span>
              <span className="text-gray-400">›</span>
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl transition font-semibold flex items-center justify-center gap-2 text-lg shadow-lg"
          >
            <LogOut className="w-5 h-5" />
            {t('settings.logout')}
          </button>
        </>
      )}
    </div>
  )
}
