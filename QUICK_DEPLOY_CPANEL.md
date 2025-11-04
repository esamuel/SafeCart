# 🚀 Quick Deploy to cPanel - safecart.app

## ⏱️ Total Time: ~30 minutes

---

## 🎯 What You Need

- ✅ Namecheap account with cPanel access
- ✅ Domain: safecart.app (registered at Namecheap)
- ✅ MongoDB Atlas database (already set up)
- ✅ This repository

---

## 📋 Quick Steps Overview

1. **Deploy Backend** → Render.com (FREE) - 10 min
2. **Build Frontend** → Run deploy script - 5 min
3. **Upload to cPanel** → File Manager - 10 min
4. **Configure & Test** → 5 min

---

## Step 1: Deploy Backend to Render 🔧

### A. Sign Up
1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub

### B. Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub account
3. Select repository: **safecart**

### C. Configure Service
```
Name: safecart-backend
Region: Oregon (US West)
Branch: main (or your current branch)
Root Directory: packages/backend
Environment: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

### D. Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

```bash
MONGODB_URI = [Your MongoDB Atlas connection string]
PORT = 5002
NODE_ENV = production
```

**Get your MongoDB URI:**
- Log in to MongoDB Atlas: https://cloud.mongodb.com
- Click **"Connect"** on your cluster
- Choose **"Connect your application"**
- Copy the connection string
- Replace `<password>` with your actual password

### E. Deploy
1. Click **"Create Web Service"**
2. Wait 3-5 minutes
3. Copy your backend URL: `https://safecart-backend.onrender.com`
4. Test it: Visit `https://safecart-backend.onrender.com/health`
   - Should show: `{"status":"OK","timestamp":"..."}`

✅ **Backend is live!**

---

## Step 2: Build Frontend 🔨

### Option A: Use Deploy Script (Recommended)

```bash
cd /Users/samueleskenasy/safecart
./deploy-to-cpanel.sh
```

Follow the prompts:
- Enter your Render backend URL (from Step 1)
- Enter Firebase credentials (or press Enter for defaults)

The script will:
- Create production config
- Build the frontend
- Create a zip file ready for upload

### Option B: Manual Build

```bash
cd /Users/samueleskenasy/safecart/packages/frontend

# Create .env.production
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://safecart-backend.onrender.com
NEXT_PUBLIC_FIREBASE_API_KEY=your-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
EOF

# Build
npm install
npm run build

# Create zip
cd out
zip -r ../safecart-frontend-deploy.zip .
cd ..
```

✅ **Build complete!** Package ready at: `packages/frontend/safecart-frontend-deploy.zip`

---

## Step 3: Upload to cPanel 📤

### A. Access cPanel
1. Go to https://www.namecheap.com
2. **Dashboard** → **Hosting List**
3. Click **"Manage"** next to your hosting
4. Click **"Go to cPanel"** button

### B. Upload Files
1. In cPanel, find and open **"File Manager"**
2. Navigate to **`public_html`** folder
3. **Delete all existing files** in `public_html` (if this is a fresh setup)
   - Select all → Delete
4. Click **"Upload"** button (top menu)
5. Click **"Select File"** and choose:
   `safecart-frontend-deploy.zip`
6. Wait for upload to complete
7. Go back to File Manager
8. Find the zip file → Right-click → **"Extract"**
9. Extract to: `public_html/`
10. Delete the zip file after extraction

### C. Create .htaccess File
1. In `public_html`, click **"+ File"**
2. Name it: `.htaccess`
3. Right-click → **"Edit"**
4. Copy contents from `htaccess-template.txt` (in your repo)
5. Save and close

**Or upload the template file:**
1. Rename `htaccess-template.txt` to `.htaccess`
2. Upload it to `public_html/`

✅ **Files uploaded!**

---

## Step 4: Configure Domain 🌐

### Check DNS Settings

1. In Namecheap Dashboard:
   - **Domain List** → Click **"Manage"** next to safecart.app
   - Go to **"Advanced DNS"** tab

2. Verify these records exist:
   ```
   Type: A Record
   Host: @
   Value: [Your cPanel IP address]
   ```

   ```
   Type: A Record
   Host: www
   Value: [Your cPanel IP address]
   ```

**To find your cPanel IP:**
- In cPanel, look at right sidebar: "Server Information"
- Or check your hosting welcome email

3. If records don't exist or are wrong:
   - Add/Update them
   - Wait 5-60 minutes for DNS propagation

### Enable SSL Certificate

1. In cPanel, search for **"SSL/TLS Status"**
2. Find `safecart.app` and `www.safecart.app`
3. Click **"Run AutoSSL"** next to each domain
4. Wait 5 minutes for certificate installation

✅ **Domain configured!**

---

## Step 5: Test Everything! 🎉

### Test Checklist

1. **Visit your site:**
   ```
   https://safecart.app
   ```

2. **Test pages:**
   - Home page loads ✓
   - Login/Sign up works ✓
   - Dashboard loads ✓
   - Scanner works ✓

3. **Check browser console (F12):**
   - No errors ✓
   - API calls to Render backend working ✓

4. **Test on mobile:**
   - Open on phone
   - Camera/Scanner permission works ✓

5. **Test backend directly:**
   ```bash
   curl https://safecart-backend.onrender.com/health
   ```
   Should return: `{"status":"OK","timestamp":"..."}`

---

## 🐛 Troubleshooting

### Problem: Site shows 404 error
**Solution:**
- Verify `.htaccess` file is in `public_html`
- Check file name is exactly `.htaccess` (with the dot)
- Verify all HTML files extracted properly

### Problem: Styles not loading (plain HTML)
**Solution:**
- Check if `_next/` folder uploaded completely
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Verify file permissions: Files=644, Folders=755

### Problem: "API Error" or backend not responding
**Solution:**
- Check Render backend is running: visit `/health` endpoint
- Verify CORS settings in backend allow your domain
- Check browser console for detailed error

### Problem: SSL certificate not working
**Solution:**
- Wait 10-15 minutes after running AutoSSL
- Force HTTPS in `.htaccess` (already included)
- Contact Namecheap support if still issues

### Problem: Backend "sleeping" (slow first request)
**Solution:**
- This is normal on Render free tier
- Use UptimeRobot.com (free) to ping every 5 minutes
- Or upgrade to Render paid plan ($7/month)

---

## 📊 File Structure After Upload

Your `public_html` should look like:
```
public_html/
├── .htaccess              ← You create this
├── index.html             ← From build
├── dashboard.html         ← From build
├── scanner.html           ← From build
├── login.html             ← From build
├── 404.html               ← From build
├── _next/                 ← From build (complete folder)
│   ├── static/
│   │   ├── chunks/
│   │   ├── css/
│   │   └── media/
│   └── ...
├── manifest.json          ← From build
└── (other files)
```

---

## 🔄 Updating Your App

When you make changes:

### Update Backend (on Render):
1. Push code to GitHub
2. Render auto-deploys (if enabled)
3. Or click "Manual Deploy" in Render dashboard

### Update Frontend (on cPanel):
1. Run build script again:
   ```bash
   ./deploy-to-cpanel.sh
   ```
2. Upload new `safecart-frontend-deploy.zip` to cPanel
3. Extract and replace files

---

## 💡 Tips

1. **Keep backend URL handy** - You'll need it for rebuilds
2. **Bookmark cPanel** - For quick access
3. **Monitor backend** - Check Render logs if issues occur
4. **Test often** - After each deployment
5. **Use Git** - Commit before deploying

---

## 📚 More Resources

- **Full Guide:** `NAMECHEAP_CPANEL_DEPLOYMENT.md`
- **Render Docs:** https://render.com/docs
- **Namecheap Support:** https://www.namecheap.com/support/
- **MongoDB Atlas:** https://cloud.mongodb.com

---

## ✅ Deployment Checklist

- [ ] Backend deployed to Render
- [ ] Backend health check working
- [ ] Frontend built with production config
- [ ] Files uploaded to cPanel public_html
- [ ] .htaccess file created
- [ ] DNS pointing to cPanel
- [ ] SSL certificate installed
- [ ] Site accessible at https://safecart.app
- [ ] Login/signup working
- [ ] Scanner working
- [ ] Tested on mobile

---

## 🎉 You're Done!

Your SafeCart app is now live at **https://safecart.app**

Share it with your users and enjoy! 🚀

---

**Need help?** Check the full guide or ask for support.

