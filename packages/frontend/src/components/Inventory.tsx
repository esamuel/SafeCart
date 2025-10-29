'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Camera, AlertTriangle, TrendingDown, Package, X, Calendar, MapPin, Trash2, Edit } from 'lucide-react'
import { inventoryAPI } from '@/lib/api'
import { auth } from '@/lib/firebase'

interface InventoryItem {
  _id: string
  name: string
  quantity: number
  unit: string
  location: string
  category: string
  expirationDate?: string
  daysUntilExpiration?: number
  expirationStatus: string
  isExpiring: boolean
  isExpired: boolean
  isLow: boolean
  allergens: string[]
  barcode?: string
}

interface Stats {
  totalItems: number
  expiringCount: number
  expiredCount: number
  lowStockCount: number
  byLocation: { [key: string]: { count: number } }
}

export default function Inventory() {
  const { t } = useTranslation('inventory')
  const [items, setItems] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [locationFilter, setLocationFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showQuickScan, setShowQuickScan] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  const user = auth.currentUser

  useEffect(() => {
    loadInventory()
  }, [locationFilter, searchQuery])

  const loadInventory = async () => {
    if (!user) return

    setLoading(true)
    try {
      const filters: any = {}
      if (locationFilter !== 'all') filters.location = locationFilter
      if (searchQuery) filters.search = searchQuery

      const response = await inventoryAPI.getAll(user.uid, filters)
      setItems(response.items || [])
      setStats(response.stats || null)
    } catch (error) {
      console.error('Error loading inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!user || !confirm(t('delete.confirm'))) return

    try {
      await inventoryAPI.delete(itemId, user.uid)
      loadInventory()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert(t('delete.error'))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-800 border-red-300'
      case 'today':
      case 'tomorrow':
      case 'soon': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'week':
      case 'fresh': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusText = (item: InventoryItem) => {
    if (!item.expirationDate) return t('status.noExpiration')
    if (item.isExpired) return t('status.expired')
    if (item.daysUntilExpiration === 0) return t('status.expiresToday')
    if (item.daysUntilExpiration === 1) return t('status.expiresTomorrow')
    if (item.daysUntilExpiration && item.daysUntilExpiration <= 3) return t('status.daysLeft', { count: item.daysUntilExpiration })
    if (item.daysUntilExpiration && item.daysUntilExpiration <= 7) return t('status.daysRemaining', { count: item.daysUntilExpiration })
    return t('status.fresh')
  }

  const getLocationEmoji = (location: string) => {
    switch (location) {
      case 'fridge': return '🧊'
      case 'freezer': return '❄️'
      case 'pantry': return '🏺'
      default: return '📦'
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Stats */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('title')}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowQuickScan(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium"
            >
              <Camera className="w-4 h-4" />
              {t('buttons.quickScan')}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              <Plus className="w-4 h-4" />
              {t('buttons.addItem')}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">{t('stats.totalItems')}</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{stats.totalItems}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-gray-600">{t('stats.expiringSoon')}</span>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{stats.expiringCount}</p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <X className="w-5 h-5 text-red-600" />
                <span className="text-sm text-gray-600">{t('stats.expired')}</span>
              </div>
              <p className="text-3xl font-bold text-red-600">{stats.expiredCount}</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-600">{t('stats.lowStock')}</span>
              </div>
              <p className="text-3xl font-bold text-orange-600">{stats.lowStockCount}</p>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Location Filter */}
          <div className="flex gap-2">
            {['all', 'pantry', 'fridge', 'freezer'].map((loc) => (
              <button
                key={loc}
                onClick={() => setLocationFilter(loc)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  locationFilter === loc
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
{loc === 'all' ? t('filters.all') : getLocationEmoji(loc) + ' ' + t(`filters.locations.${loc}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Items */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('empty.title')}</h3>
          <p className="text-gray-600 mb-6">{t('empty.description')}</p>
          <button
            onClick={() => setShowQuickScan(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
          >
            {t('empty.action')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
                item.isExpired ? 'border-red-500' :
                item.isExpiring ? 'border-yellow-500' :
                'border-green-500'
              }`}
            >
              {/* Item Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.category}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-3">
                <p className="text-2xl font-bold text-purple-600">
                  {item.quantity} <span className="text-sm text-gray-600">{item.unit}</span>
                </p>
                {item.isLow && (
                  <span className="inline-block mt-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                    {t('badges.lowStock')}
                  </span>
                )}
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {getLocationEmoji(item.location)} {item.location.charAt(0).toUpperCase() + item.location.slice(1)}
                </span>
              </div>

              {/* Expiration */}
              {item.expirationDate && (
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {new Date(item.expirationDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Status Badge */}
              <div className={`px-3 py-1 rounded-lg border text-sm font-medium ${getStatusColor(item.expirationStatus)}`}>
                {getStatusText(item)}
              </div>

              {/* Allergens */}
              {item.allergens && item.allergens.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.allergens.map((allergen, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Scan Modal */}
      {showQuickScan && (
        <QuickScanModal
          onClose={() => setShowQuickScan(false)}
          onComplete={() => {
            setShowQuickScan(false)
            loadInventory()
          }}
        />
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onComplete={() => {
            setShowAddModal(false)
            loadInventory()
          }}
        />
      )}

      {/* Edit Item Modal */}
      {selectedItem && (
        <EditItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onComplete={() => {
            setSelectedItem(null)
            loadInventory()
          }}
        />
      )}
    </div>
  )
}

// Quick Scan Modal Component
function QuickScanModal({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const { t } = useTranslation('inventory')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [location, setLocation] = useState('pantry')
  const [scannedCount, setScannedCount] = useState(0)
  const [scanning, setScanning] = useState(false)

  const user = auth.currentUser

  const handleScan = async () => {
    if (!user || !barcodeInput.trim()) {
      alert(t('scanning.errors.barcodeRequired'))
      return
    }

    setScanning(true)
    try {
      await inventoryAPI.scanBarcode(user.uid, barcodeInput, quantity, location)
      setScannedCount(scannedCount + 1)
      setBarcodeInput('')
      setQuantity(1)
      alert(t('scanning.success'))
    } catch (error) {
      console.error('Error scanning:', error)
      alert(t('scanning.errors.productNotFound'))
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{t('scanning.title')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-800">
            {t('scanning.description')}
          </p>
          <p className="text-sm text-purple-600 mt-2 font-medium">
            {t('scanning.itemsScanned', { count: scannedCount })}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('scanning.barcode')}</label>
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder={t('scanning.barcodePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && handleScan()}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('scanning.quantity')}</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('scanning.location')}</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="pantry">🏺 {t('filters.locations.pantry')}</option>
              <option value="fridge">🧊 {t('filters.locations.fridge')}</option>
              <option value="freezer">❄️ {t('filters.locations.freezer')}</option>
              <option value="other">📦 {t('filters.locations.other')}</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleScan}
              disabled={scanning}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              {scanning ? t('scanning.scanning') : t('scanning.scanAndAdd')}
            </button>
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
            >
              {t('common:buttons.done')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add Item Modal (placeholder - can be expanded)
function AddItemModal({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const { t } = useTranslation('inventory')
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4">{t('modals.addItem.title')}</h2>
        <p className="text-gray-600 mb-4">{t('modals.addItem.description')}</p>
        <button
          onClick={onClose}
          className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
        >
          {t('common:buttons.close')}
        </button>
      </div>
    </div>
  )
}

// Edit Item Modal (placeholder)
function EditItemModal({ item, onClose, onComplete }: { item: InventoryItem; onClose: () => void; onComplete: () => void }) {
  const { t } = useTranslation('inventory')
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4">{t('modals.editItem.title', { name: item.name })}</h2>
        <p className="text-gray-600 mb-4">{t('modals.editItem.description')}</p>
        <button
          onClick={onClose}
          className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
        >
          {t('common:buttons.close')}
        </button>
      </div>
    </div>
  )
}
