/**
 * Nutrition calculation utilities for diabetes management
 */

/**
 * Calculate Glycemic Load (GL) from Glycemic Index (GI) and carbs
 * GL = (GI × Carbs) / 100
 */
function calculateGlycemicLoad(gi, carbs) {
  if (!gi || !carbs) return 0
  return (gi * carbs) / 100
}

/**
 * Calculate net carbs (total carbs - fiber)
 */
function calculateNetCarbs(totalCarbs, fiber) {
  if (!totalCarbs) return 0
  const fiberAmount = fiber || 0
  return Math.max(0, totalCarbs - fiberAmount)
}

/**
 * Estimate blood sugar impact
 * Returns: low, moderate, high
 */
function estimateBloodSugarImpact(gi, gl, netCarbs) {
  if (!gi || !gl) return 'unknown'

  if (gl < 10) return 'low'
  if (gl < 20) return 'moderate'
  return 'high'
}

/**
 * Calculate carb ratio for insulin dosing
 * Typical ratios: 1:10 (1 unit per 10g carbs), 1:15, 1:20
 */
function calculateInsulinDose(carbs, carbRatio = 15) {
  if (!carbs) return 0
  return Math.round((carbs / carbRatio) * 10) / 10
}

/**
 * Get carb quality classification
 */
function getCarbQuality(gi) {
  if (!gi) return 'unknown'
  if (gi < 55) return 'low'
  if (gi < 70) return 'medium'
  return 'high'
}

/**
 * Calculate daily carb budget recommendation
 * Based on diabetes type and activity level
 */
function recommendDailyCarbBudget(diabetesType, activityLevel = 'moderate') {
  const budgets = {
    type1: { sedentary: 150, moderate: 200, active: 250 },
    type2: { sedentary: 120, moderate: 150, active: 180 },
    prediabetes: { sedentary: 130, moderate: 160, active: 200 },
  }

  return budgets[diabetesType]?.[activityLevel] || 150
}

/**
 * Check if meal fits daily carb budget
 */
function checkCarbBudget(mealCarbs, dailyBudget, consumedToday) {
  const remaining = dailyBudget - consumedToday
  return {
    fits: mealCarbs <= remaining,
    remaining,
    mealCarbs,
    percentOfBudget: Math.round((mealCarbs / dailyBudget) * 100),
  }
}

/**
 * Calculate nutrition per serving
 */
function calculatePerServing(nutrition, servings = 1) {
  if (!nutrition || servings <= 0) return nutrition

  return {
    calories: Math.round(nutrition.calories / servings),
    totalCarbs: Math.round((nutrition.totalCarbs / servings) * 10) / 10,
    fiber: Math.round((nutrition.fiber / servings) * 10) / 10,
    sugar: Math.round((nutrition.sugar / servings) * 10) / 10,
    netCarbs: Math.round((nutrition.netCarbs / servings) * 10) / 10,
    protein: Math.round((nutrition.protein / servings) * 10) / 10,
    fat: Math.round((nutrition.fat / servings) * 10) / 10,
  }
}

/**
 * Get nutrition recommendations
 */
function getNutritionRecommendations(nutrition, diabetesType) {
  const recommendations = []

  if (nutrition.sugar > 10) {
    recommendations.push('High sugar content - consider alternatives')
  }

  if (nutrition.netCarbs > 30) {
    recommendations.push('High carb content - monitor portion size')
  }

  if (nutrition.fiber < 3) {
    recommendations.push('Low fiber - pair with high-fiber foods')
  }

  if (nutrition.protein < 5) {
    recommendations.push('Low protein - consider adding protein source')
  }

  return recommendations
}

module.exports = {
  calculateGlycemicLoad,
  calculateNetCarbs,
  estimateBloodSugarImpact,
  calculateInsulinDose,
  getCarbQuality,
  recommendDailyCarbBudget,
  checkCarbBudget,
  calculatePerServing,
  getNutritionRecommendations,
}
