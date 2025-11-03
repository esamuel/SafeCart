'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { recipesAPI, shoppingListsAPI, usersAPI } from '@/lib/api'
import { auth } from '@/lib/firebase'
import { Calendar, Plus, Loader, CheckCircle2, AlertCircle, ShoppingCart, RefreshCw, ChefHat } from 'lucide-react'
import RecipeDetails from './RecipeDetails'

export default function MealPlanner() {
  const { t } = useTranslation('meals')
  const [mealPlan, setMealPlan] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [carbBudget, setCarbBudget] = useState(200)
  const [userAllergies, setUserAllergies] = useState<string[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)

  const user = auth.currentUser

  useEffect(() => {
    loadMealPlan()
  }, [])

  const loadMealPlan = async () => {
    if (!user) {
      setError(t('errors.loginRequired'))
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      // Load user profile first
      const profile = await usersAPI.getProfile(user.uid)
      if (profile.healthProfiles && profile.healthProfiles.length > 0) {
        setUserAllergies(profile.healthProfiles[0].allergies || [])
        setCarbBudget(profile.healthProfiles[0].dailyCarbLimit || 200)
      }

      // Load meal plan
      const response = await recipesAPI.getMealPlan(user.uid)
      setMealPlan(response.mealPlan)
    } catch (err: any) {
      console.error('Failed to load meal plan:', err)
      setError(err.message || t('errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleRecipeClick = async (recipeId: string) => {
    try {
      const recipe = await recipesAPI.getById(recipeId)
      setSelectedRecipe(recipe)
    } catch (err: any) {
      console.error('Failed to load recipe details:', err)
      alert(t('errors.recipeLoadFailed'))
    }
  }

  const handleGenerateShoppingList = async (recipe: any) => {
    if (!user) {
      alert(t('errors.loginRequiredAddToList'))
      return
    }

    try {
      const shoppingListData = await recipesAPI.generateShoppingList([recipe._id])

      // Get user's shopping lists
      const lists = await shoppingListsAPI.getUserLists(user.uid)

      let targetList: any

      if (lists.length === 0) {
        // Create a new list
        targetList = await shoppingListsAPI.create(
          user.uid,
          t('shopping.newListName') + ' ' + new Date().toLocaleDateString(),
          t('shopping.newListDescription')
        )
      } else {
        // Use first list
        targetList = lists[0]
      }

      // Add ingredients to shopping list
      for (const ingredient of shoppingListData.shoppingList) {
        await shoppingListsAPI.addItem(targetList._id, {
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit || 'unit',
        })
      }

      alert(t('shopping.itemsAddedSuccess', { count: shoppingListData.totalItems }))
      setSelectedRecipe(null)
    } catch (err: any) {
      alert(t('shopping.itemsAddedError', { message: err.message }))
      console.error(err)
    }
  }

  const generateShoppingList = async () => {
    if (!user) {
      alert(t('shopping.loginRequiredGenerate'))
      return
    }

    setGenerating(true)

    try {
      // Collect all recipe IDs from the meal plan
      const recipeIds: string[] = []

      mealPlan.forEach(day => {
        if (day.meals.breakfast?._id) recipeIds.push(day.meals.breakfast._id)
        if (day.meals.lunch?._id) recipeIds.push(day.meals.lunch._id)
        if (day.meals.dinner?._id) recipeIds.push(day.meals.dinner._id)
        if (day.meals.snack?._id) recipeIds.push(day.meals.snack._id)
      })

      if (recipeIds.length === 0) {
        alert(t('errors.noRecipesFound'))
        return
      }

      // Generate shopping list from recipes
      const shoppingListData = await recipesAPI.generateShoppingList(recipeIds)

      // Get user's shopping lists
      const lists = await shoppingListsAPI.getUserLists(user.uid)

      let targetList: any

      if (lists.length === 0) {
        // Create a new list
        targetList = await shoppingListsAPI.create(
          user.uid,
          t('shopping.weeklyMealPlanName') + ' ' + new Date().toLocaleDateString(),
          t('shopping.weeklyMealPlanDescription')
        )
      } else {
        // Use first list
        targetList = lists[0]
      }

      // Add ingredients to shopping list
      for (const ingredient of shoppingListData.shoppingList) {
        await shoppingListsAPI.addItem(targetList._id, {
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit || 'unit',
        })
      }

      alert(t('shopping.itemsAddedSuccess', { count: shoppingListData.totalItems }))
    } catch (err: any) {
      alert(t('shopping.generateError', { message: err.message }))
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  // Helper functions
  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return '🍳'
      case 'lunch':
        return '🥗'
      case 'dinner':
        return '🍽️'
      case 'snack':
        return '🍎'
      default:
        return '🍴'
    }
  }

  const getMealTypeName = (mealType: string) => {
    const mealTypes: { [key: string]: string } = {
      breakfast: t('mealPlan.mealTypes.breakfast'),
      lunch: t('mealPlan.mealTypes.lunch'),
      dinner: t('mealPlan.mealTypes.dinner'),
      snack: t('mealPlan.mealTypes.snack'),
    }
    return mealTypes[mealType] || mealType.charAt(0).toUpperCase() + mealType.slice(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold mb-2">{t('errors.loadTitle')}</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadMealPlan}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            {t('common:buttons.retry', { defaultValue: 'Try Again' })}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Recipe Details Modal */}
      {selectedRecipe && (
        <RecipeDetails
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onGenerateShoppingList={handleGenerateShoppingList}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">{t('title')}</h2>
            <p className="text-gray-600">{t('subtitle')}</p>
          </div>
          <button
            onClick={loadMealPlan}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t('refresh')}
          </button>
        </div>

      {/* Carb Budget Summary */}
      {mealPlan.length > 0 && mealPlan[0].dailyNutrition && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-2xl mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-1">{t('mealPlan.carbBudget')}</div>
              <div className="text-3xl font-bold">{carbBudget}g</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90 mb-1">{t('mealPlan.avgPerMeal')}</div>
              <div className="text-3xl font-bold">{Math.round(carbBudget / 3)}g</div>
            </div>
          </div>
        </div>
      )}

      {/* Week View */}
      <div className="space-y-8">
        {mealPlan.map((day: any, dayIdx: number) => (
          <div key={dayIdx} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Day Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{day.dayOfWeek}</h3>
                  <p className="text-sm opacity-90">{new Date(day.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-90">{t('mealPlan.totalCarbs')}</div>
                  <div className="text-2xl font-bold">{day.dailyNutrition?.totalCarbs || 0}g</div>
                  <div className="text-xs opacity-75">{t('mealPlan.percentOfLimit', { percent: day.dailyNutrition?.percentOfLimit || 0 })}</div>
                </div>
              </div>
            </div>

            {/* Meals */}
            <div className="p-4 space-y-3">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                const meal = day.meals[mealType]
                if (!meal) return null

                return (
                  <div
                    key={mealType}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => meal._id && handleRecipeClick(meal._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getMealIcon(mealType)}</span>
                          <div>
                            <div className="text-sm text-gray-500 font-medium">
                              {getMealTypeName(mealType)}
                            </div>
                            <div className="text-lg font-bold text-gray-900">{meal.name}</div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {meal.dietaryTags?.slice(0, 3).map((tag: string, tagIdx: number) => (
                            <span
                              key={tagIdx}
                              className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Time & Difficulty */}
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span>⏱️ {meal.prepTime + meal.cookTime} {t('recipes.details.minutes', { defaultValue: 'minutes' })}</span>
                          <span>👨‍🍳 {meal.difficulty}</span>
                          <span>🍽️ {t('mealPlan.servings', { count: meal.servings })}</span>
                        </div>
                      </div>

                      {/* Nutrition Info */}
                      <div className="text-right ml-4">
                        <div className="text-sm font-semibold text-purple-600">{t('recipes.details.carbs', { defaultValue: 'Carbs' })}</div>
                        <div className="text-3xl font-bold text-purple-600">
                          {meal.nutrition?.netCarbs || 0}g
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {meal.nutrition?.calories || 0} {t('recipes.details.calories', { defaultValue: 'cal' })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {meal.nutrition?.protein || 0}g {t('recipes.details.protein', { defaultValue: 'protein' })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Generate Shopping List Button */}
      <button
        onClick={generateShoppingList}
        disabled={generating || mealPlan.length === 0}
        className="mt-8 w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl flex items-center justify-center gap-2 transition font-semibold text-lg shadow-lg"
      >
        {generating ? (
          <>
            <Loader className="w-6 h-6 animate-spin" />
            {t('shopping.generating')}
          </>
        ) : (
          <>
            <ShoppingCart className="w-6 h-6" />
            {t('shopping.generateList')}
          </>
        )}
      </button>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-blue-900 mb-2">{t('personalizedPlan.title')}</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ {t('personalizedPlan.allergensFiltered', { allergens: userAllergies.join(', ') || t('personalizedPlan.none') })}</li>
              <li>✓ {t('personalizedPlan.carbBudget', { budget: carbBudget })}</li>
              <li>✓ {t('personalizedPlan.daysPlanned', { days: mealPlan.length })}</li>
              <li>✓ {t('personalizedPlan.smartRecipes')}</li>
              <li>✓ {t('personalizedPlan.autoGenerate')}</li>
            </ul>
          </div>
          </div>
        </div>
      </div>
    </>
    )
  }
