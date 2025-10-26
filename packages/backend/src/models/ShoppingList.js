const mongoose = require('mongoose')

const shoppingListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: { type: Number, default: 1 },
    unit: String,
    checked: { type: Boolean, default: false },
    notes: String,
    addedAt: { type: Date, default: Date.now },
  }],
  store: String,
  budget: Number,
  totalSpent: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  completedAt: Date,
})

module.exports = mongoose.model('ShoppingList', shoppingListSchema)
