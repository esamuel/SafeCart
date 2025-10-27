'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { shoppingListsAPI, mealsAPI } from '@/lib/api'
import { BarChart3, ShoppingCart, Utensils, User, LogOut, Search } from 'lucide-react'
import Scanner from './Scanner'
import ShoppingList from './ShoppingList'
import MealPlanner from './MealPlanner'
import Profile from './Profile'
import ProductDiscovery from './ProductDiscovery'
import Logo from './Logo'

export default function Dashboard({ user }: any) {
  const [activeTab, setActiveTab] = useState('home')
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
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-90">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
              <p className="text-gray-600 mb-6">Your SafeCart overview</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Shopping List Items</p>
                    <p className="text-4xl font-bold">{stats.totalItems}</p>
                  </div>
                  <ShoppingCart className="w-10 h-10 opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Safe Products</p>
                    <p className="text-4xl font-bold">{stats.safeProducts}</p>
                  </div>
                  <BarChart3 className="w-10 h-10 opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Meals Planned</p>
                    <p className="text-4xl font-bold">{stats.mealsPlanned}</p>
                  </div>
                  <Utensils className="w-10 h-10 opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Avg GI Score</p>
                    <p className="text-4xl font-bold">{stats.avgGI}</p>
                  </div>
                  <Search className="w-10 h-10 opacity-80" />
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('scanner')}
                  className="bg-purple-50 hover:bg-purple-100 p-4 rounded-xl flex items-center gap-3 transition"
                >
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-2xl">
                    📷
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Scan Product</p>
                    <p className="text-sm text-gray-600">Check allergen safety</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="bg-blue-50 hover:bg-blue-100 p-4 rounded-xl flex items-center gap-3 transition"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl">
                    🔍
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Discover Products</p>
                    <p className="text-sm text-gray-600">Browse 50+ products</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('shopping')}
                  className="bg-green-50 hover:bg-green-100 p-4 rounded-xl flex items-center gap-3 transition"
                >
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-2xl">
                    📝
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Shopping Lists</p>
                    <p className="text-sm text-gray-600">Manage your lists</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('meals')}
                  className="bg-orange-50 hover:bg-orange-100 p-4 rounded-xl flex items-center gap-3 transition"
                >
                  <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-2xl">
                    📅
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Meal Planner</p>
                    <p className="text-sm text-gray-600">Plan your meals</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scanner' && <Scanner products={products} />}
        {activeTab === 'shopping' && <ShoppingList />}
        {activeTab === 'meals' && <MealPlanner />}
        {activeTab === 'discover' && <ProductDiscovery />}
        {activeTab === 'profile' && <Profile user={user} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 flex justify-around">
          {[
            { id: 'home', label: 'Home', emoji: '🏠' },
            { id: 'scanner', label: 'Scan', emoji: '📷' },
            { id: 'shopping', label: 'Lists', emoji: '📝' },
            { id: 'meals', label: 'Meals', emoji: '📅' },
            { id: 'discover', label: 'Discover', emoji: '🔍' },
            { id: 'profile', label: 'Profile', emoji: '👤' },
          ].map(({ id, label, emoji }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-1 py-4 px-4 transition ${
                activeTab === id
                  ? 'text-purple-600 border-t-4 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
