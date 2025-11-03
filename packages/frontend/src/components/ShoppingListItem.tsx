'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { productsAPI, usersAPI } from '@/lib/api'
import { auth } from '@/lib/firebase'

interface ShoppingListItemProps {
  item: any
  index: number
  onToggle: (index: number) => void
  onDelete: (index: number) => void
  onUpdateQuantity: (index: number, quantity: number) => void
}

export default function ShoppingListItem({
  item,
  index,
  onToggle,
  onDelete,
  onUpdateQuantity,
}: ShoppingListItemProps) {
  const { t } = useTranslation('shopping')
  const [safety, setSafety] = useState<'safe' | 'danger' | 'unknown' | 'checking'>('checking')
  const [allergens, setAllergens] = useState<string[]>([])
  
  const user = auth.currentUser

  useEffect(() => {
    checkSafety()
  }, [item.name])

  const checkSafety = async () => {
    try {
      if (!user) {
        setSafety('unknown')
        return
      }

      // Search for product
      const products = await productsAPI.search(item.name, {})
      if (products.length === 0) {
        setSafety('unknown')
        return
      }

      const product = products[0]
      const productAllergens = product.allergens?.contains || []

      // Get user allergies
      const profile = await usersAPI.getProfile(user.uid)
      const userAllergies = profile.healthProfiles?.[0]?.allergies || []

      // Check for matches
      const dangerousAllergens = productAllergens.filter((a: string) =>
        userAllergies.some((ua: string) => ua.toLowerCase() === a.toLowerCase())
      )

      if (dangerousAllergens.length > 0) {
        setSafety('danger')
        setAllergens(dangerousAllergens)
      } else if (productAllergens.length > 0) {
        setSafety('safe')
        setAllergens(productAllergens)
      } else {
        setSafety('safe')
        setAllergens([])
      }
    } catch (err) {
      setSafety('unknown')
    }
  }

  const getSafetyIcon = () => {
    if (safety === 'checking') {
      return <div className="w-5 h-5 border-2 border-gray-300 rounded-full animate-pulse" />
    }
    if (safety === 'safe') {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      )
    }
    if (safety === 'danger') {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <AlertCircle className="w-5 h-5" />
        </div>
      )
    }
    return null
  }

  const getSafetyLabel = () => {
    if (safety === 'safe') return t('safety.safeForYou', { defaultValue: 'Safe for you' })
    if (safety === 'danger') return `⚠️ ${t('allergenWarning.contains')}: ${allergens.join(', ')}`
    if (safety === 'unknown') return t('safety.unknown', { defaultValue: 'Product not found in database' })
    return t('safety.checking', { defaultValue: 'Checking...' })
  }

  return (
    <div
      className={`p-4 flex items-center gap-4 transition ${
        item.checked ? 'bg-gray-50' : ''
      } ${
        safety === 'danger' ? 'border-l-4 border-red-500' : ''
      }`}
    >
      <button
        onClick={() => onToggle(index)}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
          item.checked
            ? 'bg-green-600 border-green-600'
            : 'border-gray-300 hover:border-purple-600'
        }`}
      >
        {item.checked && <Check className="w-4 h-4 text-white" />}
      </button>

      {/* Safety Badge */}
      <div className="flex-shrink-0">
        {getSafetyIcon()}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`font-medium ${
              item.checked ? 'line-through text-gray-400' : 'text-gray-900'
            }`}
          >
            {item.name}
          </p>
          {safety === 'danger' && (
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">
              ⚠️ {t('allergenWarning.title')}
            </span>
          )}
        </div>
        {safety !== 'checking' && (
          <p className={`text-xs ${
            safety === 'danger' ? 'text-red-600' : 
            safety === 'safe' ? 'text-green-600' : 
            'text-gray-500'
          }`}>
            {getSafetyLabel()}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          −
        </button>
        <span className="w-8 text-center font-semibold">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          +
        </button>
      </div>

      <button
        onClick={() => onDelete(index)}
        className="text-red-600 hover:text-red-700 transition"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  )
}


