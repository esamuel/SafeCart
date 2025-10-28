'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, AlertCircle, CheckCircle, Loader, Camera, Copy } from 'lucide-react'
import { productsAPI, shoppingListsAPI } from '@/lib/api'
import { auth } from '@/lib/firebase'

export default function Scanner({ products }: any) {
  const [barcode, setBarcode] = useState('')
  const [scannedProduct, setScannedProduct] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [addingToList, setAddingToList] = useState(false)

  const user = auth.currentUser

  const startCamera = async () => {
    try {
      setCameraError('')

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API not supported on this device. Please use manual entry below.')
        return
      }

      // Check if we're on HTTPS (required for camera access on mobile)
      if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
        setCameraError('Camera requires secure connection (HTTPS). Please use manual barcode entry below, or access via HTTPS.')
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraActive(true)
      }
    } catch (err: any) {
      console.error('Camera error:', err)

      // Provide specific error messages based on error type
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Please allow camera permissions in your browser settings and try again.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please use manual barcode entry below.')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is already in use by another app. Please close other apps and try again.')
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        setCameraError('Camera constraints not supported. Trying again with default settings...')
        // Retry with minimal constraints
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          })
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            streamRef.current = stream
            setCameraActive(true)
            setCameraError('')
          }
        } catch (retryErr) {
          setCameraError('Unable to access camera. Please use manual barcode entry below.')
        }
      } else if (err.name === 'SecurityError') {
        setCameraError('Camera access blocked by security settings. Try accessing via HTTPS or use manual entry.')
      } else {
        setCameraError(`Unable to access camera: ${err.message || 'Unknown error'}. Please use manual barcode entry below.`)
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

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

  const addToShoppingList = async () => {
    if (!user || !scannedProduct) return
    try {
      setAddingToList(true)
      setError('')
      
      // Get user's shopping lists
      const lists = await shoppingListsAPI.getUserLists(user.uid)
      
      if (lists.length === 0) {
        // Create a new list if none exist
        const newList = await shoppingListsAPI.create(
          user.uid,
          'Shopping List',
          'My shopping list'
        )
        await shoppingListsAPI.addItem(newList._id, {
          name: scannedProduct.name,
          quantity: 1,
          unit: 'unit',
        })
        alert('✅ Product added to your new shopping list!')
      } else {
        // Add to the first list
        await shoppingListsAPI.addItem(lists[0]._id, {
          name: scannedProduct.name,
          quantity: 1,
          unit: 'unit',
        })
        alert('✅ Product added to shopping list!')
      }
      
      console.log('Product added to shopping list:', scannedProduct.name)
    } catch (err: any) {
      setError('Failed to add to shopping list: ' + err.message)
      console.error(err)
    } finally {
      setAddingToList(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">Scan Product</h2>
      <p className="text-gray-600 mb-6">Use your camera or enter barcode manually</p>

      {/* Info Box - Camera Requirements */}
      {!cameraActive && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>💡 Tip:</strong> Camera access requires HTTPS on mobile devices.
            If camera doesn't work, you can always use manual barcode entry below - it works just as well!
          </p>
        </div>
      )}

      {cameraError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm font-medium">{cameraError}</p>
          </div>
          {cameraError.includes('HTTPS') && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="text-red-600 text-xs">
                <strong>Why?</strong> Mobile browsers require a secure connection (HTTPS) for camera access.
                You can still use manual barcode entry below, or ask your administrator to enable HTTPS.
              </p>
            </div>
          )}
          {cameraError.includes('permissions') && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="text-red-600 text-xs">
                <strong>How to fix:</strong> Go to your browser settings → Site permissions → Camera →
                Allow access for this site, then refresh and try again.
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Camera View */}
      {cameraActive ? (
        <div className="bg-black rounded-3xl h-80 flex items-center justify-center mb-6 relative overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-purple-500 rounded-3xl pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <Camera className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                <p className="text-sm">Point camera at barcode</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-black rounded-3xl h-80 flex items-center justify-center mb-6 relative overflow-hidden">
          <div className="w-48 h-48 border-4 border-purple-500 rounded-2xl relative animate-pulse">
            <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Camera Controls */}
      <div className="flex gap-3 mb-6">
        {cameraActive ? (
          <button
            onClick={stopCamera}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition font-semibold"
          >
            <Camera className="w-5 h-5" />
            Stop Camera
          </button>
        ) : (
          <button
            onClick={startCamera}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition font-semibold"
          >
            <Camera className="w-5 h-5" />
            Start Camera
          </button>
        )}
      </div>

      {/* Manual Barcode Input */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
        <p className="text-sm text-gray-600 mb-3 font-semibold">Manual Entry</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={barcode}
            onChange={e => setBarcode(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleScan()}
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
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex-shrink-0 flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">{scannedProduct.name}</h3>
              <p className="text-gray-600 text-sm">UPC: {scannedProduct.barcode || scannedProduct.upc}</p>
            </div>
            <div>
              {scannedProduct.safe !== false ? (
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  SAFE
                </div>
              ) : (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  CHECK
                </div>
              )}
            </div>
          </div>

          {/* Nutrition Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-xl text-center">
              <p className="text-gray-600 text-sm mb-1">Net Carbs</p>
              <p className="text-3xl font-bold text-purple-600">
                {scannedProduct.carbs || scannedProduct.nutrition?.netCarbs || 'N/A'}g
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl text-center">
              <p className="text-gray-600 text-sm mb-1">Glycemic Index</p>
              <p className="text-3xl font-bold text-purple-600">
                {scannedProduct.gi || scannedProduct.diabetesInfo?.glycemicIndex || 'N/A'}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl text-center">
              <p className="text-gray-600 text-sm mb-1">Sugar</p>
              <p className="text-3xl font-bold text-purple-600">
                {scannedProduct.sugar || scannedProduct.nutrition?.sugar || 'N/A'}g
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl text-center">
              <p className="text-gray-600 text-sm mb-1">GL Score</p>
              <p className="text-3xl font-bold text-purple-600">
                {scannedProduct.gl || scannedProduct.diabetesInfo?.glycemicLoad || 'N/A'}
              </p>
            </div>
          </div>

          {/* Allergens */}
          {(() => {
            // Handle different allergen structures safely
            let allergenArray: string[] = []
            
            if (scannedProduct.allergens?.contains && Array.isArray(scannedProduct.allergens.contains)) {
              allergenArray = scannedProduct.allergens.contains
            } else if (Array.isArray(scannedProduct.allergens)) {
              allergenArray = scannedProduct.allergens
            }
            
            if (allergenArray.length > 0) {
              return (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Allergens:</p>
                  <div className="flex flex-wrap gap-2">
                    {allergenArray.map((allergen: string) => (
                      <span
                        key={allergen}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )
            }
            return null
          })()}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setBarcode('')
                setScannedProduct(null)
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-xl font-semibold transition"
            >
              Scan Another
            </button>
            <button
              onClick={addToShoppingList}
              disabled={addingToList}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
            >
              {addingToList ? 'Adding...' : 'Add to Shopping List'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
