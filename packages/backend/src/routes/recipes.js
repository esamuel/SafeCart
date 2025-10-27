const express = require('express')
const router = express.Router()
const Recipe = require('../models/Recipe')
const User = require('../models/User')

// Get all recipes with filters
router.get('/', async (req, res) => {
  try {
    const { search, mealType, maxCarbs, difficulty } = req.query
    let query = {}

    if (search) {
      query.$text = { $search: search }
    }

    if (mealType) {
      query.mealType = mealType
    }

    if (maxCarbs) {
      query['nutrition.netCarbs'] = { $lte: parseInt(maxCarbs) }
    }

    if (difficulty) {
      query.difficulty = difficulty
    }

    const recipes = await Recipe.find(query).limit(50)
    res.json(recipes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' })
    }
    res.json(recipe)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get safe recipes for user (filtered by allergies)
router.get('/safe/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseId: req.params.userId })
    if (!user || !user.healthProfiles || user.healthProfiles.length === 0) {
      // No allergies, return all recipes
      const recipes = await Recipe.find({ diabetesFriendly: true }).limit(50)
      return res.json(recipes)
    }

    const userAllergies = user.healthProfiles[0].allergies || []
    const maxCarbs = user.healthProfiles[0].dailyCarbLimit || 300

    // Find recipes that don't contain user's allergens
    const safeRecipes = await Recipe.find({
      diabetesFriendly: true,
      'allergens.contains': { $nin: userAllergies },
      'nutrition.netCarbs': { $lte: maxCarbs / 3 }, // Per meal budget
    }).limit(50)

    res.json(safeRecipes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get smart recipe recommendations for user
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { mealType, date } = req.query

    const user = await User.findOne({ firebaseId: req.params.userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const healthProfile = user.healthProfiles?.[0] || {}
    const userAllergies = healthProfile.allergies || []
    const dailyCarbLimit = healthProfile.dailyCarbLimit || 200
    const perMealCarbLimit = dailyCarbLimit / 3 // Divide by 3 meals

    // Build query for safe recipes
    let query = {
      diabetesFriendly: true,
      'allergens.contains': { $nin: userAllergies },
      'nutrition.netCarbs': { $lte: perMealCarbLimit },
    }

    // Filter by meal type if specified
    if (mealType) {
      query.mealType = mealType
    }

    // Find recipes with excellent or good carb quality
    query.carbQuality = { $in: ['Excellent', 'Good'] }

    const recommendations = await Recipe.find(query)
      .sort({ 'ratings.average': -1, 'nutrition.netCarbs': 1 }) // Highest rated, lowest carbs
      .limit(10)

    // Calculate safety scores
    const scoredRecipes = recommendations.map(recipe => {
      let score = recipe.ratings.average * 20 // Max 100 from ratings

      // Bonus for low glycemic load
      if (recipe.nutrition.glycemicLoad <= 5) score += 10
      else if (recipe.nutrition.glycemicLoad <= 10) score += 5

      // Bonus for high protein
      if (recipe.nutrition.protein >= 20) score += 10
      else if (recipe.nutrition.protein >= 15) score += 5

      // Bonus for low net carbs
      if (recipe.nutrition.netCarbs <= 10) score += 10
      else if (recipe.nutrition.netCarbs <= 20) score += 5

      // Bonus for excellent carb quality
      if (recipe.carbQuality === 'Excellent') score += 10
      else if (recipe.carbQuality === 'Good') score += 5

      return {
        ...recipe.toObject(),
        recommendationScore: Math.min(score, 100), // Cap at 100
      }
    })

    // Sort by recommendation score
    scoredRecipes.sort((a, b) => b.recommendationScore - a.recommendationScore)

    res.json({
      recommendations: scoredRecipes,
      userProfile: {
        allergies: userAllergies,
        dailyCarbLimit,
        perMealCarbLimit: Math.round(perMealCarbLimit),
      },
      appliedFilters: {
        diabetesFriendly: true,
        allergensFree: userAllergies,
        maxNetCarbsPerMeal: Math.round(perMealCarbLimit),
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get meal plan for week
router.get('/meal-plan/:userId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const user = await User.findOne({ firebaseId: req.params.userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const healthProfile = user.healthProfiles?.[0] || {}
    const userAllergies = healthProfile.allergies || []
    const dailyCarbLimit = healthProfile.dailyCarbLimit || 200

    // Generate a week's worth of meals
    const days = 7
    const mealPlan = []

    for (let day = 0; day < days; day++) {
      const date = new Date()
      date.setDate(date.getDate() + day)

      // Get recommendations for each meal type
      const breakfast = await Recipe.findOne({
        diabetesFriendly: true,
        mealType: 'breakfast',
        'allergens.contains': { $nin: userAllergies },
        'nutrition.netCarbs': { $lte: dailyCarbLimit / 4 },
      }).sort({ 'ratings.average': -1 })

      const lunch = await Recipe.findOne({
        diabetesFriendly: true,
        mealType: 'lunch',
        'allergens.contains': { $nin: userAllergies },
        'nutrition.netCarbs': { $lte: dailyCarbLimit / 3 },
      }).sort({ 'ratings.average': -1 })

      const dinner = await Recipe.findOne({
        diabetesFriendly: true,
        mealType: 'dinner',
        'allergens.contains': { $nin: userAllergies },
        'nutrition.netCarbs': { $lte: dailyCarbLimit / 3 },
      }).sort({ 'ratings.average': -1 })

      const snack = await Recipe.findOne({
        diabetesFriendly: true,
        mealType: 'snack',
        'allergens.contains': { $nin: userAllergies },
        'nutrition.netCarbs': { $lte: 15 },
      }).sort({ 'ratings.average': -1 })

      const totalCarbs =
        (breakfast?.nutrition.netCarbs || 0) +
        (lunch?.nutrition.netCarbs || 0) +
        (dinner?.nutrition.netCarbs || 0) +
        (snack?.nutrition.netCarbs || 0)

      mealPlan.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
        meals: {
          breakfast,
          lunch,
          dinner,
          snack,
        },
        dailyNutrition: {
          totalCarbs: Math.round(totalCarbs),
          remainingCarbs: Math.round(dailyCarbLimit - totalCarbs),
          percentOfLimit: Math.round((totalCarbs / dailyCarbLimit) * 100),
        },
      })
    }

    res.json({
      mealPlan,
      userProfile: {
        allergies: userAllergies,
        dailyCarbLimit,
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get shopping list from recipes
router.post('/generate-shopping-list', async (req, res) => {
  try {
    const { recipeIds } = req.body

    if (!recipeIds || !Array.isArray(recipeIds)) {
      return res.status(400).json({ error: 'recipeIds array is required' })
    }

    const recipes = await Recipe.find({ _id: { $in: recipeIds } })

    // Aggregate ingredients
    const ingredientMap = new Map()

    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const key = ingredient.name.toLowerCase()
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)
          existing.quantity += ingredient.quantity
        } else {
          ingredientMap.set(key, {
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            productId: ingredient.productId,
          })
        }
      })
    })

    const shoppingList = Array.from(ingredientMap.values())

    res.json({
      recipes: recipes.map(r => ({ id: r._id, name: r.name })),
      shoppingList,
      totalItems: shoppingList.length,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create recipe (admin only - for future use)
router.post('/', async (req, res) => {
  try {
    const recipe = new Recipe(req.body)
    await recipe.save()
    res.status(201).json(recipe)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update recipe
router.put('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    )
    res.json(recipe)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete recipe
router.delete('/:id', async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id)
    res.json({ message: 'Recipe deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
