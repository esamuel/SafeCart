# 🏠 SafeCart - cPanel Only Deployment

**Use this guide ONLY if your cPanel has Node.js support**

Check first: See `CHECK_CPANEL_NODEJS.md`

---

## ✅ Prerequisites

Your cPanel MUST have:
- ✅ "Setup Node.js App" or "Node.js Selector"
- ✅ Node.js 18+ available
- ✅ SSH access (recommended) or File Manager
- ✅ MongoDB connection (using MongoDB Atlas - remote)

---

## 📦 What We'll Deploy

```
cPanel Server
├── /public_html/              ← Frontend (static files)
│   ├── index.html
│   ├── _next/
│   └── .htaccess
│
└── /backend/                  ← Backend (Node.js app)
    ├── src/
    ├── package.json
    ├── start.js
    └── .env
```

**Backend will run on:** subdomain or path (e.g., api.safecart.app)  
**Frontend will be on:** safecart.app

---

## 🚀 Deployment Steps

### Step 1: Build Frontend (5 minutes)

```bash
cd /Users/samueleskenasy/safecart/packages/frontend

# Create production environment
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://api.safecart.app
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
EOF

# Build
npm install
npm run build

# Create zip for upload
cd out
zip -r ../../frontend-deploy.zip .
cd ../..
```

Output: `frontend-deploy.zip` in `/Users/samueleskenasy/safecart/`

### Step 2: Prepare Backend (5 minutes)

```bash
cd /Users/samueleskenasy/safecart/packages/backend

# Create production .env
cat > .env.production << 'EOF'
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/safecart
PORT=5002
NODE_ENV=production
EOF

# Create zip for upload
zip -r ../../backend-deploy.zip . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "*.log"

cd ../..
```

Output: `backend-deploy.zip` in `/Users/samueleskenasy/safecart/`

---

### Step 3: Create Subdomain for API (5 minutes)

1. **In cPanel → Subdomains**
2. **Create Subdomain:**
   ```
   Subdomain: api
   Domain: safecart.app
   Document Root: /home/yourusername/backend/public
   ```
3. **Click "Create"**

Result: `api.safecart.app` will point to your backend

---

### Step 4: Upload Backend (10 minutes)

#### Option A: Using File Manager

1. **In cPanel → File Manager**
2. **Navigate to home directory** (usually `/home/yourusername/`)
3. **Create folder:** `backend`
4. **Upload** `backend-deploy.zip` to `backend/` folder
5. **Right-click → Extract**
6. **Rename** `.env.production` to `.env`

#### Option B: Using SSH (Faster)

```bash
# SCP upload from your local machine
scp backend-deploy.zip yourusername@yourdomain.com:~/backend/

# SSH into server
ssh yourusername@yourdomain.com

# Extract
cd ~/backend
unzip backend-deploy.zip
mv .env.production .env

# Install dependencies
npm install --production
```

---

### Step 5: Configure Node.js App in cPanel (10 minutes)

1. **In cPanel → Setup Node.js App**

2. **Click "Create Application"**

3. **Configure:**
   ```
   Node.js version: 18.x (or latest available)
   Application mode: Production
   Application root: backend
   Application URL: api.safecart.app
   Application startup file: start.js
   Passenger log file: (auto)
   ```

4. **Environment Variables** (click "Add Variable"):
   ```
   MONGODB_URI = mongodb+srv://...
   PORT = 5002
   NODE_ENV = production
   ```

5. **Click "Create"**

6. **cPanel will show commands** - Copy the command that looks like:
   ```bash
   source /home/username/nodevenv/backend/18/bin/activate
   ```

7. **If SSH available**, run in terminal:
   ```bash
   cd ~/backend
   source /home/username/nodevenv/backend/18/bin/activate
   npm install
   ```

8. **Start the application** (usually auto-starts)
   - Or click "Restart" button in Node.js App Manager

---

### Step 6: Configure .htaccess for Backend (5 minutes)

In `backend/public/.htaccess` (create if doesn't exist):

```apache
# Proxy API requests to Node.js app
RewriteEngine On
RewriteRule ^(.*)$ http://127.0.0.1:5002/$1 [P,L]

# Enable CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
```

---

### Step 7: Upload Frontend (10 minutes)

1. **In cPanel → File Manager**
2. **Navigate to** `public_html`
3. **Delete all existing files** (if fresh install)
4. **Upload** `frontend-deploy.zip`
5. **Right-click → Extract**
6. **Delete the zip file**

### Step 8: Create Frontend .htaccess (5 minutes)

In `public_html/.htaccess`:

```apache
# Enable mod_rewrite
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

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
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

### Step 9: Configure DNS (if needed) (5 minutes)

1. **In Namecheap Dashboard → Domain List**
2. **Manage** safecart.app → **Advanced DNS**
3. **Verify/Add records:**
   ```
   Type: A Record
   Host: @
   Value: [Your cPanel IP]
   
   Type: A Record
   Host: api
   Value: [Your cPanel IP]
   
   Type: A Record
   Host: www
   Value: [Your cPanel IP]
   ```

---

### Step 10: Enable SSL (5 minutes)

1. **In cPanel → SSL/TLS Status**
2. **Find:**
   - safecart.app
   - api.safecart.app
   - www.safecart.app
3. **Click "Run AutoSSL"** for each
4. **Wait 5 minutes** for certificates

---

### Step 11: Test Everything! (5 minutes)

#### Test Backend:
```bash
curl https://api.safecart.app/health
```

Should return: `{"status":"OK","timestamp":"..."}`

#### Test Frontend:
Visit: https://safecart.app

#### Test Integration:
1. Sign up / Log in
2. Use scanner
3. Check browser console for errors

---

## 🔄 Keeping Backend Running

### Option 1: Passenger (Auto)
cPanel with Passenger keeps Node.js apps running automatically

### Option 2: PM2 (If available)
```bash
npm install -g pm2
pm2 start start.js --name safecart-backend
pm2 startup
pm2 save
```

### Option 3: Forever
```bash
npm install -g forever
forever start start.js
```

---

## 🐛 Troubleshooting

### Backend not starting?

1. **Check Node.js App Manager logs**
   - cPanel → Setup Node.js App → View Logs

2. **Check error log:**
   ```bash
   tail -f ~/backend/logs/error.log
   ```

3. **Verify Node.js version:**
   ```bash
   node --version  # Should be 18+
   ```

4. **Reinstall dependencies:**
   ```bash
   cd ~/backend
   rm -rf node_modules
   npm install --production
   ```

### API subdomain not working?

1. **Check DNS propagation:** https://dnschecker.org
2. **Verify subdomain created** in cPanel → Subdomains
3. **Check .htaccess** in backend/public/

### CORS errors?

Add to `backend/src/index.js`:
```javascript
app.use(cors({
  origin: ['https://safecart.app', 'https://www.safecart.app'],
  credentials: true
}))
```

### Node.js app keeps stopping?

1. **Check memory limits** (cPanel → Resource Usage)
2. **Upgrade plan** if hitting limits
3. **Consider using PM2** for process management

---

## 💰 Costs

| Component | Cost |
|-----------|------|
| cPanel Hosting | Your existing plan |
| Domain | Your existing domain |
| SSL | FREE (AutoSSL) |
| MongoDB Atlas | FREE (512MB) |
| **TOTAL** | **Your existing hosting** |

---

## 🔄 Updating Your App

### Update Backend:
```bash
# Build new zip locally
cd /Users/samueleskenasy/safecart/packages/backend
zip -r backend-update.zip . -x "node_modules/*"

# Upload to cPanel
# Extract to ~/backend/
# In cPanel Node.js App Manager → Restart
```

### Update Frontend:
```bash
# Rebuild
npm run build

# Create zip
cd out && zip -r ../frontend-update.zip .

# Upload to cPanel public_html/
# Extract and replace files
```

---

## 📊 File Structure on cPanel

```
/home/yourusername/
├── public_html/               ← Frontend (safecart.app)
│   ├── .htaccess
│   ├── index.html
│   ├── dashboard.html
│   ├── _next/
│   └── ...
│
├── backend/                   ← Backend (api.safecart.app)
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   └── models/
│   ├── package.json
│   ├── start.js
│   ├── .env
│   ├── node_modules/
│   └── public/
│       └── .htaccess
│
└── nodevenv/                  ← Node.js environment (auto-created)
    └── backend/
        └── 18/
```

---

## ⚠️ Important Notes

### Memory Limits
Shared hosting has memory limits. Monitor usage:
- cPanel → Resource Usage
- If hitting limits, consider VPS

### Process Management
- cPanel's Passenger manages Node.js automatically
- If app stops, check Resource Usage
- Consider upgrading to VPS for more control

### Performance
- Shared hosting = shared resources
- For high traffic, consider VPS or dedicated
- Current setup fine for low-medium traffic

---

## 🎯 Comparison: cPanel vs Hybrid

| Aspect | cPanel Only | Hybrid (cPanel + Render) |
|--------|-------------|---------------------------|
| **Setup** | More complex | Easier |
| **Cost** | Included | FREE |
| **Performance** | Shared resources | Dedicated backend |
| **Scalability** | Limited | Better |
| **Monitoring** | Manual | Built-in |
| **Logs** | File-based | Dashboard |
| **SSL** | Manual/Auto | Auto |

---

## ✅ Success Checklist

- [ ] Node.js App Manager shows app running
- [ ] `https://api.safecart.app/health` returns OK
- [ ] `https://safecart.app` loads
- [ ] Login works
- [ ] Scanner works
- [ ] No CORS errors in console
- [ ] Works on mobile

---

## 🆘 Still Having Issues?

### Check cPanel Resources:
- cPanel → Resource Usage
- Look for CPU/Memory limits

### Contact Namecheap:
If persistent issues:
> "My Node.js app in Setup Node.js App Manager won't stay running. Can you check server logs and resource limits?"

### Consider Hybrid:
If cPanel Node.js is too limited, the hybrid approach (`QUICK_DEPLOY_CPANEL.md`) works better and is often easier!

---

**Your app should now be fully deployed to cPanel!** 🎉

Visit: https://safecart.app
API: https://api.safecart.app/health

