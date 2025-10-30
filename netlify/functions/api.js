const express = require('express')
const serverless = require('serverless-http')
const cors = require('cors')
const mongoose = require('mongoose')

// Import your existing Express app setup
const app = express()

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())

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
    throw err
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Import routes
app.use('/auth', require('../../packages/backend/src/routes/auth'))
app.use('/products', require('../../packages/backend/src/routes/products'))
app.use('/users', require('../../packages/backend/src/routes/users'))
app.use('/shopping-lists', require('../../packages/backend/src/routes/shoppingLists'))
app.use('/meals', require('../../packages/backend/src/routes/meals'))
app.use('/recipes', require('../../packages/backend/src/routes/recipes'))
app.use('/analytics', require('../../packages/backend/src/routes/analytics'))
app.use('/shares', require('../../packages/backend/src/routes/shares'))
app.use('/social', require('../../packages/backend/src/routes/social'))
app.use('/inventory', require('../../packages/backend/src/routes/inventory'))
app.use('/scanner', require('../../packages/backend/src/routes/scanner'))

// Error handling
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: err.message })
})

// Export handler for Netlify Functions
const handler = async (event, context) => {
  // Ensure MongoDB connection
  await connectDB()

  // Use serverless-http to handle the request
  const serverlessHandler = serverless(app)
  return serverlessHandler(event, context)
}

module.exports = { handler }
