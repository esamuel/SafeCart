'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { shoppingListsAPI, mealsAPI } from '@/lib/api'
import { BarChart3, ShoppingCart, Utensils, User, LogOut, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n' // Initialize i18n
import Scanner from './Scanner'
import ShoppingList from './ShoppingList'
import MealPlanner from './MealPlanner'
import Profile from './Profile'
import ProductDiscovery from './ProductDiscovery'
import EnhancedDashboard from './EnhancedDashboard'
import SocialFeed from './SocialFeed'
import Inventory from './Inventory'
import HealthAnalytics from './HealthAnalytics'
import Settings from './Settings'
import Logo from './Logo'
import LanguageSwitcher from './LanguageSwitcher'

export default function Dashboard({ user }: any) {
  const { t } = useTranslation('common')
  const [activeTab, setActiveTab] = useState('home')
  const [tabVisibility, setTabVisibility] = useState<any>({
    home: true,
    scanner: true,
    shopping: true,
    meals: true,
    inventory: true,
    discover: true,
    analytics: true,
    community: true,
    settings: true,
  })
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Almond Butter',
      barcode: '012345678901',
      allergens: ['tree nuts'],
      sugar: 2,
      carbs: 6,
      gi: 32,
      gl: 2,
      safe: true,
    },
    {
      id: 2,
      name: 'Whole Wheat Bread',
      barcode: '012345678902',
      allergens: ['gluten'],
      sugar: 3,
      carbs: 45,
      gi: 71,
      gl: 32,
      safe: false,
    },
  ])
  
  // Real stats from database
  const [stats, setStats] = useState({
    totalItems: 0,
    safeProducts: 0,
    mealsPlanned: 0,
    avgGI: 0,
  })

  // Load tab visibility from localStorage
  useEffect(() => {
    const loadTabVisibility = () => {
      const savedPrefs = localStorage.getItem('tabVisibility')
      if (savedPrefs) {
        try {
          setTabVisibility(JSON.parse(savedPrefs))
        } catch (e) {
          console.error('Failed to load tab preferences:', e)
        }
      }
    }

    // Load on mount
    loadTabVisibility()

    // Listen for changes from Settings page
    const handleVisibilityChange = () => {
      loadTabVisibility()
    }

    window.addEventListener('tabVisibilityChanged', handleVisibilityChange)

    return () => {
      window.removeEventListener('tabVisibilityChanged', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        console.log('No current user')
        return
      }

      let totalItems = 0
      let safeProducts = 0
      let mealsPlanned = 0
      let avgGI = 0

      // Get shopping lists
      try {
        const lists = await shoppingListsAPI.getUserLists(currentUser.uid)
        console.log('Loaded shopping lists:', lists.length)

        // Count all items in all lists
        for (const list of lists) {
          totalItems += list.items?.length || 0
          // Count safe items (items without danger badge)
          safeProducts += list.items?.filter((item: any) => item.checked === false).length || 0
        }
      } catch (listsErr) {
        console.log('Could not load shopping lists:', listsErr)
      }

      // Get meals
      try {
        const meals = await mealsAPI.getUserMeals(currentUser.uid)
        mealsPlanned = meals.length
        
        // If no meals in database, count sample meals from Meal Planner
        if (mealsPlanned === 0) {
          // Count sample meals (2 days × 3 meals = 6 meals)
          mealsPlanned = 6
          console.log('Using sample meals count (database empty)')
        } else {
          console.log('Loaded meals from database:', mealsPlanned)
        }
      } catch (mealsErr) {
        console.log('Could not load meals, using sample count:', mealsErr)
        // Use sample meals count as fallback
        mealsPlanned = 6
      }

      // Calculate average GI (mock for now)
      avgGI = mealsPlanned > 0 ? 45 : 0

      console.log('Setting stats:', { totalItems, safeProducts, mealsPlanned, avgGI })

      setStats({
        totalItems,
        safeProducts,
        mealsPlanned,
        avgGI,
      })
    } catch (err) {
      console.error('Error loading stats:', err)
      // Set minimal stats on error
      setStats({
        totalItems: 0,
        safeProducts: 0,
        mealsPlanned: 0,
        avgGI: 0,
      })
    }
  }

  // Reload stats when switching tabs
  useEffect(() => {
    if (activeTab === 'home') {
      loadStats()
    }
  }, [activeTab])

  const handleLogout = async () => {
    await signOut(auth)
  }

  const getSafetyBadge = (safe: boolean) => {
    if (safe) return <span className="safe-badge">✓ Safe</span>
    return <span className="danger-badge">⚠ Check Labels</span>
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <Logo size="medium" variant="white" />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <span className="text-sm opacity-90 hidden sm:inline">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('buttons.logout', 'Logout')}</span>
              <span className="sm:hidden">Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'home' && <EnhancedDashboard onNavigateToAnalytics={() => setActiveTab('analytics')} />}

        {activeTab === 'scanner' && <Scanner products={products} />}
        {activeTab === 'shopping' && <ShoppingList />}
        {activeTab === 'meals' && <MealPlanner />}
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'discover' && <ProductDiscovery />}
        {activeTab === 'analytics' && <HealthAnalytics user={user} />}
        {activeTab === 'community' && <SocialFeed />}
        {activeTab === 'profile' && <Profile user={user} />}
        {activeTab === 'settings' && <Settings user={user} onNavigateToProfile={() => setActiveTab('profile')} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl safe-area-bottom">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex justify-around overflow-x-auto scrollbar-hide">
          {[
            { id: 'home', labelKey: 'navigation.home', emoji: '🏠' },
            { id: 'scanner', labelKey: 'navigation.scanner', emoji: '📷' },
            { id: 'shopping', labelKey: 'navigation.shopping', emoji: '📝' },
            { id: 'meals', labelKey: 'navigation.meals', emoji: '📅' },
            { id: 'inventory', labelKey: 'navigation.inventory', emoji: '📦' },
            { id: 'discover', labelKey: 'navigation.discover', emoji: '🔍' },
            { id: 'analytics', labelKey: 'navigation.analytics', emoji: '📊' },
            { id: 'community', labelKey: 'navigation.community', emoji: '👥' },
            { id: 'settings', labelKey: 'navigation.settings', emoji: '⚙️' },
          ]
            .filter(tab => tabVisibility[tab.id] !== false) // Filter out hidden tabs
            .map(({ id, labelKey, emoji }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center justify-center gap-1 py-3 px-2 sm:px-4 min-w-[60px] sm:min-w-[80px] transition ${
                activeTab === id
                  ? 'text-purple-600 border-t-4 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
              }`}
            >
              <span className="text-xl sm:text-2xl">{emoji}</span>
              <span className="text-[10px] sm:text-xs font-medium truncate max-w-full">{t(labelKey)}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
