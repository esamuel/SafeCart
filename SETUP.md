# AllergyGuard - Development Setup Guide

## Project Structure

```
safecart/
├── packages/
│   ├── frontend/          # Next.js React app
│   │   ├── src/
│   │   │   ├── app/       # Next.js app directory
│   │   │   ├── components/# React components
│   │   │   └── lib/       # Firebase config
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   └── netlify.toml
│   └── backend/           # Node.js Express API
│       ├── src/
│       │   ├── index.js   # Main server
│       │   ├── models/    # MongoDB schemas
│       │   └── routes/    # API endpoints
│       └── package.json
├── README.md              # Full project documentation
├── QUICKSTART.md          # Quick start guide
└── SETUP.md              # This file
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas cloud)
- Firebase account
- Netlify account (for frontend deployment)

## Installation

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd packages/frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Get your Firebase config from Project Settings
5. Update `packages/frontend/.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB locally, then start it
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update `packages/backend/.env`:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/allergyguard
```

### 4. Backend Configuration

Create `packages/backend/.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/allergyguard
NODE_ENV=development
FIREBASE_PROJECT_ID=your_firebase_project_id
```

## Running Locally

### Terminal 1 - Backend

```bash
cd packages/backend
npm run dev
# Server runs on http://localhost:5000
```

### Terminal 2 - Frontend

```bash
cd packages/frontend
npm run dev
# App runs on http://localhost:3000
```

Visit `http://localhost:3000` in your browser.

## Features Implemented

### Frontend (Next.js)
- ✅ Firebase Authentication (Sign up/Sign in)
- ✅ Dashboard with stats
- ✅ Barcode Scanner interface
- ✅ Shopping List management
- ✅ Meal Planner
- ✅ User Profile
- ✅ Responsive design with Tailwind CSS
- ✅ Lucide icons

### Backend (Node.js + Express)
- ✅ Product API (search, filter, barcode lookup)
- ✅ User API (profile management)
- ✅ Shopping Lists API
- ✅ Auth verification endpoint
- ✅ MongoDB integration
- ✅ CORS enabled

## API Endpoints

### Products
- `GET /api/products` - List products with filters
- `GET /api/products/barcode/:barcode` - Get product by barcode
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product

### Users
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user profile

### Shopping Lists
- `GET /api/shopping-lists/:userId` - Get user's lists
- `POST /api/shopping-lists` - Create new list
- `POST /api/shopping-lists/:listId/items` - Add item to list

### Auth
- `POST /api/auth/verify` - Verify Firebase token

## Deployment

### Frontend (Netlify)

1. Push code to GitHub
2. Connect repo to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Add environment variables in Netlify dashboard
6. Deploy!

### Backend (Heroku or Railway)

**Using Heroku:**
```bash
heroku create allergyguard-api
heroku config:set MONGODB_URI=your_mongodb_uri
git push heroku main
```

**Using Railway:**
1. Connect GitHub repo to Railway
2. Add MongoDB plugin
3. Set environment variables
4. Deploy!

## Next Steps

1. **Database Population**
   - Integrate USDA FoodData Central API
   - Integrate OpenFoodFacts API
   - Populate initial product database

2. **Enhanced Features**
   - Real barcode scanning (camera integration)
   - Meal planning with recipes
   - Blood sugar predictions
   - Store integrations (Instacart, Amazon)

3. **Testing**
   - Add Jest unit tests
   - Add Playwright E2E tests
   - Set up CI/CD pipeline

4. **Mobile App**
   - Convert to React Native
   - Add native camera support
   - Publish to App Store & Google Play

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running (`mongod` command)

### Firebase Auth Error
```
Error: Firebase config not found
```
**Solution:** Check `.env.local` has correct Firebase credentials

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** Change PORT in `.env` or kill process: `lsof -i :5000`

## Development Tips

- Use `npm run dev` for hot reload
- Check browser console for frontend errors
- Check terminal for backend errors
- Use MongoDB Compass to view database
- Use Postman to test API endpoints

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Express Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)

## Support

For issues or questions:
1. Check the README.md for project overview
2. Review QUICKSTART.md for quick reference
3. Check API documentation in backend routes
4. Review component props in frontend components

---

**Happy coding! 🚀**
