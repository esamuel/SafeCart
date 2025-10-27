import { auth } from './firebase'

// Determine API URL based on environment
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser environment - use localhost with correct port
    return 'http://localhost:5002/api'
  }
  // Server environment
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api'
}

const API_BASE_URL = getApiUrl()

// Get Firebase token
async function getAuthToken() {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')
  return await user.getIdToken()
}

// Auth API
export const authAPI = {
  verify: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
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
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch profile')
    return response.json()
  },

  saveHealthProfile: async (userId: string, data: any) => {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE_URL}/users/${userId}/health-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to save health profile')
    return response.json()
  },

  updatePreferences: async (userId: string, preferences: any) => {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE_URL}/users/${userId}/preferences`, {
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
    const response = await fetch(`${API_BASE_URL}/products?${params}`)
    if (!response.ok) throw new Error('Failed to search products')
    return response.json()
  },

  getByBarcode: async (barcode: string) => {
    const response = await fetch(`${API_BASE_URL}/products/barcode/${barcode}`)
    if (!response.ok) throw new Error('Product not found')
    return response.json()
  },

  getById: async (productId: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`)
    if (!response.ok) throw new Error('Product not found')
    return response.json()
  },

  checkSafety: async (productId: string, allergies: string[]) => {
    const response = await fetch(`${API_BASE_URL}/products/check-safety/${productId}`, {
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
    const response = await fetch(`${API_BASE_URL}/meals/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch meals')
    return response.json()
  },

  getMealsByDateRange: async (userId: string, startDate: string, endDate: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE_URL}/meals/user/${userId}/range?startDate=${startDate}&endDate=${endDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch meals')
    return response.json()
  },

  createMeal: async (mealData: any) => {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE_URL}/meals`, {
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
    const response = await fetch(`${API_BASE_URL}/meals/${mealId}`, {
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
    const response = await fetch(`${API_BASE_URL}/meals/${mealId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to delete meal')
    return response.json()
  },

  getNutritionSummary: async (userId: string, date: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE_URL}/meals/user/${userId}/nutrition/${date}`, {
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
    const response = await fetch(`${API_BASE_URL}/recipes?${params}`)
    if (!response.ok) throw new Error('Failed to fetch recipes')
    return response.json()
  },

  getById: async (recipeId: string) => {
    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`)
    if (!response.ok) throw new Error('Recipe not found')
    return response.json()
  },

  getSafeRecipes: async (userId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE_URL}/recipes/safe/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch safe recipes')
    return response.json()
  },

  getRecommendations: async (userId: string, mealType?: string) => {
    const token = await getAuthToken()
    const params = new URLSearchParams()
    if (mealType) params.append('mealType', mealType)

    const response = await fetch(`${API_BASE_URL}/recipes/recommendations/${userId}?${params}`, {
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

    const response = await fetch(`${API_BASE_URL}/recipes/meal-plan/${userId}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch meal plan')
    return response.json()
  },

  generateShoppingList: async (recipeIds: string[]) => {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE_URL}/recipes/generate-shopping-list`, {
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

// Shopping Lists API
export const shoppingListsAPI = {
  getUserLists: async (userId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE_URL}/shopping-lists/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch shopping lists')
    return response.json()
  },

  getList: async (listId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE_URL}/shopping-lists/${listId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch shopping list')
    return response.json()
  },

  create: async (userId: string, name: string, description?: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE_URL}/shopping-lists`, {
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
    const response = await fetch(`${API_BASE_URL}/shopping-lists/${listId}/items`, {
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
    const response = await fetch(`${API_BASE_URL}/shopping-lists/${listId}/items/${itemIndex}`, {
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
    const response = await fetch(`${API_BASE_URL}/shopping-lists/${listId}/items/${itemIndex}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to delete item')
    return response.json()
  },

  delete: async (listId: string) => {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE_URL}/shopping-lists/${listId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to delete shopping list')
    return response.json()
  },
}
