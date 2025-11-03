require('dotenv').config()

const seedProducts = require('./products')
const seedExpandedProducts = require('./expandedProducts')
const seedRecipes = require('./recipes')

async function seedAll() {
  console.log('🌱 Starting complete database seed...\n')

  try {
    console.log('1️⃣ Seeding initial products...')
    await seedProducts()
    console.log('✅ Initial products seeded\n')

    console.log('2️⃣ Seeding expanded product catalog...')
    await seedExpandedProducts()
    console.log('✅ Expanded products seeded\n')

    console.log('3️⃣ Seeding recipe database...')
    await seedRecipes()
    console.log('✅ Recipes seeded\n')

    console.log('🎉 All data successfully seeded!')
    console.log('\n📊 Summary:')
    console.log('   • Products: 70+ items across multiple categories')
    console.log('   • Recipes: 15 diabetes-friendly, allergen-aware recipes')
    console.log('   • Ready for testing!\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  }
}

seedAll()
