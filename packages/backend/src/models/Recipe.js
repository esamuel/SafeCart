const mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  mealType: {
    type: [String],
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  prepTime: Number, // minutes
  cookTime: Number, // minutes
  servings: { type: Number, default: 1 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },

  ingredients: [{
    name: String,
    quantity: Number,
    unit: String,
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    optional: { type: Boolean, default: false },
  }],

  instructions: [String],

  nutrition: {
    calories: Number,
    totalCarbs: Number,
    netCarbs: Number,
    fiber: Number,
    sugar: Number,
    protein: Number,
    fat: Number,
    glycemicIndex: Number,
    glycemicLoad: Number,
  },

  allergens: {
    contains: [String],
    mayContain: [String],
  },

  dietaryTags: [String], // e.g., 'Low GI', 'High Protein', 'Dairy-free', 'Gluten-free', 'Vegan'

  image: String,
  author: String,
  source: String,

  // Safety and recommendations
  diabetesFriendly: { type: Boolean, default: false },
  carbQuality: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor'] },

  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Index for efficient searching
recipeSchema.index({ name: 'text', description: 'text' })
recipeSchema.index({ mealType: 1 })
recipeSchema.index({ diabetesFriendly: 1 })
recipeSchema.index({ 'allergens.contains': 1 })

module.exports = mongoose.model('Recipe', recipeSchema)
