# Fix Render Deployment - Quick Guide

## The Problem

Your Render deployment is failing with this error:
```
npm error Lifecycle script `start` failed with error:
npm error code 1
npm error command sh -c node src/index.js
```

## The Cause

The **Root Directory** setting in Render has a **trailing space**: `packages/backend ` (notice the space after "backend"). This is why Render shows:

```
Service Root Directory "/opt/render/project/src/packages/backend " is missing.
```

Render needs the exact path without any trailing spaces: `packages/backend`

## The Solution

### Step 1: Fix Root Directory Setting (Remove Trailing Space!)

1. Go to https://dashboard.render.com
2. Click on **safecart-backend** service
3. Click **Settings** tab (left sidebar)
4. Scroll to **Build & Deploy** section
5. Find **Root Directory** field
6. **IMPORTANT:** Delete any trailing spaces and set it to exactly: `packages/backend`
   - ✅ Correct: `packages/backend`
   - ❌ Wrong: `packages/backend ` (trailing space)
7. Click **Save Changes**

### Step 2: Verify Environment Variables

While in Settings, scroll to **Environment** section and verify:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://samueleskenasy_db_user:JyvgtWrP6p8eEQ1s@cluster0.skixhoz.mongodb.net/safecart?retryWrites=true&w=majority&appName=Cluster0` |
| `NODE_ENV` | `production` |

**Note:** Do NOT set `PORT` - Render sets this automatically.

### Step 3: Clear Cache and Redeploy

1. Click **Manual Deploy** tab (left sidebar)
2. Click **Clear build cache & deploy** button
3. Wait 3-5 minutes for deployment

### Step 4: Verify Deployment

After 3-5 minutes, test the backend:

```bash
curl https://safecart-backend-i7h1.onrender.com/health
```

**Expected Response:**
```json
{"status":"OK","timestamp":"2025-10-30T..."}
```

---

## Alternative Fix (If Step 1 Doesn't Work)

If setting the Root Directory doesn't work, you can modify the build commands instead:

### Option A: Change Build Commands in Render

1. Go to Settings → Build & Deploy
2. Set these values:
   - **Root Directory:** (leave empty)
   - **Build Command:** `cd packages/backend && npm install`
   - **Start Command:** `cd packages/backend && npm start`
3. Save and redeploy

### Option B: Modify package.json

Locally, update [packages/backend/package.json](packages/backend/package.json):

```json
{
  "scripts": {
    "start": "node src/index.js"
  }
}
```

Change to:

```json
{
  "scripts": {
    "start": "cd packages/backend && node src/index.js"
  }
}
```

Then commit and push changes.

---

## Verification Checklist

- [ ] Root Directory is set to `packages/backend`
- [ ] Build Command is `npm install`
- [ ] Start Command is `npm start`
- [ ] `MONGODB_URI` environment variable is set
- [ ] `NODE_ENV` is set to `production`
- [ ] Cache cleared and redeployed
- [ ] Health check returns 200 OK

---

## What Happens After Backend Works?

Once the backend health check returns `{"status":"OK"}`, proceed with:

1. **Deploy Frontend to Vercel** (see [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md))
2. **Configure Frontend Environment Variables**
3. **Set up safecart.app domain**
4. **Test on smartphone**

---

## Need More Help?

See [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md) for complete troubleshooting guide and deployment instructions.
