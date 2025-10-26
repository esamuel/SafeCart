require('dotenv').config()
const mongoose = require('mongoose')
const Product = require('../models/Product')

const sampleProducts = [
  {
    upc: '012345678901',
    name: 'Almond Milk',
    brand: 'Silk Original',
    category: 'Dairy Alternatives',
    nutrition: {
      servingSize: '1 cup (240ml)',
      calories: 30,
      totalCarbs: 1,
      fiber: 0,
      sugar: 0,
      netCarbs: 1,
      protein: 1,
      fat: 2.5,
    },
    diabetesInfo: {
      glycemicIndex: 25,
      glycemicLoad: 0,
      carbQuality: 'Excellent',
    },
    allergens: {
      contains: ['Tree nuts'],
      mayContain: [],
      processedIn: [],
    },
    ingredients: ['Filtered water', 'Almonds', 'Calcium carbonate', 'Sea salt', 'Potassium bicarbonate', 'Sunflower lecithin', 'Natural flavor', 'Vitamin A palmitate', 'Vitamin D2', 'Vitamin B12'],
    images: [],
    stores: [
      { store: 'Whole Foods', price: 3.99, available: true, lastUpdated: new Date() },
      { store: 'Trader Joe\'s', price: 2.99, available: true, lastUpdated: new Date() },
    ],
  },
  {
    upc: '012345678902',
    name: 'Whole Wheat Bread',
    brand: 'Dave\'s Killer Bread',
    category: 'Bakery',
    nutrition: {
      servingSize: '2 slices (56g)',
      calories: 160,
      totalCarbs: 28,
      fiber: 5,
      sugar: 3,
      netCarbs: 23,
      protein: 8,
      fat: 2.5,
    },
    diabetesInfo: {
      glycemicIndex: 71,
      glycemicLoad: 16,
      carbQuality: 'Good',
    },
    allergens: {
      contains: ['Wheat', 'Sesame'],
      mayContain: ['Tree nuts', 'Peanuts'],
      processedIn: [],
    },
    ingredients: ['Organic sprouted whole grain wheat', 'Water', 'Organic sprouted whole grain rye', 'Organic sprouted whole grain barley', 'Sea salt', 'Yeast', 'Organic sprouted whole grain spelt'],
    images: [],
    stores: [
      { store: 'Whole Foods', price: 5.99, available: true, lastUpdated: new Date() },
      { store: 'Kroger', price: 4.99, available: true, lastUpdated: new Date() },
    ],
  },
  {
    upc: '012345678903',
    name: 'Organic Peanut Butter',
    brand: 'Skippy Natural',
    category: 'Spreads',
    nutrition: {
      servingSize: '2 tbsp (32g)',
      calories: 190,
      totalCarbs: 7,
      fiber: 2,
      sugar: 1,
      netCarbs: 5,
      protein: 8,
      fat: 16,
    },
    diabetesInfo: {
      glycemicIndex: 14,
      glycemicLoad: 1,
      carbQuality: 'Excellent',
    },
    allergens: {
      contains: ['Peanuts'],
      mayContain: ['Tree nuts'],
      processedIn: [],
    },
    ingredients: ['Roasted peanuts', 'Sugar', 'Palm oil', 'Salt'],
    images: [],
    stores: [
      { store: 'Whole Foods', price: 4.99, available: true, lastUpdated: new Date() },
    ],
  },
  {
    upc: '012345678904',
    name: 'Coconut Yogurt',
    brand: 'So Delicious',
    category: 'Dairy Alternatives',
    nutrition: {
      servingSize: '1 cup (150g)',
      calories: 120,
      totalCarbs: 10,
      fiber: 0,
      sugar: 8,
      netCarbs: 10,
      protein: 2,
      fat: 5,
    },
    diabetesInfo: {
      glycemicIndex: 35,
      glycemicLoad: 3,
      carbQuality: 'Good',
    },
    allergens: {
      contains: ['Coconut'],
      mayContain: [],
      processedIn: [],
    },
    ingredients: ['Coconut milk', 'Water', 'Tapioca starch', 'Sugar', 'Pectin', 'Probiotics', 'Vitamin D2', 'Vitamin B12'],
    images: [],
    stores: [
      { store: 'Whole Foods', price: 3.49, available: true, lastUpdated: new Date() },
    ],
  },
  {
    upc: '012345678905',
    name: 'Gluten-Free Bread',
    brand: 'Canyon Bakehouse',
    category: 'Bakery',
    nutrition: {
      servingSize: '2 slices (60g)',
      calories: 180,
      totalCarbs: 32,
      fiber: 4,
      sugar: 2,
      netCarbs: 28,
      protein: 6,
      fat: 3,
    },
    diabetesInfo: {
      glycemicIndex: 65,
      glycemicLoad: 18,
      carbQuality: 'Fair',
    },
    allergens: {
      contains: ['Eggs', 'Soy'],
      mayContain: ['Tree nuts'],
      processedIn: [],
    },
    ingredients: ['Brown rice flour', 'Water', 'Tapioca starch', 'Eggs', 'Yeast', 'Sea salt', 'Xanthan gum'],
    images: [],
    stores: [
      { store: 'Whole Foods', price: 6.99, available: true, lastUpdated: new Date() },
    ],
  },
  {
    upc: '012345678906',
    name: 'Chickpea Pasta',
    brand: 'Banza',
    category: 'Pasta',
    nutrition: {
      servingSize: '2 oz (56g)',
      calories: 190,
      totalCarbs: 32,
      fiber: 8,
      sugar: 1,
      netCarbs: 24,
      protein: 14,
      fat: 3,
    },
    diabetesInfo: {
      glycemicIndex: 32,
      glycemicLoad: 8,
      carbQuality: 'Excellent',
    },
    allergens: {
      contains: [],
      mayContain: ['Wheat'],
      processedIn: [],
    },
    ingredients: ['Chickpea flour', 'Tapioca starch', 'Pea starch'],
    images: [],
    stores: [
      { store: 'Whole Foods', price: 2.99, available: true, lastUpdated: new Date() },
    ],
  },
  {
    upc: '012345678907',
    name: 'Wild Salmon Fillet',
    brand: 'Wild Caught',
    category: 'Seafood',
    nutrition: {
      servingSize: '3.5 oz (100g)',
      calories: 206,
      totalCarbs: 0,
      fiber: 0,
      sugar: 0,
      netCarbs: 0,
      protein: 22,
      fat: 13,
    },
    diabetesInfo: {
      glycemicIndex: 0,
      glycemicLoad: 0,
      carbQuality: 'Excellent',
    },
    allergens: {
      contains: ['Fish'],
      mayContain: [],
      processedIn: [],
    },
    ingredients: ['Wild salmon'],
    images: [],
    stores: [
      { store: 'Whole Foods', price: 12.99, available: true, lastUpdated: new Date() },
    ],
  },
  {
    upc: '012345678908',
    name: 'Organic Spinach',
    brand: 'Fresh Express',
    category: 'Produce',
    nutrition: {
      servingSize: '1 cup (30g)',
      calories: 7,
      totalCarbs: 1,
      fiber: 0.7,
      sugar: 0.1,
      netCarbs: 0.3,
      protein: 0.9,
      fat: 0.1,
    },
    diabetesInfo: {
      glycemicIndex: 15,
      glycemicLoad: 0,
      carbQuality: 'Excellent',
    },
    allergens: {
      contains: [],
      mayContain: [],
      processedIn: [],
    },
    ingredients: ['Organic spinach'],
    images: [],
    stores: [
      { store: 'Whole Foods', price: 2.99, available: true, lastUpdated: new Date() },
    ],
  },
]

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing products
    await Product.deleteMany({})
    console.log('Cleared existing products')

    // Insert sample products
    const result = await Product.insertMany(sampleProducts)
    console.log(`✅ Seeded ${result.length} products`)

    // Close connection
    await mongoose.connection.close()
    console.log('Connection closed')
  } catch (error) {
    console.error('Error seeding products:', error)
    process.exit(1)
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedProducts()
}

module.exports = seedProducts
