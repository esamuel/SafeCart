# Deploy SafeCart to Netlify - Quick Start

## ✅ Everything is Ready!

All Netlify configuration is pushed to GitHub. Now you just need to connect it to Netlify.

---

## Deploy Now (5 Minutes)

### 1. Go to Netlify
https://app.netlify.com

### 2. Click "Add new site" → "Import an existing project"

### 3. Choose GitHub and select SafeCart repository

### 4. Configure (should auto-detect from netlify.toml):
- **Branch:** `feature/add-agents-and-initial-import`
- **Base directory:** `packages/frontend`
- **Build command:** `npm install && npm run build`
- **Publish directory:** `.next`

### 5. Add Environment Variables (click "Show advanced"):

```
MONGODB_URI = mongodb+srv://samueleskenasy_db_user:JyvgtWrP6p8eEQ1s@cluster0.skixhoz.mongodb.net/safecart?retryWrites=true&w=majority&appName=Cluster0

NODE_ENV = production
```

### 6. Click "Deploy site"

Wait 2-3 minutes...

### 7. Test Your Deployment

Once deployed, Netlify gives you a URL like: `https://safecart-abc123.netlify.app`

Test the API:
```bash
curl https://YOUR-URL.netlify.app/api/health
```

Expected: `{"status":"OK","timestamp":"..."}`

### 8. Configure safecart.app Domain

In Netlify dashboard:
1. Go to **Domain settings**
2. Click **"Add custom domain"**
3. Enter: `safecart.app`
4. Add DNS records at your registrar (Netlify shows you which ones)
5. Wait 5-60 minutes for DNS propagation

Done! 🎉

---

## What You Get

✅ **Frontend** at https://safecart.app
✅ **Backend API** at https://safecart.app/api/*
✅ **Automatic SSL** certificate
✅ **Global CDN** for fast loading
✅ **Israeli products** ready to scan (10 sample products)

---

## Need Help?

See [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md) for complete guide with troubleshooting.
