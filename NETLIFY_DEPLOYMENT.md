# Deploy SafeCart to Netlify

## Why Netlify Instead of Render?

Netlify is simpler for full-stack apps because it handles both frontend and backend (via Functions) in a single deployment. You said it works smoothly for your other projects, so let's use it!

---

## What I've Set Up

✅ **[netlify.toml](netlify.toml)** - Netlify configuration file
✅ **[netlify/functions/api.js](netlify/functions/api.js)** - Backend API as Netlify Function
✅ **[netlify/functions/package.json](netlify/functions/package.json)** - Dependencies for Functions

---

## Deploy to Netlify (Step-by-Step)

### Step 1: Push Code to GitHub

First, commit and push the new Netlify configuration:

```bash
cd /Users/samueleskenasy/safecart
git add netlify.toml netlify/
git commit -m "feat: add Netlify deployment configuration"
git push origin feature/add-agents-and-initial-import
```

### Step 2: Connect to Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub**
4. Select your **SafeCart** repository
5. Select branch: **feature/add-agents-and-initial-import** (or main/master)

### Step 3: Configure Build Settings

Netlify should auto-detect the settings from `netlify.toml`, but verify:

**Build settings:**
- **Base directory:** `packages/frontend`
- **Build command:** `npm install && npm run build`
- **Publish directory:** `.next`
- **Functions directory:** `netlify/functions`

Click **"Show advanced"** and add environment variables:

### Step 4: Add Environment Variables

Click **"Add environment variables"** and add these:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://samueleskenasy_db_user:JyvgtWrP6p8eEQ1s@cluster0.skixhoz.mongodb.net/safecart?retryWrites=true&w=majority&appName=Cluster0` |
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | (leave empty for now - we'll set it after first deploy) |

### Step 5: Deploy!

Click **"Deploy site"**

Netlify will:
1. Build your frontend (Next.js)
2. Build your backend Functions
3. Deploy everything together
4. Give you a URL like: `https://safecart-abc123.netlify.app`

This takes 2-3 minutes.

---

## After First Deploy

### Step 6: Update API URL

Once deployed, you'll get a URL like `https://safecart-abc123.netlify.app`

1. Go to **Site settings** → **Environment variables**
2. Add or update:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://safecart-abc123.netlify.app/api` (use YOUR actual URL)
3. Click **Save**
4. Go to **Deploys** → **Trigger deploy** → **Deploy site**

### Step 7: Test the Deployment

```bash
# Test health endpoint
curl https://safecart-abc123.netlify.app/api/health

# Expected response:
{"status":"OK","timestamp":"2025-10-30T..."}
```

### Step 8: Configure Custom Domain (safecart.app)

1. In Netlify dashboard, go to **Domain settings**
2. Click **"Add custom domain"**
3. Enter: `safecart.app`
4. Netlify will show you DNS records to add

**Add these DNS records at your domain registrar:**

```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: safecart-abc123.netlify.app
```

5. Wait 5-60 minutes for DNS to propagate
6. Netlify will automatically provision SSL certificate

### Step 9: Update API URL for Custom Domain

Once custom domain is active:

1. **Environment variables** → Update:
   - `NEXT_PUBLIC_API_URL` → `https://safecart.app/api`
2. **Trigger deploy** to rebuild with new URL

---

## How It Works

### Frontend + Backend in One

Netlify hosts your entire app:
- **Frontend:** Next.js app at `https://safecart.app`
- **Backend API:** Netlify Functions at `https://safecart.app/api/*`

### API Routes

Your backend routes are accessible as:
```
https://safecart.app/api/health
https://safecart.app/api/scanner/scan
https://safecart.app/api/products
https://safecart.app/api/users
... etc
```

The `netlify.toml` file redirects all `/api/*` requests to Netlify Functions.

### Database

MongoDB Atlas connection stays the same - the Function connects to your existing database.

---

## Advantages vs Render

✅ **Single deployment** - Frontend + Backend together
✅ **Faster builds** - Netlify's build system is very fast
✅ **Better DX** - Simpler configuration
✅ **Free tier** - More generous than Render
✅ **Auto SSL** - Automatic HTTPS for custom domains
✅ **CDN** - Global CDN for fast loading
✅ **Preview deploys** - Every PR gets a preview URL

---

## Troubleshooting

### Build Fails

Check the build logs in Netlify dashboard:
- Look for `npm install` errors
- Check for missing dependencies
- Verify `NODE_VERSION` in netlify.toml

### Functions Don't Work

Check function logs:
- Go to **Functions** tab in Netlify
- Click on `api` function
- View recent invocations and errors

### Database Connection Issues

Verify `MONGODB_URI` environment variable:
- Must start with `mongodb+srv://`
- Must include database name
- Check MongoDB Atlas for IP whitelist (Netlify IPs vary)

**MongoDB Atlas Fix:**
1. Go to MongoDB Atlas → Network Access
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Save

### API Returns 404

Check these:
1. Function deployed correctly (check **Functions** tab)
2. Routes are correct in `netlify/functions/api.js`
3. Redirects are set in `netlify.toml`

---

## Testing Locally (Optional)

To test Netlify Functions locally:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Link to your Netlify site
netlify link

# Set environment variables
netlify env:import .env

# Run dev server
netlify dev
```

This starts:
- Frontend at http://localhost:3000
- Functions at http://localhost:3000/.netlify/functions/api

---

## Next Steps After Successful Deploy

1. ✅ Test all API endpoints
2. ✅ Test scanner on smartphone
3. ✅ Verify Hebrew text displays correctly
4. ✅ Test Israeli barcode scanning
5. ✅ Optional: Run full Israeli product import (50K+ products)

---

## Success Checklist

- [ ] Code pushed to GitHub
- [ ] Connected to Netlify
- [ ] Environment variables added
- [ ] First deployment successful
- [ ] Health check returns 200 OK
- [ ] API endpoints working
- [ ] Custom domain (safecart.app) configured
- [ ] SSL certificate active
- [ ] Tested on smartphone
- [ ] Scanner works with Israeli products

---

## Support

If you encounter any issues:
1. Check Netlify build logs
2. Check function logs
3. Check browser console for frontend errors
4. Test API endpoints with curl

Netlify docs: https://docs.netlify.com
