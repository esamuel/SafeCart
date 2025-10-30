# Netlify Deployment Troubleshooting

## Current Status

**Site URL:** https://benevolent-puffpuff-64fc65.netlify.app
**Status Badge:** [![Netlify Status](https://api.netlify.com/api/v1/badges/46dca147-a2f6-4a8e-b848-8687eb3e1d83/deploy-status)](https://app.netlify.com/sites/benevolent-puffpuff-64fc65/deploys)

**Issue:** Getting 404 "Not Found" on all routes

---

## Fix Applied

✅ **Pushed fix:** Added `@netlify/plugin-nextjs` plugin to netlify.toml (Commit `67d8d53`)

Netlify should auto-deploy this fix now.

---

## Check These Settings in Netlify Dashboard

Go to: https://app.netlify.com/sites/benevolent-puffpuff-64fc65/deploys

### 1. Check Deploy Branch

**Current deploy should be from:** `feature/add-agents-and-initial-import`

If it's deploying from `main` or `master` instead:
1. Go to **Site settings** → **Build & deploy** → **Continuous deployment**
2. Under **Deploy contexts**, set **Production branch** to: `feature/add-agents-and-initial-import`
3. Save and trigger new deploy

### 2. Check Build Settings

**Should be:**
- **Base directory:** `packages/frontend`
- **Build command:** `npm install && npm run build`
- **Publish directory:** `.next`

If different:
1. Go to **Site settings** → **Build & deploy** → **Build settings**
2. Update to match above
3. Save and trigger new deploy

### 3. Check Environment Variables

**Required variables:**
```
MONGODB_URI = mongodb+srv://samueleskenasy_db_user:JyvgtWrP6p8eEQ1s@cluster0.skixhoz.mongodb.net/safecart?retryWrites=true&w=majority&appName=Cluster0

NODE_ENV = production

NEXT_PUBLIC_API_URL = https://benevolent-puffpuff-64fc65.netlify.app/api
```

Add these in **Site settings** → **Environment variables**

### 4. Trigger Manual Deploy

After verifying settings:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**

---

## Check Deploy Logs

Look for these in the build log:

**✅ Good signs:**
```
✓ Generating static pages
✓ Collecting page data
✓ Finalizing page optimization
✓ Build succeeded
```

**❌ Error signs:**
```
✖ Build failed
Error: Cannot find module
ENOENT: no such file or directory
```

---

## Alternative: Simpler Deployment Without Monorepo

If the monorepo structure is causing issues, we can simplify:

### Option A: Deploy Frontend Only (Point to Existing Backend)

Update netlify.toml:
```toml
[build]
  base = "packages/frontend"
  command = "npm install && npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
  # Point to separate backend (if you deploy backend elsewhere)
  NEXT_PUBLIC_API_URL = "https://your-backend-url.com"
```

### Option B: Move Frontend to Root

Restructure to put frontend at root level (if monorepo is problematic):
```bash
# This would require restructuring
mv packages/frontend/* .
```

---

## Test After Deploy

Once deployed successfully:

```bash
# Test frontend
curl https://benevolent-puffpuff-64fc65.netlify.app

# Test API health endpoint
curl https://benevolent-puffpuff-64fc65.netlify.app/api/health

# Expected: {"status":"OK","timestamp":"..."}
```

---

## Common Issues & Solutions

### Issue: "Not Found" on all routes

**Cause:** Build failed or publish directory is wrong

**Solution:**
1. Check build logs for errors
2. Verify publish directory is `.next`
3. Ensure Next.js plugin is installed
4. Check that branch has latest code

### Issue: API returns 404

**Cause:** Netlify Functions not deploying

**Solution:**
1. Check Functions tab in Netlify dashboard
2. Verify `netlify/functions` directory exists in repo
3. Check function logs for errors
4. Ensure `serverless-http` is installed

### Issue: Build succeeds but site is blank

**Cause:** Environment variables missing

**Solution:**
1. Add `NEXT_PUBLIC_API_URL` environment variable
2. Trigger new deploy
3. Check browser console for errors

### Issue: MongoDB connection fails

**Cause:** IP whitelist or connection string

**Solution:**
1. MongoDB Atlas → Network Access → Allow from Anywhere (0.0.0.0/0)
2. Verify `MONGODB_URI` is correct in environment variables
3. Check Function logs for connection errors

---

## Next Steps After Successful Deploy

1. ✅ Verify https://benevolent-puffpuff-64fc65.netlify.app loads
2. ✅ Test API endpoint: `/api/health`
3. ✅ Test scanner functionality
4. ✅ Configure custom domain (safecart.app)
5. ✅ Test on smartphone

---

## Need More Help?

Check the full deploy log and look for specific error messages. Common places to check:

1. **Netlify Deploy Log** - Build errors
2. **Netlify Functions Log** - API errors
3. **Browser Console** - Frontend errors
4. **MongoDB Atlas** - Connection issues

Copy any error messages and we can debug from there.

---

## Quick Status Check Commands

```bash
# Check if site is up
curl -I https://benevolent-puffpuff-64fc65.netlify.app

# Check API health
curl https://benevolent-puffpuff-64fc65.netlify.app/api/health

# Check function status
curl https://benevolent-puffpuff-64fc65.netlify.app/.netlify/functions/api
```

---

**Current Status:** Waiting for new deploy with Next.js plugin fix

**Last Commit:** `67d8d53` - Added Next.js plugin for Netlify
