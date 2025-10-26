'use client'

import { useState } from 'react'
import { Search, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { productsAPI } from '@/lib/api'

export default function Scanner({ products }: any) {
  const [barcode, setBarcode] = useState('')
  const [scannedProduct, setScannedProduct] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleScan = async () => {
    setError('')
    setLoading(true)
    try {
      // Try to fetch from API first
      const product = await productsAPI.getByBarcode(barcode)
      setScannedProduct(product)
    } catch (err: any) {
      // Fallback to local products if API fails
      const localProduct = products.find((p: any) => p.barcode === barcode)
      if (localProduct) {
        setScannedProduct(localProduct)
      } else {
        setError('Product not found. Try another barcode.')
        setScannedProduct(null)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">Scan Product</h2>
      <p className="text-gray-600 mb-6">Position barcode in the frame</p>

      {/* Scanner View */}
      <div className="bg-black rounded-3xl h-80 flex items-center justify-center mb-6 relative overflow-hidden">
        <div className="w-48 h-48 border-4 border-purple-500 rounded-2xl relative animate-pulse">
          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500 animate-pulse"></div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Barcode Input */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleScan()}
            placeholder="Enter barcode or scan..."
            disabled={loading}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition disabled:bg-gray-100"
          />
          <button
            onClick={handleScan}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition font-semibold disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Scan
              </>
            )}
          </button>
        </div>
      </div>

      {scannedProduct && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          {/* Product Card */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-200">
            <div className="w-16 h-16 bg-gray-300 rounded-xl flex-shrink-0"></div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">{scannedProduct.name}</h3>
              <p className="text-gray-600 text-sm">UPC: {scannedProduct.barcode}</p>
            </div>
            <div>
              {scannedProduct.safe ? (
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold text-sm">
                  ✓ SAFE
                </div>
              ) : (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold text-sm">
                  ⚠ CHECK
                </div>
              )}
            </div>
          </div>

          {/* Nutrition Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-xl text-center">
              <p className="text-gray-600 text-sm mb-1">Net Carbs</p>
              <p className="text-3xl font-bold text-purple-600">{scannedProduct.carbs}g</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl text-center">
              <p className="text-gray-600 text-sm mb-1">Glycemic Index</p>
              <p className="text-3xl font-bold text-purple-600">{scannedProduct.gi}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl text-center">
              <p className="text-gray-600 text-sm mb-1">Sugar</p>
              <p className="text-3xl font-bold text-purple-600">{scannedProduct.sugar}g</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl text-center">
              <p className="text-gray-600 text-sm mb-1">GL Score</p>
              <p className="text-3xl font-bold text-purple-600">{scannedProduct.gl}</p>
            </div>
          </div>

          {/* Allergens */}
          {scannedProduct.allergens.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Allergens:</p>
              <div className="flex flex-wrap gap-2">
                {scannedProduct.allergens.map((allergen: string) => (
                  <span key={allergen} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-900 transition">
            Add to Shopping List
          </button>
        </div>
      )}
    </div>
  )
}
