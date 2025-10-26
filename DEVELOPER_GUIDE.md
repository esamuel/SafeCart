# AllergyGuard - Developer Guide

## Welcome! 👋

This guide will help you understand the codebase and contribute effectively to AllergyGuard.

## Project Overview

AllergyGuard is a full-stack web application that helps people with food allergies and diabetes shop safely. It combines:
- **Frontend:** Next.js React app with Firebase authentication
- **Backend:** Node.js Express API with MongoDB
- **Database:** MongoDB for product and user data
- **Hosting:** Netlify (frontend) + Heroku/Railway (backend)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Next.js App)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │  Dashboard   │  │   Scanner    │      │
│  │   Component  │  │  Component   │  │  Component   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Firebase Auth    │
                    │   (Client-side)    │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Express API      │
                    │   (Node.js)        │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │   MongoDB          │
                    │   (Database)       │
                    └────────────────────┘
```

## File Structure

### Frontend (`packages/frontend/`)

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (auth check)
│   └── globals.css         # Global styles
├── components/
│   ├── Auth.tsx            # Login/signup form
│   ├── Dashboard.tsx       # Main app interface
│   ├── Scanner.tsx         # Barcode scanner
│   ├── ShoppingList.tsx    # Shopping list manager
│   ├── MealPlanner.tsx     # Meal planning
│   └── Profile.tsx         # User profile
└── lib/
    └── firebase.ts         # Firebase config
```

### Backend (`packages/backend/`)

```
src/
├── index.js                # Server entry point
├── models/
│   └── Product.js          # MongoDB product schema
└── routes/
    ├── auth.js             # Authentication endpoints
    ├── products.js         # Product CRUD endpoints
    ├── users.js            # User profile endpoints
    └── shoppingLists.js    # Shopping list endpoints
```

## Key Technologies

### Frontend Stack
- **Next.js 14** - React framework with server-side rendering
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Firebase** - Authentication & real-time features
- **Lucide Icons** - Icon library

### Backend Stack
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Firebase Admin** - Server-side auth verification
- **CORS** - Cross-origin requests

## Development Workflow

### 1. Starting Development

```bash
# Terminal 1: Backend
cd packages/backend
npm run dev

# Terminal 2: Frontend
cd packages/frontend
npm run dev
```

### 2. Making Changes

**Frontend Changes:**
1. Edit component in `src/components/`
2. Changes auto-reload at `http://localhost:3000`
3. Check browser console for errors

**Backend Changes:**
1. Edit route in `src/routes/`
2. Server auto-restarts with nodemon
3. Check terminal for errors

### 3. Testing Changes

**Frontend:**
- Test in browser
- Check Network tab for API calls
- Use React DevTools

**Backend:**
- Use Postman to test endpoints
- Check MongoDB Compass for data
- Review server logs

## Common Tasks

### Adding a New API Endpoint

1. Create route file in `packages/backend/src/routes/`
2. Import in `packages/backend/src/index.js`
3. Add route: `app.use('/api/endpoint', require('./routes/endpoint'))`
4. Test with Postman

Example:
```javascript
// packages/backend/src/routes/example.js
const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    res.json({ message: 'Hello' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
```

### Adding a New Component

1. Create file in `packages/frontend/src/components/`
2. Use TypeScript for type safety
3. Import in parent component
4. Add styling with Tailwind classes

Example:
```typescript
// packages/frontend/src/components/Example.tsx
'use client'

import { useState } from 'react'

export default function Example() {
  const [count, setCount] = useState(0)

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <p>Count: {count}</p>
      <button
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Increment
      </button>
    </div>
  )
}
```

### Connecting to API

```typescript
// Frontend example
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
const data = await response.json()
```

### Adding MongoDB Schema

1. Create model in `packages/backend/src/models/`
2. Define schema with Mongoose
3. Export model
4. Use in routes

## Database Schema

### Product Model

```javascript
{
  upc: String (unique),
  name: String,
  brand: String,
  category: String,
  nutrition: {
    servingSize: String,
    calories: Number,
    totalCarbs: Number,
    fiber: Number,
    sugar: Number,
    netCarbs: Number,
    protein: Number,
    fat: Number
  },
  diabetesInfo: {
    glycemicIndex: Number,
    glycemicLoad: Number,
    carbQuality: String
  },
  allergens: {
    contains: [String],
    mayContain: [String],
    processedIn: [String]
  },
  ingredients: [String],
  images: [String],
  stores: [{
    store: String,
    price: Number,
    available: Boolean,
    lastUpdated: Date
  }]
}
```

## Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Backend (`.env`)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/allergyguard
NODE_ENV=development
FIREBASE_PROJECT_ID=...
```

## Debugging

### Frontend Debugging
```javascript
// Add console logs
console.log('Debug:', variable)

// Use React DevTools browser extension
// Check Network tab for API calls
// Check Application tab for localStorage/Firebase
```

### Backend Debugging
```javascript
// Add console logs
console.log('Debug:', variable)

// Use Postman to test endpoints
// Check MongoDB Compass for data
// Use `npm run dev` for auto-restart on changes
```

## Testing

### Manual Testing Checklist
- [ ] Sign up creates new user
- [ ] Sign in with existing user works
- [ ] Scanner finds products
- [ ] Shopping list items add/remove
- [ ] Profile displays correctly
- [ ] API endpoints return correct data

### Automated Testing (Future)
```bash
# Frontend tests
npm run test

# Backend tests
npm run test
```

## Deployment Checklist

### Before Deploying

**Frontend:**
- [ ] All environment variables set
- [ ] No console errors
- [ ] Responsive design tested
- [ ] API endpoints working
- [ ] Build succeeds: `npm run build`

**Backend:**
- [ ] MongoDB connection working
- [ ] All routes tested
- [ ] Error handling in place
- [ ] Environment variables set
- [ ] No security issues

### Deployment Steps

**Frontend to Netlify:**
1. Push to GitHub
2. Connect repo to Netlify
3. Set build command: `npm run build`
4. Set environment variables
5. Deploy!

**Backend to Heroku:**
```bash
heroku create allergyguard-api
heroku config:set MONGODB_URI=...
git push heroku main
```

## Performance Tips

- Use React.memo for expensive components
- Lazy load components with dynamic imports
- Optimize images with Next.js Image component
- Use MongoDB indexes for frequent queries
- Cache API responses when appropriate

## Security Best Practices

- Never commit `.env` files
- Use Firebase for authentication
- Validate all user inputs
- Use HTTPS in production
- Implement rate limiting
- Keep dependencies updated

## Troubleshooting

### Issue: "Cannot find module"
**Solution:** Run `npm install` in the affected package

### Issue: "Firebase config not found"
**Solution:** Check `.env.local` has correct credentials

### Issue: "MongoDB connection refused"
**Solution:** Make sure MongoDB is running or use Atlas

### Issue: "Port already in use"
**Solution:** Kill process or change PORT in `.env`

### Issue: "CORS error"
**Solution:** Check backend has `cors()` middleware

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Getting Help

1. Check the error message carefully
2. Search in documentation
3. Check existing code for examples
4. Review BUILD_STATUS.md for project status
5. Check SETUP.md for configuration issues

## Code Style

- Use TypeScript for type safety
- Follow existing naming conventions
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused
- Use async/await over promises

## Next Steps

1. **Familiarize yourself with the codebase**
   - Read through components
   - Understand API routes
   - Review database schema

2. **Set up your development environment**
   - Install dependencies
   - Configure Firebase
   - Set up MongoDB

3. **Make a small change**
   - Add a new component
   - Modify an existing page
   - Test locally

4. **Deploy your changes**
   - Push to GitHub
   - Deploy to Netlify/Heroku
   - Test in production

---

**Happy coding! 🚀**

For questions, refer to the documentation or check the existing code for examples.
