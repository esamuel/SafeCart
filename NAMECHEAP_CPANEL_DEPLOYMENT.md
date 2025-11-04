# SafeCart Deployment to Namecheap cPanel (safecart.app)

## Overview

You have a full-stack application:
- **Backend**: Express + MongoDB API (currently localhost:4000/5002)
- **Frontend**: Next.js React app
- **Database**: MongoDB

## ⚠️ Important: cPanel Limitations

Standard cPanel hosting has significant limitations for Node.js + MongoDB applications:

1. **Node.js Support**: Most cPanel hosting doesn't support Node.js apps (or has limited support)
2. **MongoDB**: cPanel typically doesn't include MongoDB databases
3. **Always-On Services**: Shared hosting can't run persistent Node.js processes
4. **Port Restrictions**: Can't expose custom ports (like 5002/4000)

## 🎯 RECOMMENDED Solution: Hybrid Approach

**Best option for safecart.app:**
- ✅ **Frontend**: Deploy to cPanel (static export)
- ✅ **Backend**: Deploy to Render.com (free tier)
- ✅ **Database**: MongoDB Atlas (free tier - you already have this)

This gives you:
- Your domain (safecart.app) working perfectly
- Professional hosting for backend
- Free hosting for everything
- Better performance and reliability

---

## Option 1: HYBRID DEPLOYMENT (Recommended) ⭐

### Step 1: Deploy Backend to Render.com (FREE)

1. **Sign up at https://render.com** (use GitHub login)

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select: `safecart` repository
   - Branch: `main` (or your current branch)

3. **Configure Service:**
   ```
   Name: safecart-backend
   Region: Oregon (US West) or closest to you
   Root Directory: packages/backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

4. **Add Environment Variables:**
   Click "Environment" tab and add:
   ```
   MONGODB_URI = mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/safecart?retryWrites=true&w=majority
   PORT = 5002
   NODE_ENV = production
   ```

5. **Deploy** (takes 3-5 minutes)
   - You'll get a URL like: `https://safecart-backend.onrender.com`
   - Test it: visit `https://safecart-backend.onrender.com/health`

### Step 2: Build Frontend for Static Export

```bash
# Navigate to frontend
cd /Users/samueleskenasy/safecart/packages/frontend

# Create production .env file
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://safecart-backend.onrender.com
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
EOF

# Build the frontend
npm run build

# This creates the 'out' folder with static files
```

### Step 3: Upload Frontend to Namecheap cPanel

#### A. Access cPanel
1. Log in to Namecheap Dashboard: https://www.namecheap.com
2. Go to **Hosting List** → Click **Manage**
3. Click **Go to cPanel** button

#### B. Upload Files via File Manager
1. In cPanel, open **File Manager**
2. Navigate to `public_html` folder
3. **Delete all existing files** in `public_html` (if fresh setup)
4. Click **Upload** button
5. **Upload ALL files and folders** from:
   `/Users/samueleskenasy/safecart/packages/frontend/out/`

   Upload these items:
   - All `.html` files
   - `_next/` folder (complete with all subfolders)
   - Any other folders from the `out/` directory
   - `manifest.json`
   - Icons/images

#### C. Create .htaccess for Clean URLs
In cPanel File Manager, create a new file in `public_html` called `.htaccess`:

```apache
# Enable mod_rewrite
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Remove www (optional)
RewriteCond %{HTTP_HOST} ^www\.safecart\.app [NC]
RewriteRule ^(.*)$ https://safecart.app/$1 [L,R=301]

# Handle Next.js routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.*)$ $1.html [L]

# Error pages
ErrorDocument 404 /404.html

# Prevent directory browsing
Options -Indexes

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/html "access plus 1 hour"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

### Step 4: Configure DNS for safecart.app

1. **In Namecheap Dashboard:**
   - Go to **Domain List**
   - Click **Manage** next to safecart.app
   - Go to **Advanced DNS** tab

2. **Add/Update DNS Records:**
   ```
   Type: A Record
   Host: @
   Value: [Your cPanel server IP]
   TTL: Automatic

   Type: A Record
   Host: www
   Value: [Your cPanel server IP]
   TTL: Automatic
   ```

   To find your server IP:
   - In cPanel, look at right sidebar "Server Information"
   - Or use terminal: `ping your-hosting-url.com`

3. **Wait for DNS propagation** (5 minutes to 48 hours, usually ~1 hour)

### Step 5: Enable SSL Certificate

1. In cPanel, go to **SSL/TLS Status**
2. Find `safecart.app` and `www.safecart.app`
3. Click **Run AutoSSL** to install free SSL certificate
4. Wait 5-10 minutes for certificate generation

### Step 6: Test Everything! 🎉

1. **Visit https://safecart.app**
   - Should load your app
   - Check browser console for errors

2. **Test Backend Connection:**
   - Open browser console (F12)
   - Try to sign up/login
   - Scanner should connect to Render backend

3. **Test on Mobile:**
   - Open on your phone
   - Test camera/scanner functionality

---

## Option 2: cPanel Node.js App Manager (If Available)

**Check if your Namecheap hosting supports Node.js:**

1. Log in to cPanel
2. Search for "Setup Node.js App" or "Node.js"
3. If available, continue:

### A. Deploy Backend via cPanel Node.js

1. **In cPanel → Setup Node.js App:**
   ```
   Node.js version: 18.x (or latest available)
   Application mode: Production
   Application root: backend
   Application URL: api.safecart.app (or safecart.app/api)
   Application startup file: src/index.js
   ```

2. **Upload Backend Files via File Manager or FTP:**
   - Upload entire `packages/backend/` folder
   - Place in: `/home/yourusername/backend/`

3. **Install Dependencies:**
   - In Node.js App Manager, click "Run NPM Install"
   - Or use Terminal in cPanel:
     ```bash
     cd ~/backend
     npm install
     ```

4. **Set Environment Variables:**
   In Node.js app settings:
   ```
   MONGODB_URI=your-mongodb-atlas-uri
   PORT=5002
   NODE_ENV=production
   ```

5. **Start Application**

### B. Configure Subdomain or Path

**Option A: Subdomain (api.safecart.app)**
1. In cPanel → Subdomains
2. Create: `api` pointing to backend folder
3. Update DNS with A record for `api`

**Option B: Path Proxy (/api)**
Add to `.htaccess`:
```apache
RewriteRule ^api/(.*)$ http://localhost:5002/$1 [P,L]
```

---

## Option 3: Alternative FTP Upload Method

If File Manager is slow, use FTP:

### Setup FTP
1. **In cPanel → FTP Accounts**
2. Create FTP account:
   ```
   Username: safecart-ftp
   Password: [strong password]
   Directory: public_html
   ```

### Use FTP Client (FileZilla)
1. **Download FileZilla:** https://filezilla-project.org/
2. **Connect:**
   ```
   Host: ftp.safecart.app (or IP address)
   Username: safecart-ftp@safecart.app
   Password: [your password]
   Port: 21
   ```
3. **Upload** all files from `packages/frontend/out/` to `public_html/`

---

## Troubleshooting

### Issue 1: 404 Errors on Page Refresh
**Solution:** Verify `.htaccess` is uploaded and contains the rewrite rules above.

### Issue 2: API Calls Failing (CORS)
**Solution:** Make sure your backend CORS settings allow your domain:
```javascript
// In packages/backend/src/index.js
app.use(cors({
  origin: ['https://safecart.app', 'https://www.safecart.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
```

### Issue 3: Styles Not Loading
**Solution:** 
- Check if `_next/` folder uploaded completely
- Verify file permissions (should be 644 for files, 755 for folders)
- Clear browser cache

### Issue 4: Backend Sleeping on Render
**Solution:** Use UptimeRobot (free) to ping your backend every 5 minutes:
1. Sign up at https://uptimerobot.com
2. Add monitor: `https://safecart-backend.onrender.com/health`
3. Check interval: 5 minutes

### Issue 5: MongoDB Connection Failed
**Solution:**
- Verify MongoDB Atlas IP whitelist includes Render IPs
- In MongoDB Atlas → Network Access → Add: `0.0.0.0/0` (allow all)

---

## File Structure After Upload

Your `public_html` should look like:
```
public_html/
├── .htaccess
├── index.html
├── login.html
├── dashboard.html
├── scanner.html
├── 404.html
├── _next/
│   ├── static/
│   │   ├── chunks/
│   │   ├── css/
│   │   └── media/
│   └── ...
├── manifest.json
└── (other static files)
```

---

## Environment Variables Reference

### Backend (.env)
```bash
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/safecart
PORT=5002
NODE_ENV=production
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Frontend (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://safecart-backend.onrender.com
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

---

## Quick Deploy Commands

```bash
# 1. Build frontend with production API URL
cd /Users/samueleskenasy/safecart/packages/frontend
export NEXT_PUBLIC_API_URL=https://safecart-backend.onrender.com
npm run build

# 2. Create zip for easy upload
cd out
zip -r ../frontend-build.zip .
cd ..

# Upload frontend-build.zip to cPanel and extract in public_html

# 3. Test backend
curl https://safecart-backend.onrender.com/health

# 4. Test frontend
open https://safecart.app
```

---

## Updating Your App

When you make changes:

### Update Backend:
1. Push to GitHub
2. Render auto-deploys (if auto-deploy enabled)
3. Or manually trigger deploy in Render dashboard

### Update Frontend:
1. Rebuild locally: `npm run build`
2. Upload new files to cPanel `public_html`
3. Or upload only changed files

---

## Performance Optimization

### 1. Enable Cloudflare (Free CDN)
1. Sign up: https://cloudflare.com
2. Add site: safecart.app
3. Update nameservers at Namecheap
4. Benefits: Faster loading, DDoS protection, free SSL

### 2. Optimize Images
- Compress images before uploading
- Use WebP format
- Enable Cloudflare image optimization

### 3. Monitor Performance
- Google PageSpeed Insights: https://pagespeed.web.dev
- Target: 90+ score

---

## Cost Breakdown

**FREE Tier:**
- ✅ Backend (Render): FREE (with limitations)
- ✅ Database (MongoDB Atlas): FREE (512MB)
- ✅ Frontend (Namecheap): $X/month (your hosting plan)
- ✅ Domain: $X/year (your domain cost)
- ✅ SSL: FREE (via cPanel AutoSSL)

**Paid Upgrades (Optional):**
- Backend (Render Paid): $7/month (no sleep, better performance)
- Database (MongoDB): $9/month (2GB)
- Cloudflare Pro: $20/month (advanced features)

---

## Next Steps

1. ✅ Deploy backend to Render (15 minutes)
2. ✅ Build frontend with production API URL (5 minutes)
3. ✅ Upload to cPanel via File Manager or FTP (10 minutes)
4. ✅ Configure DNS if needed (5 minutes)
5. ✅ Enable SSL certificate (5 minutes)
6. ✅ Test everything (10 minutes)

**Total time: ~50 minutes** ⏱️

---

## Support & Resources

- **Namecheap Support:** https://www.namecheap.com/support/
- **Render Docs:** https://render.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com/
- **Your Existing Guide:** `/DEPLOY_INSTRUCTIONS.md`

---

## Ready to Deploy? Start with Option 1! 🚀

The hybrid approach (Option 1) is the most reliable and gives you the best performance for your full-stack application.

Need help with any step? Let me know!

