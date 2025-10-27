const express = require('express')
const router = express.Router()
const User = require('../models/User')
const ShoppingList = require('../models/ShoppingList')
const Meal = require('../models/Meal')
const Product = require('../models/Product')

// Get user dashboard analytics
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { days = 7 } = req.query // Default to last 7 days

    // Get user profile for allergens and carb limit
    const user = await User.findOne({ firebaseId: userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const healthProfile = user.healthProfiles?.[0] || {}
    const userAllergies = healthProfile.allergies || []
    const dailyCarbLimit = healthProfile.dailyCarbLimit || 200

    // Date range
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - parseInt(days))

    // Get shopping lists
    const shoppingLists = await ShoppingList.find({
      userId: user._id,
      createdAt: { $gte: daysAgo }
    })

    // Calculate shopping list stats
    let totalItems = 0
    let safeItems = 0
    let dangerousItems = 0

    for (const list of shoppingLists) {
      for (const item of list.items || []) {
        totalItems++

        // Check if item name matches any products in database
        const product = await Product.findOne({
          name: { $regex: new RegExp(item.name, 'i') }
        })

        if (product) {
          const allergens = product.allergens?.contains || []
          const hasDangerousAllergen = allergens.some(allergen =>
            userAllergies.some(userAllergy =>
              allergen.toLowerCase() === userAllergy.toLowerCase()
            )
          )

          if (hasDangerousAllergen) {
            dangerousItems++
          } else {
            safeItems++
          }
        } else {
          // Unknown product, assume safe
          safeItems++
        }
      }
    }

    // Get meals data (from Meal model or estimated from recipes)
    const meals = await Meal.find({
      userId: user._id,
      date: { $gte: daysAgo }
    })

    // Calculate nutrition summary
    let totalCarbs = 0
    let totalProtein = 0
    let totalCalories = 0
    let mealsCount = meals.length

    meals.forEach(meal => {
      if (meal.nutrition) {
        totalCarbs += meal.nutrition.carbs || 0
        totalProtein += meal.nutrition.protein || 0
        totalCalories += meal.nutrition.calories || 0
      }
    })

    // Calculate averages
    const avgDailyCarbs = mealsCount > 0 ? totalCarbs / parseInt(days) : 0
    const avgDailyProtein = mealsCount > 0 ? totalProtein / parseInt(days) : 0
    const avgDailyCalories = mealsCount > 0 ? totalCalories / parseInt(days) : 0

    // Calculate carb budget adherence
    const carbBudgetAdherence = dailyCarbLimit > 0
      ? Math.min(100, Math.round((1 - (avgDailyCarbs / dailyCarbLimit)) * 100))
      : 100

    // Allergen safety score
    const safetyScore = totalItems > 0
      ? Math.round((safeItems / totalItems) * 100)
      : 100

    // Calculate streak (consecutive days without dangerous items)
    let currentStreak = 0
    for (let i = 0; i < parseInt(days); i++) {
      const dayDate = new Date()
      dayDate.setDate(dayDate.getDate() - i)
      dayDate.setHours(0, 0, 0, 0)

      const nextDay = new Date(dayDate)
      nextDay.setDate(nextDay.getDate() + 1)

      const dayLists = await ShoppingList.find({
        userId: user._id,
        createdAt: {
          $gte: dayDate,
          $lt: nextDay
        }
      })

      let hasDangerousItem = false
      for (const list of dayLists) {
        for (const item of list.items || []) {
          const product = await Product.findOne({
            name: { $regex: new RegExp(item.name, 'i') }
          })

          if (product) {
            const allergens = product.allergens?.contains || []
            const isDangerous = allergens.some(allergen =>
              userAllergies.some(userAllergy =>
                allergen.toLowerCase() === userAllergy.toLowerCase()
              )
            )

            if (isDangerous) {
              hasDangerousItem = true
              break
            }
          }
        }
        if (hasDangerousItem) break
      }

      if (!hasDangerousItem && dayLists.length > 0) {
        currentStreak++
      } else if (dayLists.length > 0) {
        break
      }
    }

    // Build response
    const analytics = {
      summary: {
        totalItems,
        safeItems,
        dangerousItems,
        dangerousItemsAvoided: dangerousItems, // Items flagged and hopefully not purchased
        safetyScore,
        currentStreak,
      },
      nutrition: {
        avgDailyCarbs: Math.round(avgDailyCarbs),
        avgDailyProtein: Math.round(avgDailyProtein),
        avgDailyCalories: Math.round(avgDailyCalories),
        dailyCarbLimit,
        carbBudgetAdherence,
        mealsTracked: mealsCount,
      },
      shoppingLists: {
        totalLists: shoppingLists.length,
        totalItems,
        completedItems: shoppingLists.reduce((sum, list) =>
          sum + (list.items?.filter(item => item.checked).length || 0), 0
        ),
      },
      userProfile: {
        allergies: userAllergies,
        dailyCarbLimit,
      },
      period: {
        days: parseInt(days),
        startDate: daysAgo.toISOString(),
        endDate: new Date().toISOString(),
      }
    }

    // Generate insights
    const insights = []

    if (safetyScore === 100) {
      insights.push({
        type: 'success',
        message: `Perfect safety score! All ${totalItems} items are safe for you.`,
        icon: '✅'
      })
    } else if (dangerousItems > 0) {
      insights.push({
        type: 'warning',
        message: `${dangerousItems} dangerous items detected! Check allergen warnings carefully.`,
        icon: '⚠️'
      })
    }

    if (currentStreak >= 7) {
      insights.push({
        type: 'achievement',
        message: `Amazing! ${currentStreak}-day streak of allergen-safe shopping!`,
        icon: '🔥'
      })
    }

    if (carbBudgetAdherence >= 90) {
      insights.push({
        type: 'success',
        message: `Great carb control! You're staying within your budget.`,
        icon: '💪'
      })
    } else if (avgDailyCarbs > dailyCarbLimit) {
      insights.push({
        type: 'tip',
        message: `Consider reducing carbs by ${Math.round(avgDailyCarbs - dailyCarbLimit)}g per day.`,
        icon: '💡'
      })
    }

    if (mealsCount < parseInt(days) * 2) {
      insights.push({
        type: 'tip',
        message: 'Try the Meal Planner to get personalized diabetes-friendly recipes!',
        icon: '🍽️'
      })
    }

    analytics.insights = insights

    res.json(analytics)
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get weekly nutrition chart data
router.get('/nutrition-chart/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { days = 7 } = req.query

    const user = await User.findOne({ firebaseId: userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const chartData = []

    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const dayMeals = await Meal.find({
        userId: user._id,
        date: {
          $gte: date,
          $lt: nextDay
        }
      })

      let carbs = 0
      let protein = 0
      let calories = 0

      dayMeals.forEach(meal => {
        if (meal.nutrition) {
          carbs += meal.nutrition.carbs || 0
          protein += meal.nutrition.protein || 0
          calories += meal.nutrition.calories || 0
        }
      })

      chartData.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        carbs: Math.round(carbs),
        protein: Math.round(protein),
        calories: Math.round(calories),
        mealsCount: dayMeals.length
      })
    }

    res.json(chartData)
  } catch (error) {
    console.error('Chart data error:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
