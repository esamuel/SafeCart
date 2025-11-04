#!/bin/bash

# SafeCart - Fully Automated cPanel Deployment Preparation
# This script does ALL the preparation work for you

set -e

echo "🚀 SafeCart - Automated cPanel Deployment"
echo "=========================================="
echo ""
echo "This script will prepare EVERYTHING for your cPanel deployment."
echo "You'll only need to do a few clicks in cPanel afterwards!"
echo ""

# Check if we're in the right directory
if [ ! -d "packages/frontend" ] || [ ! -d "packages/backend" ]; then
    echo "❌ Error: Run this script from the safecart root directory"
    exit 1
fi

# Step 1: Get configuration
echo "📝 Step 1: Configuration"
echo "------------------------"
echo ""

read -p "Enter your MongoDB connection string (from MongoDB Atlas): " MONGODB_URI
if [ -z "$MONGODB_URI" ]; then
    echo "⚠️  No MongoDB URI provided. Using placeholder."
    MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/safecart"
fi

echo ""
echo "For backend URL, we'll use: api.safecart.app"
echo ""

BACKEND_URL="https://api.safecart.app"

read -p "Enter Firebase API Key (or press Enter to use default): " FIREBASE_API_KEY
FIREBASE_API_KEY=${FIREBASE_API_KEY:-"AIzaSyXxxxxxxxxxxxxxxxxxxxx"}

read -p "Enter Firebase Project ID (or press Enter to use default): " FIREBASE_PROJECT_ID
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID:-"safecart-project"}

# Step 2: Prepare Backend
echo ""
echo "📦 Step 2: Preparing Backend"
echo "----------------------------"

cd packages/backend

# Create production .env
cat > .env << EOF
MONGODB_URI=$MONGODB_URI
PORT=5002
NODE_ENV=production
EOF

echo "✅ Backend .env created"

# Create production package.json (if needed)
if [ ! -f "package.json" ]; then
    echo "⚠️  Warning: package.json not found in backend"
fi

# Create zip for upload (exclude node_modules and large files)
echo "📦 Creating backend-deploy.zip..."
zip -r ../../backend-deploy.zip . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "*.log" \
  -x ".env.example" \
  -x "frontend.log" \
  -x "frontend.pid" \
  > /dev/null 2>&1

cd ../..
echo "✅ backend-deploy.zip created ($(du -h backend-deploy.zip | cut -f1))"

# Step 3: Prepare Frontend
echo ""
echo "🎨 Step 3: Preparing Frontend"
echo "-----------------------------"

cd packages/frontend

# Create production .env
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=$BACKEND_URL
NEXT_PUBLIC_FIREBASE_API_KEY=$FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$FIREBASE_PROJECT_ID.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$FIREBASE_PROJECT_ID.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
EOF

echo "✅ Frontend .env.production created"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Build frontend
echo "🔨 Building frontend..."
npm run build

if [ ! -d "out" ]; then
    echo "❌ Error: Build failed - 'out' directory not created"
    exit 1
fi

echo "✅ Frontend built successfully"

# Create zip for upload
echo "📦 Creating frontend-deploy.zip..."
cd out
zip -r ../../../frontend-deploy.zip . > /dev/null 2>&1
cd ../../..

echo "✅ frontend-deploy.zip created ($(du -h frontend-deploy.zip | cut -f1))"

# Step 4: Create deployment instructions file
echo ""
echo "📋 Step 4: Creating Your Instructions"
echo "--------------------------------------"

cat > CPANEL_DEPLOY_INSTRUCTIONS.txt << 'INSTRUCTIONS'
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🎉 EVERYTHING IS READY! Just Follow These Steps           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

Your files are ready in the safecart folder:
  ✅ backend-deploy.zip  (Backend code)
  ✅ frontend-deploy.zip (Frontend code)

═══════════════════════════════════════════════════════════════

STEP 1: Create Subdomain (2 minutes)
────────────────────────────────────

1. Log in to cPanel
2. Search for: "Subdomains"
3. Click "Subdomains"
4. Fill in:
   Subdomain: api
   Domain: safecart.app
   Document Root: /home/yourusername/backend/public
5. Click "Create"

═══════════════════════════════════════════════════════════════

STEP 2: Create Node.js Application (3 minutes)
───────────────────────────────────────────────

1. In cPanel, search for: "Node.js"
2. Click "Setup Node.js App"
3. Click the blue "CREATE APPLICATION" button
4. Fill in EXACTLY:

   Node.js Version:         18.x (or higher)
   Application Mode:        Production
   Application Root:        backend
   Application URL:         api.safecart.app
   Application Startup File: start.js

5. Click "CREATE"
6. Wait for it to create (1-2 minutes)
7. IMPORTANT: Click "STOP" button to stop the app

═══════════════════════════════════════════════════════════════

STEP 3: Upload Backend (5 minutes)
───────────────────────────────────

1. In cPanel, open "File Manager"
2. Navigate to your home directory (usually /home/yourusername/)
3. You should see a "backend" folder (created by Node.js app)
4. Click on "backend" folder to open it
5. Click "Upload" button at the top
6. Upload: backend-deploy.zip
7. Wait for upload to complete
8. Go back to File Manager
9. Find backend-deploy.zip in the backend folder
10. Right-click → "Extract"
11. Extract to: /home/yourusername/backend/
12. Click "Extract Files"
13. After extraction, delete backend-deploy.zip

═══════════════════════════════════════════════════════════════

STEP 4: Configure Node.js App (3 minutes)
──────────────────────────────────────────

1. Go back to "Setup Node.js App" in cPanel
2. You should see your application listed
3. Click the "Pencil" icon (Edit) next to your app
4. Scroll down to "Environment Variables"
5. Click "Add Variable" and add these:

   Name: MONGODB_URI
   Value: MONGODB_URI_VALUE_PLACEHOLDER
   
   Name: PORT
   Value: 5002
   
   Name: NODE_ENV
   Value: production

6. Click "Save" for each variable
7. Click "Run NPM Install" button
8. Wait for packages to install (2-3 minutes)
9. Click "Restart" button

═══════════════════════════════════════════════════════════════

STEP 5: Upload Frontend (5 minutes)
────────────────────────────────────

1. In cPanel File Manager
2. Navigate to "public_html" folder
3. DELETE all existing files in public_html (if fresh install)
4. Click "Upload" button
5. Upload: frontend-deploy.zip
6. Wait for upload to complete
7. Go back to File Manager
8. Find frontend-deploy.zip in public_html
9. Right-click → "Extract"
10. Extract to: /home/yourusername/public_html/
11. Click "Extract Files"
12. After extraction, delete frontend-deploy.zip

═══════════════════════════════════════════════════════════════

STEP 6: Create .htaccess for Frontend (2 minutes)
──────────────────────────────────────────────────

1. In File Manager, still in public_html folder
2. Click "+ File" button
3. Name it: .htaccess
4. Click "Create New File"
5. Right-click on .htaccess → "Edit"
6. Paste the contents from htaccess-template.txt
7. Click "Save Changes"

═══════════════════════════════════════════════════════════════

STEP 7: Enable SSL (5 minutes)
───────────────────────────────

1. In cPanel, search for: "SSL/TLS Status"
2. Find these domains:
   - safecart.app
   - api.safecart.app
   - www.safecart.app
3. Click "Run AutoSSL" next to each one
4. Wait 5 minutes for certificates to generate

═══════════════════════════════════════════════════════════════

STEP 8: Test! (2 minutes)
─────────────────────────

1. Test Backend:
   Visit: https://api.safecart.app/health
   Should show: {"status":"OK","timestamp":"..."}

2. Test Frontend:
   Visit: https://safecart.app
   Should load your app!

3. Test Login/Scanner:
   - Sign up or log in
   - Try the scanner
   - Check everything works!

═══════════════════════════════════════════════════════════════

🎉 YOU'RE DONE! Total time: ~25 minutes

Your app is now live at: https://safecart.app
Your API is at: https://api.safecart.app

═══════════════════════════════════════════════════════════════

TROUBLESHOOTING:

❌ Backend not starting?
→ Check Node.js App logs in cPanel
→ Verify MongoDB URI is correct
→ Make sure npm install completed

❌ Frontend showing 404?
→ Check .htaccess file is present
→ Verify all files extracted properly

❌ API errors in browser?
→ Check backend is running (green "started" status)
→ Visit /health endpoint to test
→ Check browser console for exact error

═══════════════════════════════════════════════════════════════

Need help? Check CPANEL_ONLY_DEPLOYMENT.md for detailed guide.

INSTRUCTIONS

# Replace MongoDB URI in instructions
sed -i.bak "s|MONGODB_URI_VALUE_PLACEHOLDER|$MONGODB_URI|g" CPANEL_DEPLOY_INSTRUCTIONS.txt
rm -f CPANEL_DEPLOY_INSTRUCTIONS.txt.bak

echo "✅ Instructions created: CPANEL_DEPLOY_INSTRUCTIONS.txt"

# Step 5: Create quick reference card
cat > CPANEL_QUICK_REFERENCE.txt << 'ENDREF'
╔══════════════════════════════════════════════════════════════╗
║              CPANEL DEPLOYMENT QUICK REFERENCE               ║
╚══════════════════════════════════════════════════════════════╝

FILES TO UPLOAD:
  📦 backend-deploy.zip  → Upload to: backend/ folder
  📦 frontend-deploy.zip → Upload to: public_html/ folder

NODE.JS APP SETTINGS:
  Version: 18.x
  Mode: Production
  Root: backend
  URL: api.safecart.app
  Startup: start.js

ENVIRONMENT VARIABLES:
  MONGODB_URI = [your MongoDB connection string]
  PORT = 5002
  NODE_ENV = production

TESTING URLS:
  Backend Health: https://api.safecart.app/health
  Frontend: https://safecart.app

TOTAL TIME: ~25 minutes
ENDREF

echo "✅ Quick reference created: CPANEL_QUICK_REFERENCE.txt"

# Final summary
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   ✅ EVERYTHING IS READY FOR DEPLOYMENT!                    ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📦 Files Created:"
echo "  ✅ backend-deploy.zip ($(du -h backend-deploy.zip | cut -f1))"
echo "  ✅ frontend-deploy.zip ($(du -h frontend-deploy.zip | cut -f1))"
echo "  ✅ CPANEL_DEPLOY_INSTRUCTIONS.txt (your step-by-step guide)"
echo "  ✅ CPANEL_QUICK_REFERENCE.txt (quick lookup)"
echo ""
echo "📍 Location: /Users/samueleskenasy/safecart/"
echo ""
echo "🎯 NEXT STEPS:"
echo ""
echo "1. Open the instructions file:"
echo "   open CPANEL_DEPLOY_INSTRUCTIONS.txt"
echo ""
echo "2. Follow the 8 steps (takes ~25 minutes)"
echo ""
echo "3. Your app will be live at: https://safecart.app"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "💡 TIP: Print CPANEL_QUICK_REFERENCE.txt and keep it handy!"
echo ""
echo "🚀 Ready to deploy? Open CPANEL_DEPLOY_INSTRUCTIONS.txt now!"
echo ""


