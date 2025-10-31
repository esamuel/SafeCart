const express = require('express')
const router = express.Router()
const User = require('../models/User')

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    // Try to find by MongoDB ID first, then by firebaseId
    let user = await User.findById(req.params.userId).catch(() => null)
    if (!user) {
      user = await User.findOne({ firebaseId: req.params.userId })
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      displayName: user.displayName,
      age: user.age,
      height: user.height,
      weight: user.weight,
      region: user.region,
      healthProfiles: user.healthProfiles,
      preferences: user.preferences,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create or update health profile
router.post('/:userId/health-profile', async (req, res) => {
  try {
    console.log('[HEALTH PROFILE] Save request for userId:', req.params.userId)
    console.log('[HEALTH PROFILE] Request body:', JSON.stringify(req.body, null, 2))

    const {
      displayName,
      age,
      height,
      weight,
      region,
      diabetesType,
      allergies,
      targetGlucoseMin,
      targetGlucoseMax,
      dailyCarbLimit,
      usesInsulin
    } = req.body

    // Try to find by MongoDB ID first, then by firebaseId
    let user = await User.findById(req.params.userId).catch(() => null)
    console.log('[HEALTH PROFILE] User found by MongoDB ID:', user ? user._id : 'null')

    if (!user) {
      user = await User.findOne({ firebaseId: req.params.userId })
      console.log('[HEALTH PROFILE] User found by Firebase ID:', user ? user._id : 'null')
    }

    if (!user) {
      // Create user if doesn't exist (fallback when auth/verify isn't called)
      console.log('[HEALTH PROFILE] User not found, creating new user with Firebase ID:', req.params.userId)
      user = new User({
        firebaseId: req.params.userId,
        email: req.body.email || `user_${req.params.userId}@safecart.app`,
        name: displayName || 'User',
        healthProfiles: [],
      })
      // Don't save yet, will save after adding health profile below
    }

    console.log('[HEALTH PROFILE] Found user:', user.email)

    // Update personal information
    if (displayName !== undefined) user.displayName = displayName
    if (age !== undefined) user.age = age
    if (height !== undefined) user.height = height
    if (weight !== undefined) user.weight = weight
    if (region !== undefined) user.region = region

    // Create health profile with proper structure
    const healthProfile = {
      profileId: Date.now().toString(),
      name: 'My Profile',
      diabetesType: diabetesType || 'Type 1',
      targetGlucoseMin: targetGlucoseMin || 80,
      targetGlucoseMax: targetGlucoseMax || 130,
      dailyCarbLimit: dailyCarbLimit || 200,
      usesInsulin: usesInsulin !== undefined ? usesInsulin : true,
      allergies: allergies || [],
      intolerances: [],
      dietaryPreferences: [],
    }

    // Replace existing health profile or add new one
    user.healthProfiles = [healthProfile]
    user.updatedAt = new Date()
    await user.save()

    console.log('[HEALTH PROFILE] Successfully saved profile for user:', user.email)

    res.json({
      message: 'Profile saved successfully',
      user: {
        id: user._id,
        displayName: user.displayName,
        age: user.age,
        height: user.height,
        weight: user.weight,
      },
      healthProfile,
    })
  } catch (error) {
    console.error('[HEALTH PROFILE] Error saving health profile:', error)
    res.status(400).json({ error: error.message })
  }
})

// Update user preferences
router.put('/:userId/preferences', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { preferences: req.body, updatedAt: new Date() },
      { new: true }
    )
    res.json({
      message: 'Preferences updated',
      preferences: user.preferences,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
