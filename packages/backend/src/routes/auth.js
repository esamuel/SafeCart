const express = require('express')
const router = express.Router()
const User = require('../models/User')
const admin = require('firebase-admin')

// Initialize Firebase Admin
let serviceAccount = null
if (process.env.FIREBASE_PRIVATE_KEY) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY)
  } catch (e) {
    console.warn('Warning: Could not parse FIREBASE_PRIVATE_KEY. Firebase features disabled.')
  }
}

if (serviceAccount && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    })
  } catch (e) {
    console.warn('Warning: Could not initialize Firebase Admin:', e.message)
  }
}

// Verify Firebase token and create/update user in database
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body
    if (!token) {
      return res.status(400).json({ error: 'Token required' })
    }

    // Check if Firebase is initialized
    if (!admin.apps.length) {
      console.error('Firebase Admin not initialized - missing FIREBASE_PRIVATE_KEY')
      return res.status(500).json({ error: 'Authentication service not configured' })
    }

    // Verify token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token)
    const firebaseId = decodedToken.uid
    const email = decodedToken.email

    // Check if user exists in database
    let user = await User.findOne({ firebaseId })

    // If user doesn't exist, create one
    if (!user) {
      user = new User({
        firebaseId,
        email,
        name: decodedToken.name || email.split('@')[0],
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
    console.error('Auth verification error:', error)
    res.status(401).json({ error: 'Invalid token' })
  }
})

module.exports = router
