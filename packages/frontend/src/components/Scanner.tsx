'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, AlertCircle, CheckCircle, Loader, Camera, Copy } from 'lucide-react'
import { scannerAPI, shoppingListsAPI } from '@/lib/api'
import { auth } from '@/lib/firebase'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'

export default function Scanner({ products }: any) {
  const { t } = useTranslation('scanner')
  const [barcode, setBarcode] = useState('')
  const [scannedProduct, setScannedProduct] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [cameraErrorCode, setCameraErrorCode] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [addingToList, setAddingToList] = useState(false)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const user = auth.currentUser

  useEffect(() => {
    // Detect mobile device
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    setIsMobileDevice(isIOS || isMobile)
  }, [])

  const handlePhotoCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      setError('')

      // Create an image element to load the photo
      const img = new Image()
      const reader = new FileReader()

      reader.onload = (e) => {
        img.onload = async () => {
          try {
            // Create a canvas to draw the image
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            
            if (!ctx) {
              throw new Error('Failed to get canvas context')
            }

            ctx.drawImage(img, 0, 0)

            // Use ZXing to detect barcode
            const codeReader = new BrowserMultiFormatReader()
            
            try {
              const result = await codeReader.decodeFromCanvas(canvas)
              
              if (result && result.getText()) {
                const detectedBarcode = result.getText()
                console.log('Barcode detected:', detectedBarcode)
                
                // Set the barcode and automatically trigger scan
                setBarcode(detectedBarcode)
                setLoading(false)
                
                // Automatically scan the detected barcode
                setTimeout(() => {
                  handleScanWithBarcode(detectedBarcode)
                }, 100)
              }
            } catch (err) {
              if (err instanceof NotFoundException) {
                setError(t('cameraError.noBarcodeFound', { defaultValue: 'No barcode found in the photo. Please try again or enter manually.' }))
              } else {
                throw err
              }
              setLoading(false)
            }
          } catch (err) {
            console.error('Barcode detection error:', err)
            setError(t('cameraError.photoError', { defaultValue: 'Failed to read barcode from photo. Please enter manually.' }))
            setLoading(false)
          }
        }
        img.src = e.target?.result as string
      }

      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Photo capture error:', err)
      setError(t('cameraError.photoError', { defaultValue: 'Failed to process photo. Please enter barcode manually.' }))
      setLoading(false)
    }
  }

  const handleScanWithBarcode = async (barcodeValue: string) => {
    setError('')
    setLoading(true)
    try {
      // Use the new scanner API with multi-region support
      const result = await scannerAPI.scan(barcodeValue, user?.uid)

      if (result.found) {
        // Product found - show it with safety analysis
        setScannedProduct({
          ...result.product,
          safetyAnalysis: result.safetyAnalysis,
          region: result.region,
          source: result.source
        })
      } else {
        // Product not found - show error with option to add manually
        setError(t('results.productNotFound') + ' ' + (result.message || ''))
        setScannedProduct(null)
      }
    } catch (err: any) {
      console.error('Scanner error:', err)
      setError(err.message || t('results.productNotFound'))
      setScannedProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const startCamera = async () => {
    try {
      setCameraError('')
      setCameraErrorCode(null)

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(t('cameraError.notSupported'))
        setCameraErrorCode('notSupported')
        return
      }

      // Check if we're on HTTPS (required for camera access on mobile)
      if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
        setCameraError(t('cameraError.httpsRequired'))
        setCameraErrorCode('httpsRequired')
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

        // Ensure video plays on iPhone
        videoRef.current.setAttribute('playsinline', 'true')
        videoRef.current.setAttribute('webkit-playsinline', 'true')
        await videoRef.current.play()

        setCameraActive(true)
      }
    } catch (err: any) {
      console.error('Camera error:', err)

      // Provide specific error messages based on error type
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(t('cameraError.permissionDenied'))
        setCameraErrorCode('permissionDenied')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError(t('cameraError.noCamera'))
        setCameraErrorCode('noCamera')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError(t('cameraError.inUse'))
        setCameraErrorCode('inUse')
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        setCameraError(t('cameraError.constraintsFailed'))
        setCameraErrorCode('constraintsFailed')
        // Retry with minimal constraints
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          })
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            streamRef.current = stream

            // Ensure video plays on iPhone
            videoRef.current.setAttribute('playsinline', 'true')
            videoRef.current.setAttribute('webkit-playsinline', 'true')
            await videoRef.current.play()

            setCameraActive(true)
            setCameraError('')
            setCameraErrorCode(null)
          }
        } catch (retryErr) {
          setCameraError(t('cameraError.unknown'))
          setCameraErrorCode('unknown')
        }
      } else if (err.name === 'SecurityError') {
        setCameraError(t('cameraError.securityError'))
        setCameraErrorCode('securityError')
      } else {
        setCameraError(t('cameraError.unknown'))
        setCameraErrorCode('unknown')
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
    await handleScanWithBarcode(barcode)
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
        alert(t('results.addedToNewList'))
      } else {
        // Add to the first list
        await shoppingListsAPI.addItem(lists[0]._id, {
          name: scannedProduct.name,
          quantity: 1,
          unit: 'unit',
        })
        alert(t('results.addedSuccess'))
      }
      
      console.log('Product added to shopping list:', scannedProduct.name)
    } catch (err: any) {
      setError(t('results.addedError', { defaultValue: 'Failed to add to shopping list: {{message}}', message: err.message }))
      console.error(err)
    } finally {
      setAddingToList(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">{t('title')}</h2>
      <p className="text-gray-600 mb-6">{t('subtitle')}</p>

      {/* Info Box - Camera Requirements */}
      {!cameraActive && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>💡 {t('infoTitle', { defaultValue: 'Tip:' })}</strong>{' '}
            {isMobileDevice
              ? t('infoTipMobile', { defaultValue: 'Tap "Take Photo" to use your camera, or enter the barcode number manually below.' })
              : t('infoTip')}
          </p>
        </div>
      )}

      {cameraError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm font-medium">{cameraError}</p>
          </div>
          {cameraErrorCode === 'httpsRequired' && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="text-red-600 text-xs">{t('cameraError.whyHttps')}</p>
            </div>
          )}
          {cameraErrorCode === 'permissionDenied' && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="text-red-600 text-xs">{t('cameraError.howToFix')}</p>
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
            muted
            webkit-playsinline="true"
            x-webkit-airplay="deny"
            className="w-full h-full object-cover"
            style={{
              transform: 'scaleX(1)',
              WebkitTransform: 'scaleX(1)',
            }}
          />
          <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-purple-500 rounded-3xl pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center bg-black bg-opacity-50 p-4 rounded-lg">
                <Camera className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                <p className="text-sm">{t('camera.pointAtBarcode')}</p>
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
        {isMobileDevice ? (
          // Mobile: Show "Take Photo" button
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition font-semibold disabled:opacity-50"
            >
              <Camera className="w-5 h-5" />
              {t('camera.takePhoto', { defaultValue: 'Take Photo' })}
            </button>
          </>
        ) : (
          // Desktop: Show camera stream controls
          <>
            {cameraActive ? (
              <button
                onClick={stopCamera}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition font-semibold"
              >
                <Camera className="w-5 h-5" />
                {t('camera.stop')}
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition font-semibold"
              >
                <Camera className="w-5 h-5" />
                {t('camera.start')}
              </button>
            )}
          </>
        )}
      </div>

      {/* Manual Barcode Input */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
        <p className="text-sm text-gray-600 mb-3 font-semibold">{t('manualEntry.title')}</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={barcode}
            onChange={e => setBarcode(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleScan()}
            placeholder={t('manualEntry.placeholder')}
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
                {t('manualEntry.scanning')}
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                {t('manualEntry.scanButton')}
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
              <p className="text-gray-600 text-sm">{t('results.upc')}: {scannedProduct.barcode || scannedProduct.upc}</p>
              {scannedProduct.region && (
                <p className="text-gray-500 text-xs mt-1">
                  📍 {scannedProduct.region} • {scannedProduct.source === 'cache' ? 'Cached' : 'Live data'}
                </p>
              )}
            </div>
            <div>
              {scannedProduct.safetyAnalysis ? (
                scannedProduct.safetyAnalysis.overallSafety === 'safe' ? (
                  <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {t('results.badges.safe', { defaultValue: 'SAFE' })}
                  </div>
                ) : scannedProduct.safetyAnalysis.overallSafety === 'warning' ? (
                  <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    WARNING
                  </div>
                ) : (
                  <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    DANGER
                  </div>
                )
              ) : (
                <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {t('results.badges.check', { defaultValue: 'CHECK' })}
                </div>
              )}
            </div>
          </div>

          {/* Safety Warnings */}
          {scannedProduct.safetyAnalysis && (
            <>
              {/* Allergen Warnings */}
              {scannedProduct.safetyAnalysis.allergenWarnings?.length > 0 && (
                <div className="mb-6">
                  {scannedProduct.safetyAnalysis.allergenWarnings.map((warning: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl mb-2 ${
                        warning.severity === 'danger'
                          ? 'bg-red-50 border-2 border-red-200'
                          : 'bg-yellow-50 border-2 border-yellow-200'
                      }`}
                    >
                      <p className={`font-semibold ${warning.severity === 'danger' ? 'text-red-700' : 'text-yellow-700'}`}>
                        {warning.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Diabetes Warnings */}
              {scannedProduct.safetyAnalysis.diabetesWarnings?.length > 0 && (
                <div className="mb-6">
                  {scannedProduct.safetyAnalysis.diabetesWarnings.map((warning: any, idx: number) => (
                    <div key={idx} className="bg-orange-50 border-2 border-orange-200 p-4 rounded-xl mb-2">
                      <p className="text-orange-700 font-semibold">{warning.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {scannedProduct.safetyAnalysis.recommendations?.length > 0 && (
                <div className="mb-6">
                  {scannedProduct.safetyAnalysis.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="bg-blue-50 border-2 border-blue-200 p-3 rounded-xl mb-2">
                      <p className="text-blue-700 text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Nutrition Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-xl text-center">
              <p className="text-gray-600 text-sm mb-1">{t('results.nutrition.netCarbs')}</p>
              <p className="text-3xl font-bold text-purple-600">
                {scannedProduct.carbs || scannedProduct.nutrition?.netCarbs || t('results.na', { defaultValue: 'N/A' })}g
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl text-center">
              <p className="text-gray-600 text-sm mb-1">{t('results.nutrition.glycemicIndex')}</p>
              <p className="text-3xl font-bold text-purple-600">
                {scannedProduct.gi || scannedProduct.diabetesInfo?.glycemicIndex || t('results.na', { defaultValue: 'N/A' })}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl text-center">
              <p className="text-gray-600 text-sm mb-1">{t('results.nutrition.sugar')}</p>
              <p className="text-3xl font-bold text-purple-600">
                {scannedProduct.sugar || scannedProduct.nutrition?.sugar || t('results.na', { defaultValue: 'N/A' })}g
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl text-center">
              <p className="text-gray-600 text-sm mb-1">{t('results.nutrition.glScore')}</p>
              <p className="text-3xl font-bold text-purple-600">
                {scannedProduct.gl || scannedProduct.diabetesInfo?.glycemicLoad || t('results.na', { defaultValue: 'N/A' })}
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
                  <p className="text-sm font-semibold text-gray-700 mb-3">{t('results.allergens')}:</p>
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
              {t('results.actions.scanAnother')}
            </button>
            <button
              onClick={addToShoppingList}
              disabled={addingToList}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
            >
              {addingToList ? t('results.actions.adding') : t('results.actions.addToList')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
