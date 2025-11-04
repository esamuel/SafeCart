# 📋 SafeCart Deployment - Quick Reference Card

Print this or keep it handy during deployment!

---

## 🎯 GOAL
Deploy SafeCart from `localhost:4000` → `https://safecart.app`

---

## 📦 THE PLAN

**Backend** → Render.com (FREE)  
**Frontend** → Namecheap cPanel (Your hosting)  
**Database** → MongoDB Atlas (Already set up)

---

## ⚡ 4-STEP DEPLOYMENT

### STEP 1: Deploy Backend (10 min)
```
1. Go to: https://render.com
2. Sign up with GitHub
3. New + → Web Service
4. Select: safecart repo
5. Configure:
   - Root Directory: packages/backend
   - Build: npm install
   - Start: npm start
6. Add Environment Variables:
   - MONGODB_URI = [your-mongodb-uri]
   - PORT = 5002
   - NODE_ENV = production
7. Click "Create Web Service"
8. Copy backend URL: https://XXXX.onrender.com
9. Test: Visit /health endpoint
```

---

### STEP 2: Build Frontend (5 min)
```bash
cd /Users/samueleskenasy/safecart
./deploy-to-cpanel.sh
```

**Enter when prompted:**
- Backend URL: https://XXXX.onrender.com (from Step 1)
- Firebase Key: (press Enter for default)

**Output:** `safecart-frontend-deploy.zip` in packages/frontend/

---

### STEP 3: Upload to cPanel (10 min)
```
1. Go to: https://www.namecheap.com
2. Dashboard → Hosting List → Manage
3. Click "Go to cPanel"
4. Open File Manager
5. Navigate to: public_html
6. Delete all existing files (if fresh)
7. Click Upload
8. Upload: safecart-frontend-deploy.zip
9. Right-click → Extract
10. Create .htaccess file (copy from htaccess-template.txt)
```

---

### STEP 4: Test & Launch (5 min)
```
1. Enable SSL in cPanel (SSL/TLS Status → Run AutoSSL)
2. Visit: https://safecart.app
3. Test login
4. Test scanner
5. Test on mobile
```

---

## 🔑 ENVIRONMENT VARIABLES

### Render Backend:
```
MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/safecart
PORT = 5002
NODE_ENV = production
```

### Frontend Build (auto-created by script):
```
NEXT_PUBLIC_API_URL = https://XXXX.onrender.com
NEXT_PUBLIC_FIREBASE_API_KEY = AIza...
```

---

## 📁 FILES YOU NEED

| File | Location | Use |
|------|----------|-----|
| **deploy-to-cpanel.sh** | Root | Run to build |
| **htaccess-template.txt** | Root | Upload to cPanel |
| **safecart-frontend-deploy.zip** | packages/frontend/ | Upload to cPanel |

---

## 🔗 IMPORTANT URLS

| Service | URL | Username |
|---------|-----|----------|
| **Render** | https://render.com | GitHub |
| **Namecheap** | https://www.namecheap.com | Your account |
| **MongoDB** | https://cloud.mongodb.com | Your account |
| **cPanel** | Via Namecheap → Hosting | Same as Namecheap |

---

## 🆘 TROUBLESHOOTING

### ❌ Backend fails to deploy
- Check MongoDB URI is correct
- Check Render logs in dashboard
- Verify packages/backend exists in repo

### ❌ Build script fails
- Run: `npm install` in packages/frontend
- Check Node.js version: `node -v` (need 18+)
- Make sure backend URL starts with https://

### ❌ Site shows 404
- Check .htaccess file uploaded
- Verify all files extracted in public_html
- Clear browser cache

### ❌ API errors in console
- Verify backend is running (/health endpoint)
- Check NEXT_PUBLIC_API_URL in build
- Check browser console for exact error

### ❌ Styles not loading
- Verify _next/ folder uploaded completely
- Check file permissions (644 for files, 755 for folders)
- Clear browser cache (Ctrl+Shift+R)

---

## ✅ SUCCESS CHECKLIST

- [ ] Backend deployed to Render
- [ ] Backend /health returns {"status":"OK"}
- [ ] Frontend built with deploy script
- [ ] Zip file uploaded to cPanel
- [ ] Files extracted to public_html
- [ ] .htaccess file added
- [ ] SSL certificate enabled
- [ ] DNS pointing to cPanel
- [ ] Site loads at https://safecart.app
- [ ] Login works
- [ ] Scanner works
- [ ] Mobile works

---

## 📊 FILE STRUCTURE (After Upload)

```
public_html/
├── .htaccess          ← Add this manually
├── index.html         ← From zip
├── dashboard.html     ← From zip
├── scanner.html       ← From zip
├── login.html         ← From zip
├── _next/             ← From zip (complete folder)
│   ├── static/
│   │   ├── chunks/
│   │   └── css/
│   └── ...
└── manifest.json      ← From zip
```

---

## 🔄 UPDATE COMMANDS

### Update Backend:
```bash
git push
# Render auto-deploys
```

### Update Frontend:
```bash
./deploy-to-cpanel.sh
# Upload new zip to cPanel
```

---

## 💰 COSTS

| Service | Cost |
|---------|------|
| Render (Free) | $0/month |
| MongoDB Atlas (Free) | $0/month |
| Namecheap Hosting | Your existing plan |
| Domain | Your existing domain |
| SSL Certificate | FREE (AutoSSL) |
| **TOTAL NEW COST** | **$0** |

---

## ⏱️ TIMELINE

| Step | Time | Total |
|------|------|-------|
| Backend Deploy | 10 min | 10 min |
| Frontend Build | 5 min | 15 min |
| cPanel Upload | 10 min | 25 min |
| DNS & SSL | 10 min | 35 min |
| Testing | 5 min | **40 min** |

---

## 🎓 COMMANDS CHEATSHEET

```bash
# Navigate to project
cd /Users/samueleskenasy/safecart

# Run deploy script
./deploy-to-cpanel.sh

# Test backend
curl https://YOUR-BACKEND.onrender.com/health

# Open site
open https://safecart.app

# Check build output
ls -la packages/frontend/out/

# Create zip manually (if needed)
cd packages/frontend/out
zip -r ../safecart-frontend-deploy.zip .
```

---

## 📞 GET HELP

**Full Guides:**
- START_DEPLOYMENT_HERE.md (overview)
- QUICK_DEPLOY_CPANEL.md (step-by-step)
- NAMECHEAP_CPANEL_DEPLOYMENT.md (complete docs)
- DEPLOYMENT_SUMMARY.md (checklist)

**Support:**
- Render: https://render.com/docs
- Namecheap: https://www.namecheap.com/support/
- MongoDB: https://docs.atlas.mongodb.com/

---

## 🚀 READY TO START?

**Run this command:**
```bash
./deploy-to-cpanel.sh
```

**Then follow:** QUICK_DEPLOY_CPANEL.md

---

**Time:** 40 minutes  
**Difficulty:** Easy  
**Cost:** $0 (free tiers)  
**Result:** Live app! 🎉

---

**Version 1.0** | Updated: Nov 1, 2025

