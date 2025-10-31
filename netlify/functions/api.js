const express = require('express')
const serverless = require('serverless-http')
const cors = require('cors')
const mongoose = require('mongoose')

// Import MongoDB models
const User = require('../../packages/backend/src/models/User')
const Product = require('../../packages/backend/src/models/Product')
const ShoppingList = require('../../packages/backend/src/models/ShoppingList')

const app = express()

// Middleware
// Allow the deployed site URL by default; fall back to permissive during local dev.
const allowedOrigin = process.env.ALLOWED_ORIGIN || process.env.URL || process.env.DEPLOY_PRIME_URL || '*'
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))
app.use(express.json()

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI
let isConnected = false

const connectDB = async () => {
  if (isConnected) {
    return
  }

  try {
    await mongoose.connect(mongoUri)
    isConnected = true
    console.log('MongoDB connected')
  } catch (err) {
    console.log('MongoDB connection error:', err)
    // Don't throw error, allow app to continue without DB for health checks
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: isConnected ? 'connected' : 'disconnected'
  })
})

// Auth endpoints - simplified without Firebase Admin
app.post('/auth/verify', async (req, res) => {
  try {
    const { token, email, name } = req.body
    
    if (!token) {
      return res.status(400).json({ error: 'Token required' })
    }

    // For now, accept any token and create/find user by email
    // In production, you'd verify the Firebase token properly
    let user = await User.findOne({ email: email || 'demo@example.com' })

    if (!user) {
      user = new User({
        firebaseId: 'demo-' + Date.now(),
        email: email || 'demo@example.com',
        name: name || 'Demo User',
        healthProfiles: [],
      })
      await user.save()
    }

    res.json({
      verified: true,
      user: {
        id: user._id,
        firebaseId: user.firebaseId,
        email: user.email,
        name: user.name,
        healthProfiles: user.healthProfiles,
      },
    })
  } catch (error) {
    console.error('Auth error:', error)
    res.status(401).json({ error: 'Authentication failed' })
  }
})

// Products endpoints
app.get('/products', async (req, res) => {
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

app.get('/products/barcode/:barcode', async (req, res) => {
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

app.get('/products/:id', async (req, res) => {
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

// Users endpoints
app.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      healthProfiles: user.healthProfiles,
      preferences: user.preferences,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/users/:userId/health-profile', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    user.healthProfiles.push(req.body)
    await user.save()
    
    res.json({ message: 'Health profile saved', healthProfile: req.body })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Shopping lists endpoints
app.get('/shopping-lists/user/:userId', async (req, res) => {
  try {
    const lists = await ShoppingList.find({ userId: req.params.userId })
    res.json(lists)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/shopping-lists', async (req, res) => {
  try {
    const list = new ShoppingList(req.body)
    await list.save()
    res.status(201).json(list)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: err.message })
})

// Export handler for Netlify Functions
const handler = async (event, context) => {
  await connectDB()
  const serverlessHandler = serverless(app)
  return serverlessHandler(event, context)
}

module.exports = { handler }
