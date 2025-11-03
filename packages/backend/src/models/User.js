const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  firebaseId: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  name: String,
  displayName: String,
  age: Number,
  height: Number, // in cm
  weight: Number, // in kg
  profilePicture: String,
  healthProfiles: [{
    profileId: String,
    name: String,
    diabetesType: String,
    targetGlucoseMin: Number,
    targetGlucoseMax: Number,
    dailyCarbLimit: Number,
    usesInsulin: Boolean,
    allergies: [String],
    intolerances: [String],
    dietaryPreferences: [String],
  }],
  shoppingLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ShoppingList' }],
  savedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  preferences: {
    notifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
  },
  region: {
    type: String,
    enum: ['US', 'IL', 'MX', 'AR', 'CL', 'CO', 'ES', 'PE', 'VE', 'OTHER'],
    default: 'US'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('User', userSchema)
