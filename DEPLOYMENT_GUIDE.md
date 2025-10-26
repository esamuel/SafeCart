# AllergyGuard - Deployment Guide

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Netlify (Frontend)                   │
│  - Next.js static site generation                       │
│  - Automatic deployments from GitHub                    │
│  - CDN for global distribution                          │
└─────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   API Gateway      │
                    │   (CORS enabled)   │
                    └─────────┬──────────┘
                              │
┌─────────────────────────────▼──────────────────────────┐
│              Heroku/Railway (Backend)                  │
│  - Node.js Express server                             │
│  - Automatic scaling                                  │
│  - Environment variables                              │
└─────────────────────────────▬──────────────────────────┘
                              │
┌─────────────────────────────▼──────────────────────────┐
│           MongoDB Atlas (Database)                     │
│  - Cloud-hosted MongoDB                               │
│  - Automatic backups                                  │
│  - Scalable storage                                   │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

- GitHub account
- Netlify account
- Heroku/Railway account
- MongoDB Atlas account
- Firebase project

## Frontend Deployment (Netlify)

### Step 1: Prepare for Deployment

```bash
# Build the project
cd packages/frontend
npm run build

# Test production build locally
npm run start
```

### Step 2: Connect to GitHub

1. Push code to GitHub repository
2. Go to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Select GitHub
5. Authorize Netlify
6. Select your repository

### Step 3: Configure Build Settings

**Build Command:**
```
npm run build
```

**Publish Directory:**
```
.next
```

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://allergyguard-api.herokuapp.com
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### Step 4: Deploy

1. Click "Deploy site"
2. Wait for build to complete
3. Your site is live at `https://your-site-name.netlify.app`

### Step 5: Custom Domain (Optional)

1. Go to Site Settings
2. Click "Change site name" or add custom domain
3. Update DNS records if using custom domain

## Backend Deployment (Heroku)

### Step 1: Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows/Linux
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Create Heroku App

```bash
# Login to Heroku
heroku login

# Create app
heroku create allergyguard-api

# Or use existing app
heroku apps:info allergyguard-api
```

### Step 3: Set Environment Variables

```bash
heroku config:set PORT=5000
heroku config:set MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/allergyguard
heroku config:set NODE_ENV=production
heroku config:set FIREBASE_PROJECT_ID=your_firebase_project_id
```

### Step 4: Deploy

```bash
# From project root
git push heroku main

# Or from backend directory
cd packages/backend
git subtree push --prefix packages/backend heroku main
```

### Step 5: Verify Deployment

```bash
# Check logs
heroku logs --tail

# Test health endpoint
curl https://allergyguard-api.herokuapp.com/health
```

## Backend Deployment (Railway)

### Step 1: Connect GitHub

1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway
5. Select your repository

### Step 2: Configure Environment

1. Go to Variables
2. Add environment variables:
   - `MONGODB_URI`
   - `NODE_ENV=production`
   - `FIREBASE_PROJECT_ID`

### Step 3: Configure Build

1. Go to Settings
2. Set Start Command: `npm run start`
3. Set Build Command: `npm install`

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your API is live at the provided URL

## Database Setup (MongoDB Atlas)

### Step 1: Create Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create organization

### Step 2: Create Cluster

1. Click "Create a Deployment"
2. Select "M0 Shared" (free tier)
3. Choose region (closest to users)
4. Click "Create Deployment"

### Step 3: Create Database User

1. Go to "Database Access"
2. Click "Add New Database User"
3. Create username and password
4. Save credentials securely

### Step 4: Get Connection String

1. Go to "Clusters"
2. Click "Connect"
3. Select "Drivers"
4. Copy connection string
5. Replace `<username>` and `<password>`

### Step 5: Whitelist IP

1. Go to "Network Access"
2. Click "Add IP Address"
3. Add `0.0.0.0/0` (allow all) for development
4. Or add specific IPs for production

## Environment Variables

### Frontend (.env.production)
```
NEXT_PUBLIC_API_URL=https://allergyguard-api.herokuapp.com
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

### Backend (.env.production)
```
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/allergyguard
NODE_ENV=production
FIREBASE_PROJECT_ID=xxx
FIREBASE_PRIVATE_KEY=xxx
FIREBASE_CLIENT_EMAIL=xxx
```

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd packages/frontend && npm install && npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: allergyguard-api
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
          appdir: packages/backend
```

## Monitoring & Logging

### Frontend (Netlify)

1. Go to Analytics
2. View build logs
3. Monitor performance
4. Check error logs

### Backend (Heroku)

```bash
# View logs
heroku logs --tail

# View specific dyno logs
heroku logs --dyno web
```

### Database (MongoDB Atlas)

1. Go to Monitoring
2. View performance metrics
3. Check connection stats
4. Monitor storage usage

## Scaling

### Frontend (Netlify)

- Automatic scaling
- CDN distribution
- No configuration needed

### Backend (Heroku)

```bash
# Scale dynos
heroku ps:scale web=2

# View current dynos
heroku ps
```

### Database (MongoDB Atlas)

1. Go to Cluster Settings
2. Modify cluster tier
3. Upgrade to paid tier for production

## Backup & Recovery

### MongoDB Backups

1. Go to Backup
2. Enable automatic backups
3. Set backup frequency
4. Store in secure location

### Code Backups

- GitHub is your backup
- Enable branch protection
- Require pull request reviews

## Security Checklist

- [ ] Environment variables not in code
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Database credentials secured
- [ ] API keys rotated
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS protection enabled

## Performance Optimization

### Frontend

```bash
# Analyze bundle size
npm run build -- --analyze

# Enable compression
# Already enabled in Next.js
```

### Backend

```javascript
// Add caching headers
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600')
  next()
})
```

### Database

```javascript
// Add indexes for frequently queried fields
db.products.createIndex({ upc: 1 })
db.products.createIndex({ category: 1 })
```

## Troubleshooting

### Deployment Fails

1. Check build logs
2. Verify environment variables
3. Check dependency versions
4. Review error messages

### API Not Responding

1. Check Heroku logs: `heroku logs --tail`
2. Verify MongoDB connection
3. Check firewall rules
4. Restart dyno: `heroku restart`

### Database Connection Error

1. Verify connection string
2. Check IP whitelist
3. Verify credentials
4. Check network connectivity

## Rollback

### Frontend (Netlify)

1. Go to Deploys
2. Click on previous deploy
3. Click "Publish deploy"

### Backend (Heroku)

```bash
# View releases
heroku releases

# Rollback to previous release
heroku releases:rollback
```

## Post-Deployment

1. Test all features
2. Monitor error logs
3. Check performance metrics
4. Verify backups
5. Update documentation
6. Notify users

## Maintenance

### Regular Tasks

- [ ] Check logs daily
- [ ] Monitor performance weekly
- [ ] Update dependencies monthly
- [ ] Review security monthly
- [ ] Backup database weekly
- [ ] Test disaster recovery quarterly

### Update Process

```bash
# Update dependencies
npm update

# Test locally
npm run dev

# Deploy to staging
git push staging main

# Deploy to production
git push main
```

---

**Last Updated:** October 25, 2025
