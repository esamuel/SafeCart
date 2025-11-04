import { auth } from './firebase'

// ============================================
// SIMPLE API URL CONFIGURATION
// ============================================
// Always use production backend - no complex detection needed
const API_URL = 'https://safecart-backend-j3ry.onrender.com/api'

// For local development ONLY: uncomment the line below and comment the line above
// const API_URL = 'http://localhost:5002/api'

// Helper function to get API base URL
const getAPIBaseURL = () => {
  console.log('[API] Using API URL:', API_URL)
  return API_URL
}

// Get Firebase token
async function getAuthToken() {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')
  return await user.getIdToken()
}

// Auth API
export const authAPI = {
  verify: async (token: string) => {
    const response = await fetch(`${getAPIBaseURL()}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    if (!response.ok) throw new Error('Auth verification failed')
    return response.json()
  },
}

// Users API
export const usersAPI = {
  getProfile: async (userId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch profile')
    return response.json()
  },

  saveHealthProfile: async (userId: string, data: any) => {
    console.log('[API] saveHealthProfile called with userId:', userId)
    try {
      const token = await getAuthToken()
      const apiUrl = getAPIBaseURL()
      console.log('[API] Got auth token, making request to:', `${apiUrl}/users/${userId}/health-profile`)

      const response = await fetch(`${apiUrl}/users/${userId}/health-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      console.log('[API] Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[API] Error response:', errorText)
        throw new Error('Failed to save health profile')
      }

      const result = await response.json()
      console.log('[API] Success response:', result)
      return result
    } catch (error) {
      console.error('[API] saveHealthProfile error:', error)
      throw error
    }
  },

  updatePreferences: async (userId: string, preferences: any) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/users/${userId}/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(preferences),
    })
    if (!response.ok) throw new Error('Failed to update preferences')
    return response.json()
  },
}

// Products API
export const productsAPI = {
  search: async (query: string, filters?: any) => {
    const params = new URLSearchParams()
    if (query) params.append('search', query)
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key].toString())
        }
      })
    }
    const response = await fetch(`${getAPIBaseURL()}/products?${params}`)
    if (!response.ok) throw new Error('Failed to search products')
    return response.json()
  },

  getByBarcode: async (barcode: string) => {
    const response = await fetch(`${getAPIBaseURL()}/products/barcode/${barcode}`)
    if (!response.ok) throw new Error('Product not found')
    return response.json()
  },

  getById: async (productId: string) => {
    const response = await fetch(`${getAPIBaseURL()}/products/${productId}`)
    if (!response.ok) throw new Error('Product not found')
    return response.json()
  },

  checkSafety: async (productId: string, allergies: string[]) => {
    const response = await fetch(`${getAPIBaseURL()}/products/check-safety/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allergies }),
    })
    if (!response.ok) throw new Error('Failed to check product safety')
    return response.json()
  },
}

// Meals API
export const mealsAPI = {
  getUserMeals: async (userId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/meals/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch meals')
    return response.json()
  },

  getMealsByDateRange: async (userId: string, startDate: string, endDate: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/meals/user/${userId}/range?startDate=${startDate}&endDate=${endDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch meals')
    return response.json()
  },

  createMeal: async (mealData: any) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/meals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mealData),
    })
    if (!response.ok) throw new Error('Failed to create meal')
    return response.json()
  },

  updateMeal: async (mealId: string, mealData: any) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/meals/${mealId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mealData),
    })
    if (!response.ok) throw new Error('Failed to update meal')
    return response.json()
  },

  deleteMeal: async (mealId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/meals/${mealId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to delete meal')
    return response.json()
  },

  getNutritionSummary: async (userId: string, date: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/meals/user/${userId}/nutrition/${date}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch nutrition summary')
    return response.json()
  },
}

// Recipes API
export const recipesAPI = {
  getAll: async (filters?: any) => {
    const params = new URLSearchParams(filters || {})
    const response = await fetch(`${getAPIBaseURL()}/recipes?${params}`)
    if (!response.ok) throw new Error('Failed to fetch recipes')
    return response.json()
  },

  getById: async (recipeId: string) => {
    const response = await fetch(`${getAPIBaseURL()}/recipes/${recipeId}`)
    if (!response.ok) throw new Error('Recipe not found')
    return response.json()
  },

  getSafeRecipes: async (userId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/recipes/safe/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch safe recipes')
    return response.json()
  },

  getRecommendations: async (userId: string, mealType?: string) => {
    const token = await getAuthToken()
    const params = new URLSearchParams()
    if (mealType) params.append('mealType', mealType)

    const response = await fetch(`${getAPIBaseURL()}/recipes/recommendations/${userId}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch recommendations')
    return response.json()
  },

  getMealPlan: async (userId: string, startDate?: string, endDate?: string) => {
    const token = await getAuthToken()
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await fetch(`${getAPIBaseURL()}/recipes/meal-plan/${userId}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch meal plan')
    return response.json()
  },

  generateShoppingList: async (recipeIds: string[]) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/recipes/generate-shopping-list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ recipeIds }),
    })
    if (!response.ok) throw new Error('Failed to generate shopping list')
    return response.json()
  },
}

// Analytics API
export const analyticsAPI = {
  getDashboard: async (userId: string, days = 7) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/analytics/dashboard/${userId}?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch dashboard analytics')
    return response.json()
  },

  getNutritionChart: async (userId: string, days = 7) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/analytics/nutrition-chart/${userId}?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch nutrition chart')
    return response.json()
  },
}

// Shopping Lists API
export const shoppingListsAPI = {
  getUserLists: async (userId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/shopping-lists/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch shopping lists')
    return response.json()
  },

  getList: async (listId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/shopping-lists/${listId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch shopping list')
    return response.json()
  },

  create: async (userId: string, name: string, description?: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/shopping-lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, name, description }),
    })
    if (!response.ok) throw new Error('Failed to create shopping list')
    return response.json()
  },

  addItem: async (listId: string, item: any) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/shopping-lists/${listId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(item),
    })
    if (!response.ok) throw new Error('Failed to add item')
    return response.json()
  },

  updateItem: async (listId: string, itemIndex: number, updates: any) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/shopping-lists/${listId}/items/${itemIndex}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    })
    if (!response.ok) throw new Error('Failed to update item')
    return response.json()
  },

  deleteItem: async (listId: string, itemIndex: number) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/shopping-lists/${listId}/items/${itemIndex}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to delete item')
    return response.json()
  },

  delete: async (listId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/shopping-lists/${listId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to delete shopping list')
    return response.json()
  },
}

// Shares API
export const sharesAPI = {
  create: async (data: {
    resourceId: string
    resourceType: 'shopping_list' | 'recipe' | 'meal_plan'
    isPublic?: boolean
    permissions?: { canView: boolean; canEdit: boolean; canCopy: boolean }
    expiresIn?: number
    userId: string
    userName: string
  }) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/shares`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create share')
    return response.json()
  },

  get: async (shareToken: string) => {
    const response = await fetch(`${getAPIBaseURL()}/shares/${shareToken}`)
    if (!response.ok) throw new Error('Failed to fetch shared resource')
    return response.json()
  },

  copy: async (shareToken: string, userId: string, userName: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/shares/${shareToken}/copy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, userName }),
    })
    if (!response.ok) throw new Error('Failed to copy shared resource')
    return response.json()
  },

  update: async (shareToken: string, items: any[], userId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/shares/${shareToken}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items, userId }),
    })
    if (!response.ok) throw new Error('Failed to update shared list')
    return response.json()
  },

  revoke: async (shareToken: string, userId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/shares/${shareToken}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    })
    if (!response.ok) throw new Error('Failed to revoke share')
    return response.json()
  },

  getUserShares: async (userId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/shares/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch user shares')
    return response.json()
  },
}

// Social API
export const socialAPI = {
  getFeed: async (userId?: string, page = 1, limit = 20, filter = 'all', tags?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      filter,
    })
    if (userId) params.append('userId', userId)
    if (tags) params.append('tags', tags)

    const response = await fetch(`${getAPIBaseURL()}/social/feed?${params}`)
    if (!response.ok) throw new Error('Failed to fetch feed')
    return response.json()
  },

  createPost: async (data: {
    userId: string
    userName: string
    userAvatar?: string
    type: 'recipe' | 'tip' | 'success_story' | 'meal_plan' | 'shopping_list'
    title: string
    content: string
    attachments?: any
    tags?: string[]
    visibility?: 'public' | 'followers' | 'private'
  }) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/social/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create post')
    return response.json()
  },

  getPost: async (postId: string, userId?: string) => {
    const params = userId ? `?userId=${userId}` : ''
    const response = await fetch(`${getAPIBaseURL()}/social/posts/${postId}${params}`)
    if (!response.ok) throw new Error('Failed to fetch post')
    return response.json()
  },

  likePost: async (postId: string, userId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/social/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    })
    if (!response.ok) throw new Error('Failed to like post')
    return response.json()
  },

  bookmarkPost: async (postId: string, userId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/social/posts/${postId}/bookmark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    })
    if (!response.ok) throw new Error('Failed to bookmark post')
    return response.json()
  },

  addComment: async (postId: string, userId: string, userName: string, content: string, userAvatar?: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/social/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, userName, content, userAvatar }),
    })
    if (!response.ok) throw new Error('Failed to add comment')
    return response.json()
  },

  deletePost: async (postId: string, userId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/social/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    })
    if (!response.ok) throw new Error('Failed to delete post')
    return response.json()
  },

  getUserPosts: async (userId: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    const response = await fetch(`${getAPIBaseURL()}/social/users/${userId}/posts?${params}`)
    if (!response.ok) throw new Error('Failed to fetch user posts')
    return response.json()
  },

  getBookmarks: async (userId: string, page = 1, limit = 20) => {
    const token = await getAuthToken()
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    const response = await fetch(`${getAPIBaseURL()}/social/users/${userId}/bookmarks?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch bookmarks')
    return response.json()
  },

  follow: async (followerId: string, followingId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/social/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ followerId, followingId }),
    })
    if (!response.ok) throw new Error('Failed to follow user')
    return response.json()
  },

  unfollow: async (followerId: string, followingId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/social/follow`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ followerId, followingId }),
    })
    if (!response.ok) throw new Error('Failed to unfollow user')
    return response.json()
  },

  getUserStats: async (userId: string, viewerId?: string) => {
    const params = viewerId ? `?viewerId=${viewerId}` : ''
    const response = await fetch(`${getAPIBaseURL()}/social/users/${userId}/stats${params}`)
    if (!response.ok) throw new Error('Failed to fetch user stats')
    return response.json()
  },
}

// Scanner API
export const scannerAPI = {
  scan: async (barcode: string, userId?: string) => {
    const response = await fetch(`${getAPIBaseURL()}/scanner/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ barcode, userId }),
    })
    if (!response.ok) throw new Error('Failed to scan product')
    return response.json()
  },

  addManual: async (barcode: string, productData: any, userId: string, region: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/scanner/add-manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ barcode, productData, userId, region }),
    })
    if (!response.ok) throw new Error('Failed to add manual product')
    return response.json()
  },
}

// Inventory API
export const inventoryAPI = {
  add: async (data: {
    userId: string
    productId?: string
    name: string
    barcode?: string
    category?: string
    brand?: string
    quantity: number
    unit?: string
    location?: string
    expirationDate?: string
    minThreshold?: number
    autoAddToList?: boolean
    allergens?: string[]
    nutritionInfo?: any
    notes?: string
  }) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to add inventory item')
    return response.json()
  },

  getAll: async (userId: string, filters?: { location?: string; category?: string; status?: string; search?: string }) => {
    const token = await getAuthToken()
    const params = new URLSearchParams()
    if (filters?.location) params.append('location', filters.location)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.search) params.append('search', filters.search)

    const response = await fetch(`${getAPIBaseURL()}/inventory/${userId}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch inventory')
    return response.json()
  },

  getItem: async (userId: string, itemId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/inventory/${userId}/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch item')
    return response.json()
  },

  update: async (itemId: string, updates: any) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/inventory/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    })
    if (!response.ok) throw new Error('Failed to update item')
    return response.json()
  },

  delete: async (itemId: string, userId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/inventory/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    })
    if (!response.ok) throw new Error('Failed to delete item')
    return response.json()
  },

  batchAdd: async (userId: string, items: any[]) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/inventory/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, items }),
    })
    if (!response.ok) throw new Error('Failed to batch add items')
    return response.json()
  },

  getExpiring: async (userId: string, days = 3) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/inventory/${userId}/expiring?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch expiring items')
    return response.json()
  },

  getExpired: async (userId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/inventory/${userId}/expired`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch expired items')
    return response.json()
  },

  getLowStock: async (userId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/inventory/${userId}/low-stock`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch low stock items')
    return response.json()
  },

  generateRestockList: async (userId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/inventory/${userId}/restock-list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) throw new Error('Failed to generate restock list')
    return response.json()
  },

  getStats: async (userId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/inventory/${userId}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch stats')
    return response.json()
  },

  scanBarcode: async (userId: string, barcode: string, quantity: number, location: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${getAPIBaseURL()}/inventory/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, barcode, quantity, location }),
    })
    if (!response.ok) throw new Error('Failed to scan item')
    return response.json()
  },
}
