# Quick Deploy Checklist for safecart.app

## 🚀 3 Steps to Deploy

### Step 1: Deploy Backend (Render.com)
1. Go to https://render.com
2. Sign up with GitHub
3. New + → Web Service → Connect SafeCart repo
4. Settings:
   - Root Directory: `packages/backend`
   - Build: `npm install`
   - Start: `npm start`
5. Add env vars:
   - `MONGODB_URI` = (your connection string)
   - `PORT` = `5002`
6. Click Deploy
7. Get URL: `https://safecart-backend.onrender.com`

### Step 2: Deploy Frontend (Vercel)
```bash
cd /Users/samueleskenasy/safecart/packages/frontend
npx vercel login
npx vercel --prod
```
Get URL like: `https://safecart-xyz.vercel.app`

### Step 3: Configure Domain
1. Vercel Dashboard → Settings → Domains
2. Add: `safecart.app`
3. Update DNS at your registrar:
   - A record: `@` → `76.76.21.21`
   - CNAME: `www` → `cname.vercel-dns.com`

## Test URLs

- Backend: https://safecart-backend.onrender.com/health
- Frontend: https://safecart.app
- Test barcodes:
  - 049000000443 (Coca-Cola USA)
  - 7290000068 (Bamba Israel)

## Done! 🎉

Your app is live on `https://safecart.app`

See DEPLOY_INSTRUCTIONS.md for full details.
