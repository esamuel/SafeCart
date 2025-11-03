const mongoose = require('mongoose')
const User = require('./src/models/User')

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/safecart'

async function checkUser() {
  try {
    await mongoose.connect(mongoUri)
    console.log('MongoDB connected')

    // Find user by Firebase ID
    const firebaseId = 'Wx4ZxxhNp7glF1qo6AI5eaqumfT2'
    const user = await User.findOne({ firebaseId })

    if (user) {
      console.log('\n=== USER FOUND ===')
      console.log('MongoDB ID:', user._id)
      console.log('Firebase ID:', user.firebaseId)
      console.log('Email:', user.email)
      console.log('Name:', user.name)
      console.log('onboardingCompleted:', user.onboardingCompleted)
      console.log('Health Profiles:', JSON.stringify(user.healthProfiles, null, 2))
      console.log('==================\n')
    } else {
      console.log('\n=== USER NOT FOUND ===')
      console.log('No user found with Firebase ID:', firebaseId)
      console.log('======================\n')
    }

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkUser()
