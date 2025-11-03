'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { productsAPI, usersAPI } from '@/lib/api'
import { auth } from '@/lib/firebase'
import { Search, Filter, Loader, AlertCircle, Heart, CheckCircle2 } from 'lucide-react'

const ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Soy',
  'Wheat',
  'Fish',
  'Shellfish',
]

const CATEGORIES = [
  'Dairy',
  'Produce',
  'Meat & Seafood',
  'Bakery',
  'Snacks',
  'Beverages',
  'Pantry',
  'Frozen',
]

export default function ProductDiscovery() {
  const { t } = useTranslation('discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [maxCarbs, setMaxCarbs] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])
  const [userAllergies, setUserAllergies] = useState<string[]>([])
  const [autoFilter, setAutoFilter] = useState(true)

  const user = auth.currentUser

  // Load user's allergies on mount
  useEffect(() => {
    loadUserAllergies()
  }, [])

  const loadUserAllergies = async () => {
    if (!user) return
    try {
      const profile = await usersAPI.getProfile(user.uid)
      if (profile.healthProfiles && profile.healthProfiles.length > 0) {
        const allergies = profile.healthProfiles[0].allergies || []
        setUserAllergies(allergies)
        // Auto-populate filter with user's allergies
        if (autoFilter && allergies.length > 0) {
          setSelectedAllergens(allergies)
        }
      }
    } catch (err) {
      console.log('Could not load user allergies')
    }
  }

  const handleSearch = async (browseAll = false) => {
    try {
      // Clear previous results and errors before starting new search
      setProducts([])
      setError('')
      setLoading(true)
      
      // Small delay to ensure UI update
      await new Promise(resolve => setTimeout(resolve, 50))

      const filters: any = {}
      
      // For "Browse All", add a limit to get initial products
      if (browseAll) {
        filters.limit = 50
      }
      
      if (selectedCategory) filters.category = selectedCategory
      if (selectedAllergens.length > 0) filters.allergen = selectedAllergens[0]
      if (maxCarbs) filters.maxCarbs = parseInt(maxCarbs)

      // If browsing all or filters exist, use empty query
      // Otherwise require a search term
      const query = browseAll ? '' : searchQuery.trim()
      
      if (!browseAll && !query && !selectedCategory && selectedAllergens.length === 0 && !maxCarbs) {
        setError('Please enter a search term or select filters to browse products')
        setLoading(false)
        return
      }

      console.log('Searching with:', { query, filters, browseAll }) // Debug log

      const results = await productsAPI.search(query, filters)

      console.log('Results received:', results?.length || 0) // Debug log

      // Ensure results is an array
      const productsArray = Array.isArray(results) ? results : []
      setProducts(productsArray)
      
      if (productsArray.length === 0 && browseAll) {
        setError('No products available in the database yet.')
      }
    } catch (err: any) {
      setError('Failed to search products. ' + (err.message || 'Please try again.'))
      console.error('Search error:', err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens(prev =>
      prev.includes(allergen)
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    )
  }

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedAllergens([])
    setMaxCarbs('')
    setProducts([])
    setError('')
  }

  const checkProductSafety = (product: any) => {
    const contains = product.allergens?.contains || []

    if (contains.length === 0) {
      return { safe: true, allergens: [], allAllergens: [] }
    }

    // Check if product contains user's allergens
    const dangerousAllergens = contains.filter((allergen: string) =>
      userAllergies.some(userAllergy =>
        allergen.toLowerCase() === userAllergy.toLowerCase()
      )
    )

    return {
      safe: dangerousAllergens.length === 0,
      allergens: dangerousAllergens,
      allAllergens: contains,
    }
  }

  const getSafetyBadge = (product: any) => {
    const safety = checkProductSafety(product)

    if (safety.safe && (safety.allAllergens?.length || 0) === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-green-600 font-semibold text-sm">
          <CheckCircle2 className="w-4 h-4" />
          Safe
        </span>
      )
    }

    if (safety.safe) {
      return (
        <span className="inline-flex items-center gap-1 text-yellow-600 font-semibold text-sm">
          <AlertCircle className="w-4 h-4" />
          Check Labels
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 text-red-600 font-semibold text-sm">
        <AlertCircle className="w-4 h-4" />
        Danger!
      </span>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Search className="w-8 h-8 text-purple-600" />
        <h2 className="text-3xl font-bold">{t('title')}</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{t('errors.search', { defaultValue: error })}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
            placeholder={t('search.placeholder')}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                {t('search.searching')}
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                {t('search.button')}
              </>
            )}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="border-2 border-gray-300 hover:border-purple-600 text-gray-700 hover:text-purple-600 px-4 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <Filter className="w-5 h-5" />
            {t('filters.title')}
          </button>
          {(searchQuery || selectedCategory || selectedAllergens.length > 0 || maxCarbs || products.length > 0) && (
            <button
              onClick={clearFilters}
              className="border-2 border-red-300 hover:border-red-600 text-red-600 hover:bg-red-50 px-4 py-3 rounded-lg font-semibold transition"
            >
              {t('filters.clear')}
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="border-t-2 border-gray-200 pt-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                    className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
                      selectedCategory === cat
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Avoid Allergens
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {ALLERGENS.map(allergen => (
                  <button
                    key={allergen}
                    onClick={() => toggleAllergen(allergen)}
                    className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
                      selectedAllergens.includes(allergen)
                        ? 'bg-red-100 text-red-700 border-2 border-red-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedAllergens.includes(allergen) ? '✓ ' : ''}{allergen}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max Carbs (g)
              </label>
              <input
                type="number"
                value={maxCarbs}
                onChange={e => setMaxCarbs(e.target.value)}
                placeholder="Leave empty for no limit"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {products.length === 0 && !loading && searchQuery && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No products found. Try a different search!</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
            <p className="text-gray-600">Searching products...</p>
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div>
          <p className="text-gray-600 mb-4">Found {products.length} products</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => {
              const safety = checkProductSafety(product)
              
              return (
              <div
                key={product._id}
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 ${
                  !safety.safe ? 'border-2 border-red-500' : ''
                }`}
              >
                {/* Product Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(product._id)}
                    className={`ml-2 transition ${
                      favorites.includes(product._id)
                        ? 'text-red-600'
                        : 'text-gray-300 hover:text-red-400'
                    }`}
                  >
                    <Heart
                      className="w-6 h-6"
                      fill={favorites.includes(product._id) ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>

                {/* Safety Badge */}
                <div className="mb-3">{getSafetyBadge(product)}</div>

                {/* Danger Warning */}
                {!safety.safe && (safety.allergens?.length || 0) > 0 && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-red-700 text-sm">
                          ⚠️ Contains Your Allergens!
                        </p>
                        <p className="text-red-600 text-xs mt-1">
                          This product contains: {safety.allergens?.join(', ') || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nutrition Info */}
                {product.nutrition && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Net Carbs</p>
                      <p className="font-bold text-purple-600">{product.nutrition.netCarbs}g</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Sugar</p>
                      <p className="font-bold text-purple-600">{product.nutrition.sugar}g</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Protein</p>
                      <p className="font-bold text-purple-600">{product.nutrition.protein}g</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Calories</p>
                      <p className="font-bold text-purple-600">{product.nutrition.calories}</p>
                    </div>
                  </div>
                )}

                {/* Allergens */}
                {product.allergens?.contains && product.allergens.contains.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Contains:</p>
                    <div className="flex flex-wrap gap-1">
                      {product.allergens.contains.map((allergen: string) => {
                        const isDangerous = safety.allergens?.includes(allergen) || false
                        return (
                          <span
                            key={allergen}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              isDangerous
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {allergen}
                            {isDangerous && ' ⚠️'}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* GI/GL Info */}
                {product.diabetesInfo && (
                  <div className="bg-blue-50 rounded-lg p-2 text-sm">
                    <p className="text-gray-600">
                      GI: <span className="font-bold text-blue-600">{product.diabetesInfo.glycemicIndex}</span>
                      {' | '}
                      GL: <span className="font-bold text-blue-600">{product.diabetesInfo.glycemicLoad}</span>
                    </p>
                  </div>
                )}

                {/* Category */}
                <p className="text-xs text-gray-500 mt-3">{product.category}</p>
              </div>
              )
            })}
          </div>
        </div>
      )}

      {!searchQuery && !loading && products.length === 0 && (
        <div className="bg-purple-50 rounded-lg p-12 text-center border-2 border-purple-200">
          <Search className="w-16 h-16 mx-auto mb-4 text-purple-300" />
          <p className="text-gray-600 text-lg mb-4">Start searching for products you love!</p>
          <p className="text-gray-500 text-sm mb-6">
            Search by product name, brand, or ingredient. Use filters to match your dietary needs.
          </p>
          <button
            onClick={() => handleSearch(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Browse All Products (50+)
          </button>
        </div>
      )}
    </div>
  )
}
