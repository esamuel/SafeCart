#!/bin/bash

# SafeCart - Deploy to cPanel Script
# This script prepares your frontend for cPanel deployment

set -e

echo "🚀 SafeCart cPanel Deployment Helper"
echo "======================================"
echo ""

# Step 1: Check if we're in the right directory
if [ ! -d "packages/frontend" ]; then
    echo "❌ Error: Run this script from the root of the safecart directory"
    exit 1
fi

# Step 2: Ask for backend URL
echo "Step 1: Backend Configuration"
echo "------------------------------"
read -p "Enter your Render backend URL (e.g., https://safecart-backend.onrender.com): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo "⚠️  No backend URL provided. Using default: https://safecart-backend.onrender.com"
    BACKEND_URL="https://safecart-backend.onrender.com"
fi

# Step 3: Ask for Firebase credentials
echo ""
echo "Step 2: Firebase Configuration (optional - press Enter to use defaults)"
echo "-----------------------------------------------------------------------"
read -p "Firebase API Key: " FIREBASE_API_KEY
read -p "Firebase Project ID: " FIREBASE_PROJECT_ID

# Use defaults if not provided
FIREBASE_API_KEY=${FIREBASE_API_KEY:-"AIzaSyXxxxxxxxxxxxxxxxxxxxx"}
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID:-"safecart-project"}

# Step 4: Create .env.production file
echo ""
echo "📝 Creating production environment file..."
cd packages/frontend

cat > .env.production << EOF
NEXT_PUBLIC_API_URL=$BACKEND_URL
NEXT_PUBLIC_FIREBASE_API_KEY=$FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$FIREBASE_PROJECT_ID.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$FIREBASE_PROJECT_ID.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
EOF

echo "✅ Environment file created"

# Step 5: Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Step 6: Build frontend
echo ""
echo "🔨 Building frontend for production..."
export NODE_ENV=production
npm run build

if [ ! -d "out" ]; then
    echo "❌ Error: Build failed - 'out' directory not created"
    exit 1
fi

echo "✅ Build successful!"

# Step 7: Create deployment package
echo ""
echo "📦 Creating deployment package..."
cd out
zip -r ../safecart-frontend-deploy.zip . -x "*.DS_Store"
cd ..

echo "✅ Deployment package created: safecart-frontend-deploy.zip"

# Step 8: Show next steps
echo ""
echo "=================================================="
echo "✅ DEPLOYMENT PACKAGE READY!"
echo "=================================================="
echo ""
echo "📍 Location: packages/frontend/safecart-frontend-deploy.zip"
echo ""
echo "Next Steps:"
echo "-----------"
echo "1. Log in to Namecheap cPanel: https://cpanel.namecheap.com"
echo ""
echo "2. Open File Manager"
echo ""
echo "3. Navigate to 'public_html' folder"
echo ""
echo "4. Upload 'safecart-frontend-deploy.zip'"
echo ""
echo "5. Right-click the zip file → Extract"
echo ""
echo "6. Delete the zip file after extraction"
echo ""
echo "7. Create .htaccess file (see NAMECHEAP_CPANEL_DEPLOYMENT.md)"
echo ""
echo "8. Visit https://safecart.app to test!"
echo ""
echo "=================================================="
echo ""
echo "📚 Full guide: NAMECHEAP_CPANEL_DEPLOYMENT.md"
echo ""
echo "Backend URL configured: $BACKEND_URL"
echo ""
echo "Need to deploy backend? See NAMECHEAP_CPANEL_DEPLOYMENT.md Option 1"
echo ""

