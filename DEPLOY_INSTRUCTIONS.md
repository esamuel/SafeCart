# Deploy SafeCart to safecart.app

I've prepared everything for deployment, but I need you to complete a few steps that require authentication.

## What's Ready:
✅ All code committed and pushed to GitHub
✅ Backend configured for Render
✅ Frontend configured for Vercel
✅ MongoDB connection string ready
✅ Domain: safecart.app

## Step 1: Deploy Backend to Render (5 minutes)

1. **Go to https://render.com and sign up/login with GitHub**

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repo:**
   - Select repository: `SafeCart`
   - Branch: `feature/add-agents-and-initial-import` (or merge to main first)

4. **Configure the service:**
   ```
   Name: safecart-backend
   Region: Oregon (US West) - or closest to you
   Branch: feature/add-agents-and-initial-import
   Root Directory: packages/backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

5. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable":
   ```
   MONGODB_URI=mongodb+srv://samueleskenasy_db_user:JyvgtWrP6p8eEQ1s@cluster0.skixhoz.mongodb.net/safecart?retryWrites=true&w=majority&appName=Cluster0

   PORT=5002

   NODE_ENV=production
   ```

6. **Click "Create Web Service"**

7. **Wait 3-5 minutes** - You'll get a URL like: `https://safecart-backend.onrender.com`

8. **Test it:** Visit `https://safecart-backend.onrender.com/health`
   - Should return: `{"status":"OK","timestamp":"..."}`

## Step 2: Deploy Frontend to Vercel (5 minutes)

1. **Login to Vercel:**
   ```bash
   cd /Users/samueleskenasy/safecart/packages/frontend
   npx vercel login
   ```

2. **Deploy:**
   ```bash
   npx vercel --prod
   ```

3. **Answer the prompts:**
   ```
   ? Set up and deploy? Yes
   ? Which scope? Your account
   ? Link to existing project? No
   ? Project name? safecart
   ? In which directory is your code? ./
   ? Want to override settings? No
   ```

4. **You'll get a URL like:** `https://safecart-abc123.vercel.app`

## Step 3: Add Environment Variable to Vercel

1. **Go to Vercel Dashboard:** https://vercel.com/dashboard

2. **Select your project:** safecart

3. **Go to Settings → Environment Variables**

4. **Add:**
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://safecart-backend.onrender.com
   ```
   (Use your actual Render backend URL from Step 1)

5. **Redeploy:**
   ```bash
   npx vercel --prod
   ```

## Step 4: Configure Custom Domain (safecart.app)

1. **In Vercel Dashboard → Your Project → Settings → Domains**

2. **Click "Add Domain"**

3. **Enter:** `safecart.app`

4. **Vercel will show you DNS records to add:**
   - Go to your domain registrar (where you bought safecart.app)
   - Add the DNS records Vercel provides:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21

     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

5. **Wait 5-60 minutes for DNS propagation**

6. **Test:** Visit `https://safecart.app` 🎉

## Step 5: Test Everything

### Test Backend:
```bash
curl https://safecart-backend.onrender.com/health
```
Should return: `{"status":"OK",...}`

### Test Frontend:
Visit `https://safecart.app` (or your Vercel URL)

### Test Scanner:
1. Login/Sign up
2. Complete onboarding
3. Go to Scanner tab
4. Try these barcodes:
   - **USA:** 049000000443 (Coca-Cola) ✅
   - **Israeli:** 7290000068 (Bamba) ✅
   - **Israeli:** 7290000066097 (Elite Chocolate) ✅

### Test on Smartphone:
1. Open browser on your phone
2. Visit `https://safecart.app`
3. Should work perfectly with camera access! 📱

## Troubleshooting

### Backend Issues:
- Check Render logs: Dashboard → safecart-backend → Logs
- Verify MongoDB URI is correct
- Make sure PORT=5002 is set

### Frontend Issues:
- Check Vercel deployment logs
- Verify NEXT_PUBLIC_API_URL is set correctly
- Try visiting backend /health endpoint first

### Domain Not Working:
- DNS can take up to 24 hours (usually 5-60 minutes)
- Use Vercel preview URL in the meantime
- Check DNS propagation: https://dnschecker.org

## Quick Commands Reference

```bash
# Deploy frontend
cd packages/frontend
npx vercel login
npx vercel --prod

# Check backend health
curl https://safecart-backend.onrender.com/health

# Check frontend
open https://safecart.app
```

## What Happens After Deployment

1. **Backend on Render:**
   - Spins down after 15 min of inactivity (free tier)
   - First request after sleep: ~30 second delay
   - Solution: Use cron-job.org to ping /health every 10 min

2. **Frontend on Vercel:**
   - Always fast (global CDN)
   - No sleep/spin-down
   - Automatic HTTPS

3. **Database:**
   - MongoDB Atlas is always on
   - 512MB free storage
   - Current usage: ~50MB

## URLs You'll Have:

```
🌐 Public URL: https://safecart.app
🌐 Alt URL: https://safecart-abc123.vercel.app
🔧 Backend: https://safecart-backend.onrender.com
🔧 Health Check: https://safecart-backend.onrender.com/health
💾 Database: MongoDB Atlas (already connected)
```

## After Deployment:

1. ✅ Test all features on desktop
2. ✅ Test on smartphone
3. ✅ Share with friends/family for feedback
4. ⏳ Run full Israeli import (optional):
   ```bash
   cd packages/backend
   python3 scripts/download-top-chains.py
   MONGODB_URI="..." node scripts/import-israeli-products.js
   ```
5. ⏳ Build community features (nutrition entry UI)

## Need Help?

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Your Code:** All in GitHub - branch `feature/add-agents-and-initial-import`

---

**You're 3 commands away from deployment! 🚀**

```bash
# 1. Deploy backend at render.com (web UI)
# 2. Deploy frontend
cd packages/frontend && npx vercel --prod
# 3. Add domain at vercel.com (web UI)
```

Let me know when you're done and we'll test it together!
