const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  upc: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  brand: String,
  category: String,
  nutrition: {
    servingSize: String,
    calories: Number,
    totalCarbs: Number,
    fiber: Number,
    sugar: Number,
    netCarbs: Number,
    protein: Number,
    fat: Number,
  },
  diabetesInfo: {
    glycemicIndex: Number,
    glycemicLoad: Number,
    carbQuality: String,
  },
  allergens: {
    contains: [String],
    mayContain: [String],
    processedIn: [String],
  },
  ingredients: [String],
  images: [String],
  stores: [{
    store: String,
    price: Number,
    available: Boolean,
    lastUpdated: Date,
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Product', productSchema)
