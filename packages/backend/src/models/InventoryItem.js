const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },

  // Basic Info
  name: {
    type: String,
    required: true
  },
  barcode: {
    type: String,
    default: null
  },
  category: {
    type: String,
    default: 'Other'
  },
  brand: {
    type: String,
    default: null
  },

  // Quantity & Location
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    default: 'pieces'
  },
  location: {
    type: String,
    enum: ['pantry', 'fridge', 'freezer', 'other'],
    default: 'pantry'
  },

  // Dates
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  expirationDate: {
    type: Date,
    default: null
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },

  // Status Flags (computed dynamically)
  isLow: {
    type: Boolean,
    default: false
  },
  isExpiring: {
    type: Boolean,
    default: false
  },
  isExpired: {
    type: Boolean,
    default: false
  },

  // Auto-Restock Settings
  minThreshold: {
    type: Number,
    default: 1,
    min: 0
  },
  autoAddToList: {
    type: Boolean,
    default: false
  },

  // Nutrition & Safety
  allergens: [{
    type: String
  }],
  nutritionInfo: {
    calories: Number,
    carbs: Number,
    protein: Number,
    fat: Number,
    fiber: Number
  },

  // Metadata
  notes: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
inventoryItemSchema.index({ userId: 1, location: 1 });
inventoryItemSchema.index({ userId: 1, isExpiring: 1 });
inventoryItemSchema.index({ userId: 1, isLow: 1 });
inventoryItemSchema.index({ expirationDate: 1 });
inventoryItemSchema.index({ category: 1 });

// Virtual for days until expiration
inventoryItemSchema.virtual('daysUntilExpiration').get(function() {
  if (!this.expirationDate) return null;

  const now = new Date();
  const expDate = new Date(this.expirationDate);
  const diffTime = expDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
});

// Virtual for expiration status
inventoryItemSchema.virtual('expirationStatus').get(function() {
  const days = this.daysUntilExpiration;

  if (days === null) return 'no-date';
  if (days < 0) return 'expired';
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days <= 3) return 'soon';
  if (days <= 7) return 'week';
  return 'fresh';
});

// Method to update status flags
inventoryItemSchema.methods.updateStatusFlags = function() {
  const days = this.daysUntilExpiration;

  // Update expiration flags
  this.isExpired = days !== null && days < 0;
  this.isExpiring = days !== null && days >= 0 && days <= 3;

  // Update low stock flag
  this.isLow = this.quantity <= this.minThreshold;

  return this;
};

// Method to check if item should be restocked
inventoryItemSchema.methods.shouldRestock = function() {
  return this.isLow && !this.isExpired && this.autoAddToList;
};

// Static method to get expiring items for a user
inventoryItemSchema.statics.getExpiring = async function(userId, days = 3) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return await this.find({
    userId,
    expirationDate: {
      $gte: now,
      $lte: futureDate
    }
  }).sort({ expirationDate: 1 });
};

// Static method to get expired items
inventoryItemSchema.statics.getExpired = async function(userId) {
  const now = new Date();

  return await this.find({
    userId,
    expirationDate: { $lt: now }
  }).sort({ expirationDate: 1 });
};

// Static method to get low stock items
inventoryItemSchema.statics.getLowStock = async function(userId) {
  return await this.find({
    userId,
    isLow: true,
    isExpired: false
  }).sort({ quantity: 1 });
};

// Static method to get inventory statistics
inventoryItemSchema.statics.getStats = async function(userId) {
  const items = await this.find({ userId });

  const stats = {
    totalItems: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    expiringCount: items.filter(item => item.isExpiring).length,
    expiredCount: items.filter(item => item.isExpired).length,
    lowStockCount: items.filter(item => item.isLow).length,
    byLocation: {},
    byCategory: {}
  };

  // Group by location
  items.forEach(item => {
    if (!stats.byLocation[item.location]) {
      stats.byLocation[item.location] = { count: 0, items: [] };
    }
    stats.byLocation[item.location].count++;
    stats.byLocation[item.location].items.push(item._id);
  });

  // Group by category
  items.forEach(item => {
    if (!stats.byCategory[item.category]) {
      stats.byCategory[item.category] = { count: 0, items: [] };
    }
    stats.byCategory[item.category].count++;
    stats.byCategory[item.category].items.push(item._id);
  });

  return stats;
};

// Pre-save hook to update status flags
inventoryItemSchema.pre('save', function(next) {
  this.updateStatusFlags();
  this.lastUpdated = new Date();
  next();
});

// Ensure virtuals are included in JSON
inventoryItemSchema.set('toJSON', { virtuals: true });
inventoryItemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
