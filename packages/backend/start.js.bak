#!/usr/bin/env node

// Robust startup script with better error handling
console.log('=== SafeCart Backend Starting ===');
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV || 'development');

// Check required environment variables
if (!process.env.MONGODB_URI) {
  console.warn('WARNING: MONGODB_URI not set, using default localhost');
}

// Try to load and start the server
try {
  console.log('Loading server from src/index.js...');
  require('./src/index.js');
  console.log('Server loaded successfully!');
} catch (error) {
  console.error('FATAL ERROR: Failed to start server');
  console.error('Error details:', error.message);
  console.error('Stack trace:', error.stack);

  // Exit with error code so Render knows it failed
  process.exit(1);
}
