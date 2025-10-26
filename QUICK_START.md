# SafeCart Quick Start Guide

## 🚀 Running the App

### Start Backend
```bash
cd packages/backend
npm run dev
# Runs on http://localhost:5002
```

### Start Frontend
```bash
cd packages/frontend
npm run dev
# Runs on http://localhost:3003
```

### Seed Database (Optional)
```bash
cd packages/backend
npm run seed
# Adds 8 sample products
```

---

## 🧪 Test the App

### 1. **Sign Up**
- Go to http://localhost:3003
- Click "Sign Up"
- Enter email and password
- Click eye icon to see password
- Submit

### 2. **Test Scanner**
- Click "Scan" tab (📷)
- Enter barcode: `012345678901`
- Click "Scan"
- See Almond Milk product details

### 3. **Available Test Barcodes**
```
012345678901 - Almond Milk
012345678902 - Whole Wheat Bread
012345678903 - Peanut Butter
012345678904 - Coconut Yogurt
012345678905 - Gluten-Free Bread
012345678906 - Chickpea Pasta
012345678907 - Wild Salmon
012345678908 - Organic Spinach
```

### 4. **Test Shopping List**
- Click "Lists" tab (📝)
- Add items
- Check/uncheck items
- See progress bar update

### 5. **Test Profile**
- Click "Profile" tab (👤)
- View user info
- See health profile
- See allergies

---

## 📁 Project Structure

```
safecart/
├── packages/
│   ├── frontend/          # Next.js React app
│   │   ├── src/
│   │   │   ├── app/       # Pages
│   │   │   ├── components/# UI Components
│   │   │   └── lib/       # API client, Firebase
│   │   └── package.json
│   └── backend/           # Express.js API
│       ├── src/
│       │   ├── routes/    # API endpoints
│       │   ├── models/    # MongoDB schemas
│       │   ├── seeds/     # Database seeds
│       │   └── utils/     # Helper functions
│       └── package.json
├── API_INTEGRATION.md     # API documentation
├── IMPLEMENTATION_SUMMARY.md
└── QUICK_START.md         # This file
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify Firebase token

### Users
- `GET /api/users/:userId` - Get profile
- `POST /api/users/:userId/health-profile` - Save health profile
- `PUT /api/users/:userId/preferences` - Update preferences

### Products
- `GET /api/products` - Search products
- `GET /api/products/barcode/:barcode` - Get by barcode
- `POST /api/products/check-safety/:productId` - Check safety

### Shopping Lists
- `GET /api/shopping-lists/user/:userId` - Get all lists
- `POST /api/shopping-lists` - Create list
- `POST /api/shopping-lists/:listId/items` - Add item
- `PUT /api/shopping-lists/:listId/items/:index` - Update item
- `DELETE /api/shopping-lists/:listId/items/:index` - Delete item

---

## 🛠️ Common Tasks

### Add New Product
1. Edit `packages/backend/src/seeds/products.js`
2. Add product object to `sampleProducts` array
3. Run `npm run seed`

### Change API URL
1. Edit `packages/frontend/.env.local`
2. Update `NEXT_PUBLIC_API_URL`
3. Restart frontend

### Add New Component
1. Create file in `packages/frontend/src/components/`
2. Import API from `@/lib/api`
3. Use API calls in useEffect

### Test API Endpoint
```bash
curl http://localhost:5002/api/products/barcode/012345678901
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env`
- Ensure port 5002 is available
- Run `npm install` in backend folder

### Frontend won't start
- Check API URL in `.env.local`
- Ensure backend is running
- Run `npm install` in frontend folder

### Products not found
- Run `npm run seed` to add sample products
- Check MongoDB connection

### Firebase errors
- Verify Firebase credentials in `.env`
- Check `.env.local` for Firebase config

---

## 📚 Documentation Files

- **API_INTEGRATION.md** - Complete API documentation
- **IMPLEMENTATION_SUMMARY.md** - What's been completed
- **README.md** - Project overview
- **QUICK_START.md** - This file

---

## ✅ Completed Features

✅ Authentication (Sign up, Sign in, Forgot password)
✅ Product scanning with barcode lookup
✅ Product database with 8 samples
✅ Shopping list management (UI)
✅ User profile display
✅ Meal planner display
✅ Beautiful purple gradient UI
✅ Responsive design
✅ Loading states
✅ Error handling

---

## ⏳ In Progress

⏳ Shopping list API integration
⏳ User profile API integration
⏳ Meal planner API integration
⏳ Real barcode camera scanning

---

## 🎯 Next Steps

Choose one:
1. **Integrate Shopping List API** - Save lists to database
2. **Integrate User Profile API** - Save health data
3. **Integrate Meal Planner API** - Generate meal plans
4. **Add Real Barcode Scanning** - Use device camera

---

## 💡 Tips

- Use browser DevTools to see API calls
- Check backend console for errors
- Test with provided barcodes first
- Use eye icon to see passwords
- Check "Forgot Password" flow

---

## 📞 Support

If something isn't working:
1. Check the console for errors
2. Verify environment variables
3. Ensure both servers are running
4. Check API_INTEGRATION.md for endpoint details
5. Review IMPLEMENTATION_SUMMARY.md for what's done

---

**Happy Testing! 🎉**
