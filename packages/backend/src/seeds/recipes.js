require('dotenv').config()
const mongoose = require('mongoose')
const Recipe = require('../models/Recipe')

const recipes = [
  // BREAKFAST RECIPES
  {
    name: 'Veggie Omelet with Spinach',
    description: 'Protein-packed omelet with fresh vegetables, perfect for diabetics',
    mealType: ['breakfast'],
    prepTime: 5,
    cookTime: 10,
    servings: 1,
    difficulty: 'easy',
    ingredients: [
      { name: 'Eggs', quantity: 2, unit: 'whole' },
      { name: 'Organic Spinach', quantity: 1, unit: 'cup' },
      { name: 'Bell Pepper', quantity: 0.25, unit: 'cup' },
      { name: 'Onion', quantity: 2, unit: 'tbsp' },
      { name: 'Olive Oil', quantity: 1, unit: 'tsp' },
    ],
    instructions: [
      'Heat olive oil in a non-stick pan over medium heat',
      'Sauté onions and bell peppers for 2-3 minutes',
      'Add spinach and cook until wilted',
      'Whisk eggs in a bowl and pour over vegetables',
      'Cook for 3-4 minutes until set, fold in half and serve',
    ],
    nutrition: {
      calories: 220,
      totalCarbs: 8,
      netCarbs: 6,
      fiber: 2,
      sugar: 3,
      protein: 15,
      fat: 14,
      glycemicIndex: 28,
      glycemicLoad: 2,
    },
    allergens: {
      contains: ['Eggs'],
      mayContain: [],
    },
    dietaryTags: ['Low GI', 'High Protein', 'Gluten-free', 'Dairy-free', 'Keto-friendly'],
    diabetesFriendly: true,
    carbQuality: 'Excellent',
    ratings: { average: 4.5, count: 128 },
  },
  {
    name: 'Almond Flour Pancakes',
    description: 'Fluffy low-carb pancakes made with almond flour',
    mealType: ['breakfast'],
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    difficulty: 'easy',
    ingredients: [
      { name: 'Almond Flour', quantity: 1, unit: 'cup' },
      { name: 'Eggs', quantity: 2, unit: 'whole' },
      { name: 'Almond Milk', quantity: 0.25, unit: 'cup' },
      { name: 'Baking Powder', quantity: 1, unit: 'tsp' },
      { name: 'Vanilla Extract', quantity: 0.5, unit: 'tsp' },
      { name: 'Stevia', quantity: 1, unit: 'tbsp', optional: true },
    ],
    instructions: [
      'Mix almond flour and baking powder in a bowl',
      'In another bowl, whisk eggs, almond milk, and vanilla',
      'Combine wet and dry ingredients',
      'Heat a non-stick pan over medium heat',
      'Pour 1/4 cup batter per pancake',
      'Cook 2-3 minutes per side until golden',
    ],
    nutrition: {
      calories: 180,
      totalCarbs: 8,
      netCarbs: 4,
      fiber: 4,
      sugar: 1,
      protein: 9,
      fat: 14,
      glycemicIndex: 35,
      glycemicLoad: 1,
    },
    allergens: {
      contains: ['Tree nuts', 'Eggs'],
      mayContain: [],
    },
    dietaryTags: ['Low GI', 'Gluten-free', 'Low Carb'],
    diabetesFriendly: true,
    carbQuality: 'Excellent',
    ratings: { average: 4.7, count: 256 },
  },
  {
    name: 'Greek Yogurt Parfait',
    description: 'Protein-rich parfait with berries and nuts',
    mealType: ['breakfast', 'snack'],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: 'easy',
    ingredients: [
      { name: 'Greek Yogurt', quantity: 1, unit: 'cup' },
      { name: 'Mixed Berries', quantity: 0.5, unit: 'cup' },
      { name: 'Walnuts', quantity: 2, unit: 'tbsp' },
      { name: 'Chia Seeds', quantity: 1, unit: 'tbsp' },
      { name: 'Cinnamon', quantity: 0.5, unit: 'tsp' },
    ],
    instructions: [
      'Layer Greek yogurt in a glass or bowl',
      'Add mixed berries on top',
      'Sprinkle with walnuts and chia seeds',
      'Dust with cinnamon and serve',
    ],
    nutrition: {
      calories: 280,
      totalCarbs: 18,
      netCarbs: 12,
      fiber: 6,
      sugar: 10,
      protein: 20,
      fat: 15,
      glycemicIndex: 38,
      glycemicLoad: 5,
    },
    allergens: {
      contains: ['Dairy', 'Tree nuts'],
      mayContain: [],
    },
    dietaryTags: ['High Protein', 'Probiotic', 'Gluten-free'],
    diabetesFriendly: true,
    carbQuality: 'Good',
    ratings: { average: 4.6, count: 189 },
  },

  // LUNCH RECIPES
  {
    name: 'Quinoa Power Bowl',
    description: 'Nutrient-dense bowl with quinoa, vegetables, and tahini dressing',
    mealType: ['lunch', 'dinner'],
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    difficulty: 'medium',
    ingredients: [
      { name: 'Quinoa', quantity: 1, unit: 'cup' },
      { name: 'Chickpeas', quantity: 1, unit: 'cup' },
      { name: 'Kale', quantity: 2, unit: 'cups' },
      { name: 'Cherry Tomatoes', quantity: 1, unit: 'cup' },
      { name: 'Cucumber', quantity: 0.5, unit: 'cup' },
      { name: 'Avocado', quantity: 0.5, unit: 'whole' },
      { name: 'Tahini', quantity: 2, unit: 'tbsp' },
      { name: 'Lemon Juice', quantity: 2, unit: 'tbsp' },
    ],
    instructions: [
      'Cook quinoa according to package directions',
      'Massage kale with a bit of olive oil to soften',
      'Arrange quinoa, chickpeas, kale, tomatoes, and cucumber in bowls',
      'Top with avocado slices',
      'Whisk tahini and lemon juice with water to make dressing',
      'Drizzle dressing over bowls and serve',
    ],
    nutrition: {
      calories: 450,
      totalCarbs: 52,
      netCarbs: 38,
      fiber: 14,
      sugar: 6,
      protein: 16,
      fat: 18,
      glycemicIndex: 45,
      glycemicLoad: 17,
    },
    allergens: {
      contains: ['Sesame'],
      mayContain: [],
    },
    dietaryTags: ['Vegan', 'High Fiber', 'Balanced', 'Dairy-free', 'Gluten-free'],
    diabetesFriendly: true,
    carbQuality: 'Good',
    ratings: { average: 4.8, count: 342 },
  },
  {
    name: 'Turkey Lettuce Wraps',
    description: 'Low-carb wraps with seasoned turkey and fresh veggies',
    mealType: ['lunch'],
    prepTime: 10,
    cookTime: 10,
    servings: 2,
    difficulty: 'easy',
    ingredients: [
      { name: 'Ground Turkey', quantity: 8, unit: 'oz' },
      { name: 'Romaine Lettuce', quantity: 8, unit: 'leaves' },
      { name: 'Bell Pepper', quantity: 0.5, unit: 'cup' },
      { name: 'Water Chestnuts', quantity: 0.25, unit: 'cup' },
      { name: 'Green Onions', quantity: 2, unit: 'stalks' },
      { name: 'Ginger', quantity: 1, unit: 'tsp' },
      { name: 'Garlic', quantity: 2, unit: 'cloves' },
      { name: 'Coconut Aminos', quantity: 2, unit: 'tbsp' },
    ],
    instructions: [
      'Brown ground turkey in a skillet over medium-high heat',
      'Add garlic and ginger, cook for 1 minute',
      'Add bell pepper and water chestnuts, stir-fry for 3-4 minutes',
      'Add coconut aminos and green onions',
      'Spoon mixture into lettuce leaves and serve',
    ],
    nutrition: {
      calories: 220,
      totalCarbs: 10,
      netCarbs: 7,
      fiber: 3,
      sugar: 4,
      protein: 28,
      fat: 7,
      glycemicIndex: 32,
      glycemicLoad: 2,
    },
    allergens: {
      contains: [],
      mayContain: [],
    },
    dietaryTags: ['Low Carb', 'High Protein', 'Dairy-free', 'Gluten-free', 'Paleo'],
    diabetesFriendly: true,
    carbQuality: 'Excellent',
    ratings: { average: 4.7, count: 221 },
  },
  {
    name: 'Mediterranean Chickpea Salad',
    description: 'Fresh salad with chickpeas, feta, and lemon dressing',
    mealType: ['lunch'],
    prepTime: 15,
    cookTime: 0,
    servings: 2,
    difficulty: 'easy',
    ingredients: [
      { name: 'Chickpeas', quantity: 1.5, unit: 'cups' },
      { name: 'Cucumber', quantity: 1, unit: 'cup' },
      { name: 'Cherry Tomatoes', quantity: 1, unit: 'cup' },
      { name: 'Red Onion', quantity: 0.25, unit: 'cup' },
      { name: 'Kalamata Olives', quantity: 0.25, unit: 'cup' },
      { name: 'Feta Cheese', quantity: 0.5, unit: 'cup' },
      { name: 'Olive Oil', quantity: 3, unit: 'tbsp' },
      { name: 'Lemon Juice', quantity: 2, unit: 'tbsp' },
    ],
    instructions: [
      'Combine chickpeas, cucumber, tomatoes, onion, and olives in a bowl',
      'Crumble feta cheese over the salad',
      'Whisk olive oil and lemon juice together',
      'Pour dressing over salad and toss gently',
      'Chill for 10 minutes before serving',
    ],
    nutrition: {
      calories: 380,
      totalCarbs: 32,
      netCarbs: 24,
      fiber: 8,
      sugar: 6,
      protein: 14,
      fat: 22,
      glycemicIndex: 42,
      glycemicLoad: 10,
    },
    allergens: {
      contains: ['Dairy'],
      mayContain: [],
    },
    dietaryTags: ['Mediterranean', 'Vegetarian', 'High Fiber', 'Gluten-free'],
    diabetesFriendly: true,
    carbQuality: 'Good',
    ratings: { average: 4.6, count: 198 },
  },

  // DINNER RECIPES
  {
    name: 'Grilled Salmon with Asparagus',
    description: 'Omega-3 rich salmon with roasted asparagus',
    mealType: ['dinner'],
    prepTime: 10,
    cookTime: 20,
    servings: 2,
    difficulty: 'medium',
    ingredients: [
      { name: 'Wild Salmon Fillet', quantity: 12, unit: 'oz' },
      { name: 'Asparagus', quantity: 1, unit: 'lb' },
      { name: 'Olive Oil', quantity: 2, unit: 'tbsp' },
      { name: 'Lemon', quantity: 1, unit: 'whole' },
      { name: 'Garlic', quantity: 3, unit: 'cloves' },
      { name: 'Fresh Dill', quantity: 2, unit: 'tbsp' },
    ],
    instructions: [
      'Preheat oven to 400°F',
      'Place salmon and asparagus on a baking sheet',
      'Drizzle with olive oil, squeeze lemon juice over',
      'Season with minced garlic, dill, salt, and pepper',
      'Bake for 15-18 minutes until salmon flakes easily',
      'Serve with lemon wedges',
    ],
    nutrition: {
      calories: 420,
      totalCarbs: 8,
      netCarbs: 4,
      fiber: 4,
      sugar: 3,
      protein: 40,
      fat: 24,
      glycemicIndex: 15,
      glycemicLoad: 1,
    },
    allergens: {
      contains: ['Fish'],
      mayContain: [],
    },
    dietaryTags: ['High Protein', 'Low Carb', 'Omega-3', 'Paleo', 'Gluten-free', 'Dairy-free'],
    diabetesFriendly: true,
    carbQuality: 'Excellent',
    ratings: { average: 4.9, count: 445 },
  },
  {
    name: 'Zucchini Noodles with Marinara',
    description: 'Low-carb pasta alternative with homemade marinara sauce',
    mealType: ['dinner'],
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    difficulty: 'easy',
    ingredients: [
      { name: 'Zucchini', quantity: 4, unit: 'medium' },
      { name: 'Tomatoes', quantity: 4, unit: 'cups' },
      { name: 'Garlic', quantity: 4, unit: 'cloves' },
      { name: 'Olive Oil', quantity: 2, unit: 'tbsp' },
      { name: 'Fresh Basil', quantity: 0.25, unit: 'cup' },
      { name: 'Ground Turkey', quantity: 8, unit: 'oz', optional: true },
    ],
    instructions: [
      'Spiralize zucchini into noodles',
      'Heat olive oil in a pan, sauté garlic until fragrant',
      'Add tomatoes and simmer for 15 minutes',
      'Add basil and season with salt and pepper',
      'If using turkey, brown it separately and add to sauce',
      'Toss zucchini noodles with hot marinara sauce and serve',
    ],
    nutrition: {
      calories: 180,
      totalCarbs: 18,
      netCarbs: 12,
      fiber: 6,
      sugar: 11,
      protein: 8,
      fat: 9,
      glycemicIndex: 35,
      glycemicLoad: 4,
    },
    allergens: {
      contains: [],
      mayContain: [],
    },
    dietaryTags: ['Low Carb', 'Vegan', 'Dairy-free', 'Gluten-free', 'Low GI'],
    diabetesFriendly: true,
    carbQuality: 'Excellent',
    ratings: { average: 4.5, count: 312 },
  },
  {
    name: 'Herb-Roasted Chicken with Brussels Sprouts',
    description: 'Juicy roasted chicken with caramelized Brussels sprouts',
    mealType: ['dinner'],
    prepTime: 10,
    cookTime: 35,
    servings: 4,
    difficulty: 'medium',
    ingredients: [
      { name: 'Chicken Breast', quantity: 1.5, unit: 'lbs' },
      { name: 'Brussels Sprouts', quantity: 1, unit: 'lb' },
      { name: 'Olive Oil', quantity: 3, unit: 'tbsp' },
      { name: 'Garlic', quantity: 4, unit: 'cloves' },
      { name: 'Fresh Rosemary', quantity: 2, unit: 'tbsp' },
      { name: 'Fresh Thyme', quantity: 1, unit: 'tbsp' },
      { name: 'Lemon', quantity: 1, unit: 'whole' },
    ],
    instructions: [
      'Preheat oven to 425°F',
      'Halve Brussels sprouts and place on a baking sheet',
      'Season chicken with herbs, garlic, salt, and pepper',
      'Place chicken on the sheet with Brussels sprouts',
      'Drizzle everything with olive oil and lemon juice',
      'Roast for 30-35 minutes until chicken reaches 165°F',
      'Let rest 5 minutes before slicing',
    ],
    nutrition: {
      calories: 340,
      totalCarbs: 12,
      netCarbs: 8,
      fiber: 4,
      sugar: 3,
      protein: 42,
      fat: 13,
      glycemicIndex: 25,
      glycemicLoad: 2,
    },
    allergens: {
      contains: [],
      mayContain: [],
    },
    dietaryTags: ['High Protein', 'Low Carb', 'Paleo', 'Gluten-free', 'Dairy-free'],
    diabetesFriendly: true,
    carbQuality: 'Excellent',
    ratings: { average: 4.8, count: 287 },
  },
  {
    name: 'Cauliflower Fried Rice',
    description: 'Low-carb fried rice made with cauliflower',
    mealType: ['dinner'],
    prepTime: 15,
    cookTime: 15,
    servings: 3,
    difficulty: 'easy',
    ingredients: [
      { name: 'Cauliflower', quantity: 1, unit: 'head' },
      { name: 'Eggs', quantity: 2, unit: 'whole' },
      { name: 'Mixed Vegetables', quantity: 2, unit: 'cups' },
      { name: 'Green Onions', quantity: 3, unit: 'stalks' },
      { name: 'Garlic', quantity: 3, unit: 'cloves' },
      { name: 'Ginger', quantity: 1, unit: 'tbsp' },
      { name: 'Coconut Aminos', quantity: 3, unit: 'tbsp' },
      { name: 'Sesame Oil', quantity: 2, unit: 'tsp' },
    ],
    instructions: [
      'Pulse cauliflower in food processor until rice-sized',
      'Heat sesame oil in a large wok or pan',
      'Scramble eggs and set aside',
      'Stir-fry garlic and ginger for 30 seconds',
      'Add vegetables and cauliflower rice, cook 5-7 minutes',
      'Add coconut aminos and scrambled eggs',
      'Garnish with green onions and serve',
    ],
    nutrition: {
      calories: 160,
      totalCarbs: 14,
      netCarbs: 9,
      fiber: 5,
      sugar: 6,
      protein: 9,
      fat: 8,
      glycemicIndex: 32,
      glycemicLoad: 3,
    },
    allergens: {
      contains: ['Eggs', 'Sesame'],
      mayContain: [],
    },
    dietaryTags: ['Low Carb', 'Vegetarian', 'Gluten-free', 'Dairy-free'],
    diabetesFriendly: true,
    carbQuality: 'Excellent',
    ratings: { average: 4.6, count: 378 },
  },

  // SNACKS
  {
    name: 'Cucumber Hummus Bites',
    description: 'Refreshing low-carb snack with protein-rich hummus',
    mealType: ['snack'],
    prepTime: 10,
    cookTime: 0,
    servings: 2,
    difficulty: 'easy',
    ingredients: [
      { name: 'Cucumber', quantity: 1, unit: 'large' },
      { name: 'Hummus', quantity: 0.5, unit: 'cup' },
      { name: 'Cherry Tomatoes', quantity: 6, unit: 'whole' },
      { name: 'Feta Cheese', quantity: 2, unit: 'tbsp', optional: true },
      { name: 'Fresh Dill', quantity: 1, unit: 'tbsp' },
    ],
    instructions: [
      'Slice cucumber into 1/2 inch rounds',
      'Top each round with a dollop of hummus',
      'Add a cherry tomato half on top',
      'Sprinkle with feta and fresh dill if desired',
    ],
    nutrition: {
      calories: 95,
      totalCarbs: 12,
      netCarbs: 8,
      fiber: 4,
      sugar: 3,
      protein: 4,
      fat: 4,
      glycemicIndex: 28,
      glycemicLoad: 2,
    },
    allergens: {
      contains: ['Sesame'],
      mayContain: ['Dairy'],
    },
    dietaryTags: ['Low GI', 'Vegan', 'Gluten-free', 'Quick'],
    diabetesFriendly: true,
    carbQuality: 'Excellent',
    ratings: { average: 4.4, count: 156 },
  },
  {
    name: 'Mixed Nuts with Dark Chocolate',
    description: 'Satisfying snack with healthy fats and antioxidants',
    mealType: ['snack'],
    prepTime: 2,
    cookTime: 0,
    servings: 1,
    difficulty: 'easy',
    ingredients: [
      { name: 'Almonds', quantity: 10, unit: 'whole' },
      { name: 'Walnuts', quantity: 5, unit: 'halves' },
      { name: 'Dark Chocolate', quantity: 2, unit: 'squares' },
    ],
    instructions: [
      'Measure out nuts',
      'Enjoy with dark chocolate squares',
    ],
    nutrition: {
      calories: 220,
      totalCarbs: 12,
      netCarbs: 8,
      fiber: 4,
      sugar: 6,
      protein: 6,
      fat: 18,
      glycemicIndex: 30,
      glycemicLoad: 2,
    },
    allergens: {
      contains: ['Tree nuts'],
      mayContain: ['Dairy'],
    },
    dietaryTags: ['Low GI', 'Keto-friendly', 'Quick', 'Portable'],
    diabetesFriendly: true,
    carbQuality: 'Good',
    ratings: { average: 4.7, count: 289 },
  },
]

async function seedRecipes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing recipes
    await Recipe.deleteMany({})
    console.log('Cleared existing recipes')

    // Insert sample recipes
    const result = await Recipe.insertMany(recipes)
    console.log(`✅ Seeded ${result.length} recipes`)

    // Show summary
    const breakfast = result.filter(r => r.mealType.includes('breakfast')).length
    const lunch = result.filter(r => r.mealType.includes('lunch')).length
    const dinner = result.filter(r => r.mealType.includes('dinner')).length
    const snacks = result.filter(r => r.mealType.includes('snack')).length

    console.log(`
Recipe Summary:
- Breakfast: ${breakfast}
- Lunch: ${lunch}
- Dinner: ${dinner}
- Snacks: ${snacks}
- Diabetes-friendly: ${result.filter(r => r.diabetesFriendly).length}
    `)

    // Close connection
    await mongoose.connection.close()
    console.log('Connection closed')
  } catch (error) {
    console.error('Error seeding recipes:', error)
    process.exit(1)
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedRecipes()
}

module.exports = seedRecipes
