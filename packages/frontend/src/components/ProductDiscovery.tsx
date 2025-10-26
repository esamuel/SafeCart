'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

export default function ProductDiscovery() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const filters = ['All', 'Low GI', 'Dairy-Free', 'High Protein', 'Gluten-Free']

  const products = [
    { id: 1, name: 'Coconut Yogurt', brand: 'So Delicious', safe: true },
    { id: 2, name: 'Gluten-Free Bread', brand: 'Canyon Bakehouse', safe: true },
    { id: 3, name: 'Almond Butter', brand: "Justin's", safe: false },
    { id: 4, name: 'Chickpea Pasta', brand: 'Banza', safe: true },
    { id: 5, name: 'Organic Spinach', brand: 'Fresh Express', safe: true },
    { id: 6, name: 'Salmon Fillet', brand: 'Wild Caught', safe: true },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">Discover Safe Foods</h2>
      <p className="text-gray-600 mb-6">200,000+ products filtered for you</p>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-lg mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search products..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition ${
              activeFilter === filter
                ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Section Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended for You</h3>

      {/* Products Grid */}
      <div className="space-y-3">
        {products.map(product => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition flex items-center gap-4"
          >
            {/* Product Image Placeholder */}
            <div className="w-16 h-16 bg-gray-300 rounded-lg flex-shrink-0"></div>

            {/* Product Info */}
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">{product.name}</h4>
              <p className="text-sm text-gray-600">{product.brand}</p>
            </div>

            {/* Safety Badge */}
            <div>
              {product.safe ? (
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold text-sm">
                  ✓
                </div>
              ) : (
                <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-semibold text-sm">
                  !
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-3 rounded-xl font-semibold transition">
        Load More Products
      </button>
    </div>
  )
}
