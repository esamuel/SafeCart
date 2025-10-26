'use client'

import { Trash2, Plus } from 'lucide-react'
import { useState } from 'react'

export default function ShoppingList({ items, setItems }: any) {
  const [newItem, setNewItem] = useState('')

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, { id: Date.now(), name: newItem, checked: false }])
      setNewItem('')
    }
  }

  const toggleItem = (id: number) => {
    setItems(items.map((item: any) => (item.id === id ? { ...item, checked: !item.checked } : item)))
  }

  const deleteItem = (id: number) => {
    setItems(items.filter((item: any) => item.id !== id))
  }

  const checkedCount = items.filter((item: any) => item.checked).length
  const progress = items.length > 0 ? (checkedCount / items.length) * 100 : 0

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">My Shopping List</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full flex items-center gap-2 transition font-semibold">
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Progress Card */}
      {items.length > 0 && (
        <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-4 rounded-2xl mb-6 border border-purple-200">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-gray-700">Weekly Grocery</span>
            <span className="text-purple-600 font-semibold">{checkedCount} of {items.length} items</span>
          </div>
          <div className="w-full bg-gray-300 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-purple-800 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Add Item Form */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add item..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
          />
          <button
            onClick={addItem}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item: any) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
          >
            <div
              onClick={() => toggleItem(item.id)}
              className={`w-6 h-6 border-2 rounded-lg cursor-pointer flex items-center justify-center transition ${
                item.checked
                  ? 'bg-purple-600 border-purple-600'
                  : 'border-gray-400 hover:border-purple-600'
              }`}
            >
              {item.checked && <span className="text-white font-bold">✓</span>}
            </div>
            <span
              className={`flex-1 text-lg ${
                item.checked ? 'line-through text-gray-400' : 'text-gray-900 font-medium'
              }`}
            >
              {item.name}
            </span>
            <button
              onClick={() => deleteItem(item.id)}
              className="text-red-600 hover:text-red-700 transition p-2 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items yet. Add one to get started!</p>
        </div>
      )}

      {/* Total Summary */}
      {items.length > 0 && (
        <div className="mt-6 bg-gray-900 text-white p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg">Total ({items.length} items)</span>
            <span className="text-3xl font-bold">$42.87</span>
          </div>
          <button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-3 rounded-xl font-semibold transition">
            Start Shopping
          </button>
        </div>
      )}
    </div>
  )
}
