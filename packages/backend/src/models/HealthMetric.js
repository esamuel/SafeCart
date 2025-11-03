const mongoose = require('mongoose')

const healthMetricSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },

  // Metric type
  type: {
    type: String,
    required: true,
    enum: ['glucose', 'meal', 'carbs', 'product_scan', 'weight', 'exercise']
  },

  // Timestamp
  timestamp: { type: Date, default: Date.now, index: true },

  // Glucose specific
  glucoseValue: Number, // mg/dL
  glucoseTiming: String, // fasting, before_meal, after_meal, bedtime

  // Meal specific
  mealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal' },
  mealType: String, // breakfast, lunch, dinner, snack

  // Nutrition data
  carbs: Number,
  protein: Number,
  fat: Number,
  calories: Number,

  // Product scan specific
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: String,
  isSafe: Boolean, // based on user's health profile

  // Notes and context
  notes: String,
  tags: [String],

  // Location context
  location: String, // home, restaurant, work, etc.

  // Metadata
  createdAt: { type: Date, default: Date.now },
})

// Compound indexes for efficient queries
healthMetricSchema.index({ userId: 1, timestamp: -1 })
healthMetricSchema.index({ userId: 1, type: 1, timestamp: -1 })

// Static methods for analytics

// Get glucose statistics for a date range
healthMetricSchema.statics.getGlucoseStats = async function(userId, startDate, endDate) {
  const metrics = await this.find({
    userId,
    type: 'glucose',
    timestamp: { $gte: startDate, $lte: endDate }
  }).sort({ timestamp: 1 })

  if (metrics.length === 0) {
    return {
      count: 0,
      average: 0,
      min: 0,
      max: 0,
      readings: []
    }
  }

  const values = metrics.map(m => m.glucoseValue)
  const sum = values.reduce((a, b) => a + b, 0)

  return {
    count: metrics.length,
    average: Math.round(sum / metrics.length),
    min: Math.min(...values),
    max: Math.max(...values),
    readings: metrics.map(m => ({
      value: m.glucoseValue,
      timing: m.glucoseTiming,
      timestamp: m.timestamp,
      notes: m.notes
    }))
  }
}

// Get daily carb intake
healthMetricSchema.statics.getDailyCarbIntake = async function(userId, date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const metrics = await this.find({
    userId,
    type: { $in: ['meal', 'carbs'] },
    timestamp: { $gte: startOfDay, $lte: endOfDay }
  })

  const totalCarbs = metrics.reduce((sum, m) => sum + (m.carbs || 0), 0)

  return {
    date,
    totalCarbs: Math.round(totalCarbs),
    meals: metrics.filter(m => m.type === 'meal').length
  }
}

// Get product scan statistics
healthMetricSchema.statics.getProductScanStats = async function(userId, startDate, endDate) {
  const scans = await this.find({
    userId,
    type: 'product_scan',
    timestamp: { $gte: startDate, $lte: endDate }
  })

  const totalScans = scans.length
  const safeScans = scans.filter(s => s.isSafe).length
  const unsafeScans = totalScans - safeScans

  return {
    totalScans,
    safeScans,
    unsafeScans,
    safetyScore: totalScans > 0 ? Math.round((safeScans / totalScans) * 100) : 0
  }
}

// Get weekly trends
healthMetricSchema.statics.getWeeklyTrends = async function(userId) {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const dailyData = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Get glucose average for the day
    const glucoseMetrics = await this.find({
      userId,
      type: 'glucose',
      timestamp: { $gte: startOfDay, $lte: endOfDay }
    })

    const avgGlucose = glucoseMetrics.length > 0
      ? Math.round(glucoseMetrics.reduce((sum, m) => sum + m.glucoseValue, 0) / glucoseMetrics.length)
      : null

    // Get total carbs for the day
    const carbMetrics = await this.find({
      userId,
      type: { $in: ['meal', 'carbs'] },
      timestamp: { $gte: startOfDay, $lte: endOfDay }
    })

    const totalCarbs = Math.round(carbMetrics.reduce((sum, m) => sum + (m.carbs || 0), 0))

    dailyData.push({
      date: date.toISOString().split('T')[0],
      avgGlucose,
      totalCarbs,
      mealsLogged: carbMetrics.filter(m => m.type === 'meal').length
    })
  }

  return dailyData
}

// Instance methods

// Check if glucose reading is in target range
healthMetricSchema.methods.isInTargetRange = function(targetMin, targetMax) {
  if (this.type !== 'glucose') return null
  return this.glucoseValue >= targetMin && this.glucoseValue <= targetMax
}

module.exports = mongoose.model('HealthMetric', healthMetricSchema)
