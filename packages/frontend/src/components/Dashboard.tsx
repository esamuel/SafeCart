'use client'

import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
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
  const [shoppingList, setShoppingList] = useState([
    { id: 1, name: 'Eggs', checked: false },
    { id: 2, name: 'Milk', checked: true },
  ])

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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Products Scanned</p>
                    <p className="text-4xl font-bold">24</p>
                  </div>
                  <BarChart3 className="w-10 h-10 opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Safe Products</p>
                    <p className="text-4xl font-bold">18</p>
                  </div>
                  <ShoppingCart className="w-10 h-10 opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Meals Planned</p>
                    <p className="text-4xl font-bold">7</p>
                  </div>
                  <Utensils className="w-10 h-10 opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Avg GI Score</p>
                    <p className="text-4xl font-bold">42</p>
                  </div>
                  <Search className="w-10 h-10 opacity-80" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scanner' && <Scanner products={products} />}
        {activeTab === 'shopping' && <ShoppingList items={shoppingList} setItems={setShoppingList} />}
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
