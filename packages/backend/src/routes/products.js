const express = require('express')
const router = express.Router()
const Product = require('../models/Product')

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { search, category, allergen, maxCarbs } = req.query
    let query = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ]
    }

    if (category) query.category = category
    if (allergen) query['allergens.contains'] = { $nin: [allergen] }
    if (maxCarbs) query['nutrition.netCarbs'] = { $lte: parseInt(maxCarbs) }

    const products = await Product.find(query).limit(50)
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get product by barcode
router.get('/barcode/:barcode', async (req, res) => {
  try {
    const product = await Product.findOne({ upc: req.params.barcode })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create product (admin only)
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()
    res.status(201).json(product)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    )
    res.json(product)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Check product safety for user allergies
router.post('/check-safety/:productId', async (req, res) => {
  try {
    const { allergies } = req.body
    const product = await Product.findById(req.params.productId)
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const allergenMatches = product.allergens.contains.filter(allergen =>
      allergies.some(userAllergy => 
        userAllergy.toLowerCase() === allergen.toLowerCase()
      )
    )

    const safetyStatus = allergenMatches.length === 0 ? 'safe' : 'unsafe'
    
    res.json({
      productId: product._id,
      name: product.name,
      safetyStatus,
      matchedAllergens: allergenMatches,
      mayContainAllergens: product.allergens.mayContain,
      recommendations: allergenMatches.length > 0 ? 'Avoid this product' : 'Safe to consume'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
