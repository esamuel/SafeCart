const express = require('express')
const router = express.Router()
const Meal = require('../models/Meal')

// Get user's meals
router.get('/user/:userId', async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.params.userId })
      .populate('ingredients.productId')
      .sort({ date: -1 })
    res.json(meals)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get meals by date range
router.get('/user/:userId/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const meals = await Meal.find({
      userId: req.params.userId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).populate('ingredients.productId')
    res.json(meals)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create meal
router.post('/', async (req, res) => {
  try {
    const meal = new Meal(req.body)
    await meal.save()
    await meal.populate('ingredients.productId')
    res.status(201).json(meal)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update meal
router.put('/:id', async (req, res) => {
  try {
    const meal = await Meal.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('ingredients.productId')
    res.json(meal)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete meal
router.delete('/:id', async (req, res) => {
  try {
    await Meal.findByIdAndDelete(req.params.id)
    res.json({ message: 'Meal deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get nutrition summary for date
router.get('/user/:userId/nutrition/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date)
    const startOfDay = new Date(date.setHours(0, 0, 0, 0))
    const endOfDay = new Date(date.setHours(23, 59, 59, 999))

    const meals = await Meal.find({
      userId: req.params.userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    })

    const summary = {
      date: req.params.date,
      totalCalories: 0,
      totalCarbs: 0,
      totalProtein: 0,
      totalFat: 0,
      totalFiber: 0,
      totalSugar: 0,
      meals: meals.length,
    }

    meals.forEach(meal => {
      if (meal.nutrition) {
        summary.totalCalories += meal.nutrition.calories || 0
        summary.totalCarbs += meal.nutrition.carbs || 0
        summary.totalProtein += meal.nutrition.protein || 0
        summary.totalFat += meal.nutrition.fat || 0
        summary.totalFiber += meal.nutrition.fiber || 0
        summary.totalSugar += meal.nutrition.sugar || 0
      }
    })

    res.json(summary)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
