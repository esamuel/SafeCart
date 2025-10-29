const express = require('express')
const router = express.Router()
const axios = require('axios')
const User = require('../models/User')
const Product = require('../models/Product')

// Helper: Detect user region
const getUserRegion = async (userId, ipAddress) => {
  try {
    // 1. Check user profile first (most reliable)
    if (userId) {
      const user = await User.findOne({ firebaseId: userId })
      if (user?.region) {
        return user.region
      }
    }

    // 2. Fallback to IP geolocation (free service)
    try {
      const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`, { timeout: 3000 })
      const countryCode = response.data.country_code
      return countryCode || 'US'
    } catch (ipError) {
      console.warn('IP geolocation failed:', ipError.message)
    }

    // 3. Default to US
    return 'US'
  } catch (error) {
    console.error('getUserRegion error:', error)
    return 'US'
  }
}

// Helper: Query OpenFoodFacts API
const queryOpenFoodFacts = async (barcode, countryCode, languageCode) => {
  try {
    // Try country-specific endpoint first
    const countryUrl = `https://${countryCode.toLowerCase()}.openfoodfacts.org/api/v2/product/${barcode}.json`

    let response = await axios.get(countryUrl, { timeout: 5000 })

    if (response.data.status === 1) {
      return {
        success: true,
        data: response.data.product,
        source: `openfoodfacts-${countryCode}`
      }
    }

    // Fallback to global database with country filter
    const globalUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?cc=${countryCode.toLowerCase()}&lc=${languageCode}`

    response = await axios.get(globalUrl, { timeout: 5000 })

    if (response.data.status === 1) {
      return {
        success: true,
        data: response.data.product,
        source: 'openfoodfacts-global'
      }
    }

    return { success: false }
  } catch (error) {
    console.error('OpenFoodFacts API error:', error.message)
    return { success: false, error: error.message }
  }
}

// Helper: Query USDA FoodData Central (USA only)
const queryUSDA = async (barcode) => {
  // TODO: Implement USDA API integration
  // Requires API key from https://fdc.nal.usda.gov/api-guide.html
  // For now, return not found
  return { success: false }
}

// Helper: Map OpenFoodFacts data to our schema
const mapOpenFoodFactsToProduct = (offProduct, barcode, region) => {
  const nutriments = offProduct.nutriments || {}

  return {
    upc: barcode,
    name: offProduct.product_name || offProduct.product_name_en || 'Unknown Product',
    brand: offProduct.brands || 'Unknown Brand',
    category: offProduct.categories_tags?.[0]?.replace('en:', '') || 'Uncategorized',
    nutrition: {
      servingSize: offProduct.serving_size || '100g',
      calories: nutriments.energy_kcal || nutriments['energy-kcal_100g'] || 0,
      totalCarbs: nutriments.carbohydrates_100g || 0,
      fiber: nutriments.fiber_100g || 0,
      sugar: nutriments.sugars_100g || 0,
      netCarbs: (nutriments.carbohydrates_100g || 0) - (nutriments.fiber_100g || 0),
      protein: nutriments.proteins_100g || 0,
      fat: nutriments.fat_100g || 0,
    },
    diabetesInfo: {
      glycemicIndex: null, // OpenFoodFacts doesn't have GI data
      glycemicLoad: null,
      carbQuality: categorizeCarbs(nutriments.carbohydrates_100g, nutriments.fiber_100g, nutriments.sugars_100g),
    },
    allergens: {
      contains: offProduct.allergens_tags?.map(a => a.replace('en:', '')) || [],
      mayContain: offProduct.traces_tags?.map(t => t.replace('en:', '')) || [],
      processedIn: [],
    },
    ingredients: offProduct.ingredients_text?.split(',').map(i => i.trim()) || [],
    images: [
      offProduct.image_url,
      offProduct.image_front_url,
      offProduct.image_nutrition_url
    ].filter(Boolean),
    regions: [{
      country: region,
      available: true,
      barcode: barcode,
      localName: offProduct.product_name,
      localBrand: offProduct.brands,
      stores: offProduct.stores_tags?.map(s => s.replace('en:', '')) || [],
      source: 'openfoodfacts',
      lastUpdated: new Date(),
    }],
    source: 'openfoodfacts',
    userSubmitted: false,
    verified: true,
  }
}

// Helper: Categorize carb quality
const categorizeCarbs = (totalCarbs, fiber, sugar) => {
  if (!totalCarbs || totalCarbs === 0) return 'none'

  const fiberRatio = fiber / totalCarbs
  const sugarRatio = sugar / totalCarbs

  if (fiberRatio > 0.3 && sugarRatio < 0.2) return 'slow' // Good: High fiber, low sugar
  if (sugarRatio > 0.5) return 'fast' // Bad: High sugar
  return 'medium'
}

// Helper: Analyze product safety for user
const analyzeSafety = (product, healthProfile) => {
  if (!healthProfile) {
    return {
      overallSafety: 'unknown',
      allergenWarnings: [],
      diabetesWarnings: [],
      recommendations: ['Please set up your health profile for personalized recommendations']
    }
  }

  const warnings = []
  const allergenWarnings = []
  const diabetesWarnings = []

  // Check allergens
  const userAllergies = healthProfile.allergies || []
  const productAllergens = product.allergens?.contains || []
  const mayContain = product.allergens?.mayContain || []

  for (const allergen of userAllergies) {
    if (productAllergens.some(pa => pa.toLowerCase().includes(allergen.toLowerCase()))) {
      allergenWarnings.push({
        severity: 'danger',
        message: `⚠️ CONTAINS ${allergen.toUpperCase()}! Do not consume!`
      })
    } else if (mayContain.some(mc => mc.toLowerCase().includes(allergen.toLowerCase()))) {
      allergenWarnings.push({
        severity: 'warning',
        message: `⚠️ May contain ${allergen}. Use caution.`
      })
    }
  }

  // Check diabetes safety
  const netCarbs = product.nutrition?.netCarbs || 0
  const dailyCarbLimit = healthProfile.dailyCarbLimit || 200
  const carbQuality = product.diabetesInfo?.carbQuality

  if (netCarbs > dailyCarbLimit * 0.5) {
    diabetesWarnings.push({
      severity: 'warning',
      message: `High carbs: ${netCarbs.toFixed(1)}g net carbs per 100g`
    })
  }

  if (carbQuality === 'fast') {
    diabetesWarnings.push({
      severity: 'warning',
      message: 'Fast-acting carbs (high sugar). May spike blood glucose.'
    })
  }

  // Overall safety
  let overallSafety = 'safe'
  if (allergenWarnings.some(w => w.severity === 'danger')) {
    overallSafety = 'danger'
  } else if (allergenWarnings.length > 0 || diabetesWarnings.length > 0) {
    overallSafety = 'warning'
  }

  // Recommendations
  const recommendations = []
  if (overallSafety === 'safe') {
    recommendations.push('✅ This product is safe for you!')
  }
  if (netCarbs < dailyCarbLimit * 0.2 && carbQuality === 'slow') {
    recommendations.push('👍 Good choice! Low net carbs and slow-releasing.')
  }

  return {
    overallSafety,
    allergenWarnings,
    diabetesWarnings,
    recommendations: recommendations.length > 0 ? recommendations : ['Product analyzed. Check details above.']
  }
}

// Main scan endpoint
router.post('/scan', async (req, res) => {
  try {
    const { barcode, userId } = req.body

    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' })
    }

    // 1. Detect user region
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '127.0.0.1'
    const userRegion = await getUserRegion(userId, ipAddress)

    console.log(`Scanning barcode ${barcode} for region ${userRegion}`)

    // 2. Check if we already have this product in our database
    let product = await Product.findOne({ upc: barcode, 'regions.country': userRegion })

    if (product) {
      console.log('Product found in local database')

      // Get user health profile for safety analysis
      let healthProfile = null
      if (userId) {
        const user = await User.findOne({ firebaseId: userId })
        healthProfile = user?.healthProfiles?.[0]
      }

      const safetyAnalysis = analyzeSafety(product, healthProfile)

      return res.json({
        found: true,
        product: product.toObject(),
        safetyAnalysis,
        region: userRegion,
        source: 'cache'
      })
    }

    // 3. Query external APIs based on region
    let offResult

    // Language mapping
    const languageMap = {
      'US': 'en',
      'IL': 'he',
      'MX': 'es',
      'AR': 'es',
      'CL': 'es',
      'CO': 'es',
      'ES': 'es',
      'PE': 'es',
      'VE': 'es',
    }
    const languageCode = languageMap[userRegion] || 'en'

    // Try OpenFoodFacts
    offResult = await queryOpenFoodFacts(barcode, userRegion, languageCode)

    // For USA, also try USDA if OpenFoodFacts fails
    if (!offResult.success && userRegion === 'US') {
      const usdaResult = await queryUSDA(barcode)
      if (usdaResult.success) {
        offResult = usdaResult
      }
    }

    // 4. If not found in any API
    if (!offResult.success) {
      console.log(`Product ${barcode} not found in any database for region ${userRegion}`)

      // Log missing product for manual review
      // TODO: Save to a "missing products" collection

      return res.json({
        found: false,
        message: 'Product not found in our database. Would you like to add it manually?',
        region: userRegion,
        barcode,
        canManuallyAdd: true
      })
    }

    // 5. Map external data to our schema
    const mappedProduct = mapOpenFoodFactsToProduct(offResult.data, barcode, userRegion)

    // 6. Save to our database
    product = new Product(mappedProduct)
    await product.save()

    console.log(`Product ${barcode} saved to database from ${offResult.source}`)

    // 7. Analyze safety for user
    let healthProfile = null
    if (userId) {
      const user = await User.findOne({ firebaseId: userId })
      healthProfile = user?.healthProfiles?.[0]
    }

    const safetyAnalysis = analyzeSafety(product, healthProfile)

    // 8. Return result
    res.json({
      found: true,
      product: product.toObject(),
      safetyAnalysis,
      region: userRegion,
      source: offResult.source
    })

  } catch (error) {
    console.error('Scanner error:', error)
    res.status(500).json({
      error: 'Failed to scan product',
      message: error.message
    })
  }
})

// Manual product entry endpoint
router.post('/add-manual', async (req, res) => {
  try {
    const { barcode, productData, userId, region } = req.body

    if (!barcode || !productData) {
      return res.status(400).json({ error: 'Barcode and product data are required' })
    }

    // Check if product already exists
    let product = await Product.findOne({ upc: barcode })

    if (product) {
      // Add region-specific data
      product.regions.push({
        country: region,
        available: true,
        barcode,
        localName: productData.name,
        localBrand: productData.brand,
        stores: productData.stores || [],
        source: 'manual',
        lastUpdated: new Date(),
      })
    } else {
      // Create new product
      product = new Product({
        upc: barcode,
        ...productData,
        regions: [{
          country: region,
          available: true,
          barcode,
          localName: productData.name,
          localBrand: productData.brand,
          stores: productData.stores || [],
          source: 'manual',
          lastUpdated: new Date(),
        }],
        source: 'manual',
        userSubmitted: true,
        verified: false, // Needs admin verification
      })
    }

    await product.save()

    res.json({
      success: true,
      message: 'Product added successfully! It will be reviewed and verified soon.',
      product: product.toObject()
    })

  } catch (error) {
    console.error('Manual add error:', error)
    res.status(500).json({ error: 'Failed to add product', message: error.message })
  }
})

module.exports = router
