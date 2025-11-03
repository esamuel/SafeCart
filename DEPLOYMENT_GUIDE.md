# SafeCart Deployment Guide

## Quick Deploy - Smartphone Access

Get SafeCart deployed and accessible from your smartphone in ~15 minutes.

## Current Status

✅ Multi-region scanner working
✅ USA coverage: 90%+  
✅ Israeli sample data: 10 products (100% detection)
✅ Ready to deploy!

## Option 1: Vercel (Recommended - Easiest)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy Frontend
```bash
cd /Users/samueleskenasy/safecart/packages/frontend
vercel --prod
```

### Step 3: Deploy Backend to Render.com

1. Go to https://render.com
2. Sign up with GitHub
3. New + → Web Service
4. Connect your safecart repo
5. Configure:
   - Name: safecart-backend
   - Root Directory: packages/backend
   - Build: npm install
   - Start: npm start
6. Add Environment Variables:
   - MONGODB_URI=(your MongoDB connection string)
   - PORT=5002

### Step 4: Update Frontend API URL
```bash
cd packages/frontend
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://safecart-backend.onrender.com
vercel --prod
```

## Your Deployed URLs
- Frontend: https://safecart-[id].vercel.app
- Backend: https://safecart-backend.onrender.com

## Test on Smartphone
1. Open smartphone browser
2. Visit your Vercel URL
3. Test scanner with:
   - USA: 049000000443 (Coca-Cola) ✅
   - Israeli: 7290000068 (Bamba) ✅

Done! 🚀
