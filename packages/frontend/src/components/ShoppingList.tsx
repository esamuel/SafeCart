'use client'

import { useState, useEffect } from 'react'
import { shoppingListsAPI, productsAPI, usersAPI } from '@/lib/api'
import { auth } from '@/lib/firebase'
import { Plus, Trash2, Check, X, ShoppingCart, Loader, AlertCircle, CheckCircle2 } from 'lucide-react'
import ShoppingListItem from './ShoppingListItem'

export default function ShoppingList() {
  const [lists, setLists] = useState<any[]>([])
  const [selectedList, setSelectedList] = useState<any>(null)
  const [newItemName, setNewItemName] = useState('')
  const [newListName, setNewListName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [creatingList, setCreatingList] = useState(false)
  const [showNewListForm, setShowNewListForm] = useState(false)

  const user = auth.currentUser

  // Load shopping lists on mount
  useEffect(() => {
    if (user) {
      loadLists()
    }
  }, [user])

  const loadLists = async () => {
    try {
      setLoading(true)
      const userLists = await shoppingListsAPI.getUserLists(user!.uid)
      setLists(userLists)
      if (userLists.length > 0 && !selectedList) {
        setSelectedList(userLists[0])
      }
    } catch (err: any) {
      setError('Failed to load shopping lists')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createNewList = async () => {
    if (!newListName.trim()) return
    try {
      setCreatingList(true)
      const newList = await shoppingListsAPI.create(user!.uid, newListName)
      setLists([...lists, newList])
      setSelectedList(newList)
      setNewListName('')
      setShowNewListForm(false)
    } catch (err: any) {
      setError('Failed to create list')
      console.error(err)
    } finally {
      setCreatingList(false)
    }
  }

  const addItem = async () => {
    if (!newItemName.trim() || !selectedList) return
    try {
      // STEP 1: Search for product in database to check allergens
      let productInfo: any = null
      let dangerousAllergens: string[] = []
      
      try {
        const searchResults = await productsAPI.search(newItemName, {})
        
        if (searchResults.length > 0) {
          productInfo = searchResults[0]
          console.log('✅ Found product:', productInfo)
          
          // STEP 2: Get user's allergies from profile
          let userAllergies: string[] = []
          try {
            const userProfile = await usersAPI.getProfile(user!.uid)
            if (userProfile.healthProfiles && userProfile.healthProfiles.length > 0) {
              userAllergies = userProfile.healthProfiles[0].allergies || []
              console.log('🔍 User allergies:', userAllergies)
            }
          } catch (profileErr) {
            console.log('Could not fetch user profile')
          }
          
          // STEP 3: Check if product allergens match user's allergies
          if (productInfo.allergens?.contains && userAllergies.length > 0) {
            const productAllergens = productInfo.allergens.contains.map((a: string) => a.toLowerCase())
            
            userAllergies.forEach((userAllergy: string) => {
              if (productAllergens.includes(userAllergy.toLowerCase())) {
                dangerousAllergens.push(userAllergy)
              }
            })
            
            console.log('⚠️ Dangerous allergens found:', dangerousAllergens)
          }
        }
      } catch (searchErr) {
        // Product not found - that's okay, just add the item
        console.log('ℹ️ Product not found in database, adding as text item')
      }
      
      // STEP 4: Add item to shopping list
      await shoppingListsAPI.addItem(selectedList._id, {
        name: newItemName,
        quantity: 1,
        unit: 'unit',
      })
      
      // STEP 5: Show warning if product contains user's allergens
      if (dangerousAllergens.length > 0) {
        const warningMessage = `⚠️ DANGER: "${productInfo.name}" contains: ${dangerousAllergens.join(', ')}\n\nYou are allergic to these! Please do not consume this product!`
        alert(warningMessage)
      } else if (productInfo && productInfo.allergens?.contains?.length > 0) {
        // Product has allergens, but not ones user is allergic to
        const infoMessage = `ℹ️ Note: "${productInfo.name}" contains: ${productInfo.allergens.contains.join(', ')}\n\nThese are safe for you.`
        console.log(infoMessage)
      }
      
      // Reload the selected list
      const updated = await shoppingListsAPI.getList(selectedList._id)
      setSelectedList(updated)
      setNewItemName('')
    } catch (err: any) {
      setError('Failed to add item')
      console.error(err)
    }
  }

  const toggleItem = async (itemIndex: number) => {
    if (!selectedList) return
    try {
      const item = selectedList.items[itemIndex]
      await shoppingListsAPI.updateItem(selectedList._id, itemIndex, {
        checked: !item.checked,
      })
      const updated = await shoppingListsAPI.getList(selectedList._id)
      setSelectedList(updated)
    } catch (err: any) {
      setError('Failed to update item')
      console.error(err)
    }
  }

  const deleteItem = async (itemIndex: number) => {
    if (!selectedList) return
    try {
      await shoppingListsAPI.deleteItem(selectedList._id, itemIndex)
      const updated = await shoppingListsAPI.getList(selectedList._id)
      setSelectedList(updated)
    } catch (err: any) {
      setError('Failed to delete item')
      console.error(err)
    }
  }

  const updateItemQuantity = async (itemIndex: number, quantity: number) => {
    if (!selectedList || quantity < 1) return
    try {
      await shoppingListsAPI.updateItem(selectedList._id, itemIndex, { quantity })
      const updated = await shoppingListsAPI.getList(selectedList._id)
      setSelectedList(updated)
    } catch (err: any) {
      setError('Failed to update quantity')
      console.error(err)
    }
  }

  const deleteList = async (listId: string) => {
    try {
      await shoppingListsAPI.delete(listId)
      const newLists = lists.filter(l => l._id !== listId)
      setLists(newLists)
      if (selectedList._id === listId) {
        setSelectedList(newLists[0] || null)
      }
    } catch (err: any) {
      setError('Failed to delete list')
      console.error(err)
    }
  }

  // Check if item is safe for user's allergies
  const checkItemSafety = async (itemName: string) => {
    try {
      if (!user) return { safe: null, allergens: [] }
      
      // Search for product
      const products = await productsAPI.search(itemName, {})
      if (products.length === 0) return { safe: null, allergens: [] }
      
      const product = products[0]
      const allergens = product.allergens?.contains || []
      
      // Get user allergies
      const profile = await usersAPI.getProfile(user.uid)
      const userAllergies = profile.healthProfiles?.[0]?.allergies || []
      
      // Check for matches
      const dangerousAllergens = allergens.filter((a: string) =>
        userAllergies.some((ua: string) => ua.toLowerCase() === a.toLowerCase())
      )
      
      return {
        safe: dangerousAllergens.length === 0,
        allergens: dangerousAllergens,
        productAllergens: allergens,
      }
    } catch (err) {
      return { safe: null, allergens: [] }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading shopping lists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="w-8 h-8 text-purple-600" />
        <h2 className="text-3xl font-bold">Shopping Lists</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Lists Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {lists.map(list => (
          <button
            key={list._id}
            onClick={() => setSelectedList(list)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              selectedList?._id === list._id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {list.name}
          </button>
        ))}
        <button
          onClick={() => setShowNewListForm(!showNewListForm)}
          className="px-4 py-2 rounded-lg font-medium bg-green-100 text-green-700 hover:bg-green-200 transition whitespace-nowrap"
        >
          + New List
        </button>
      </div>

      {/* New List Form */}
      {showNewListForm && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              placeholder="List name (e.g., Weekly Shopping)"
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
              onKeyPress={e => e.key === 'Enter' && createNewList()}
            />
            <button
              onClick={createNewList}
              disabled={creatingList}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewListForm(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Selected List Content */}
      {selectedList ? (
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b-2 border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold">{selectedList.name}</h3>
              <p className="text-gray-600 text-sm">
                {selectedList.items.filter((i: any) => !i.checked).length} items remaining
              </p>
            </div>
            <button
              onClick={() => deleteList(selectedList._id)}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Delete List
            </button>
          </div>

          {/* Add Item Form */}
          <div className="p-6 border-b-2 border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                placeholder="Add an item..."
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                onKeyPress={e => e.key === 'Enter' && addItem()}
              />
              <button
                onClick={addItem}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="divide-y">
            {selectedList.items.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No items yet. Add one to get started!</p>
              </div>
            ) : (
              selectedList.items.map((item: any, index: number) => (
                <ShoppingListItem
                  key={index}
                  item={item}
                  index={index}
                  onToggle={toggleItem}
                  onDelete={deleteItem}
                  onUpdateQuantity={updateItemQuantity}
                />
              ))
            )}
          </div>

          {/* Summary */}
          {selectedList.items.length > 0 && (
            <div className="bg-purple-50 p-4 text-center text-sm text-gray-600">
              {selectedList.items.filter((i: any) => i.checked).length} of{' '}
              {selectedList.items.length} items completed
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-lg text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">No shopping lists yet.</p>
          <button
            onClick={() => setShowNewListForm(true)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Create Your First List
          </button>
        </div>
      )}
    </div>
  )
}
