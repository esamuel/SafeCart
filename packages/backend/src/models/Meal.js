const mongoose = require('mongoose')

const mealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  date: Date,
  ingredients: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: Number,
    unit: String,
  }],
  nutrition: {
    calories: Number,
    carbs: Number,
    protein: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    netCarbs: Number,
    glycemicIndex: Number,
    glycemicLoad: Number,
  },
  allergens: [String],
  intolerances: [String],
  notes: String,
  rating: { type: Number, min: 1, max: 5 },
  bloodSugarImpact: {
    predicted: Number,
    actual: Number,
    recorded: Boolean,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Meal', mealSchema)
