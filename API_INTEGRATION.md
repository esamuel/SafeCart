# SafeCart API Integration Guide

## Backend API Endpoints

### Authentication
- **POST** `/api/auth/verify` - Verify Firebase token and create/update user in database
  - Request: `{ token: string }`
  - Response: `{ verified: true, user: { id, firebaseId, email, name, healthProfiles } }`

### Users
- **GET** `/api/users/:userId` - Get user profile
  - Response: `{ id, email, name, healthProfiles, preferences }`

- **POST** `/api/users/:userId/health-profile` - Save health profile
  - Request: `{ diabetesType, allergies, targetGlucoseMin, targetGlucoseMax, dailyCarbLimit }`
  - Response: `{ message, healthProfile }`

- **PUT** `/api/users/:userId/preferences` - Update user preferences
  - Request: `{ notifications, darkMode, language }`
  - Response: `{ message, preferences }`

### Products
- **GET** `/api/products` - Search products with filters
  - Query params: `search`, `category`, `allergen`, `maxCarbs`
  - Response: `[{ upc, name, brand, nutrition, diabetesInfo, allergens, ... }]`

- **GET** `/api/products/barcode/:barcode` - Get product by barcode
  - Response: `{ upc, name, brand, nutrition, ... }`

- **GET** `/api/products/:id` - Get product by ID
  - Response: `{ _id, upc, name, brand, nutrition, ... }`

- **POST** `/api/products/check-safety/:productId` - Check if product is safe for user
  - Request: `{ allergies: [string] }`
  - Response: `{ productId, name, safetyStatus, matchedAllergens, recommendations }`

### Shopping Lists
- **GET** `/api/shopping-lists/user/:userId` - Get all shopping lists for user
  - Response: `[{ _id, userId, name, items, status, createdAt, ... }]`

- **GET** `/api/shopping-lists/:listId` - Get single shopping list
  - Response: `{ _id, userId, name, items, status, ... }`

- **POST** `/api/shopping-lists` - Create new shopping list
  - Request: `{ userId, name, description }`
  - Response: `{ _id, userId, name, items, ... }`

- **POST** `/api/shopping-lists/:listId/items` - Add item to list
  - Request: `{ name, quantity, unit, productId }`
  - Response: `{ productId, name, quantity, unit, checked, addedAt }`

- **PUT** `/api/shopping-lists/:listId/items/:itemIndex` - Update item
  - Request: `{ checked, quantity }`
  - Response: `{ productId, name, quantity, unit, checked, ... }`

- **DELETE** `/api/shopping-lists/:listId/items/:itemIndex` - Delete item
  - Response: `{ message }`

- **DELETE** `/api/shopping-lists/:listId` - Delete shopping list
  - Response: `{ message }`

## Frontend API Client

Located in `/src/lib/api.ts`

### Usage Examples

```typescript
import { authAPI, usersAPI, productsAPI, shoppingListsAPI } from '@/lib/api'

// Verify user after Firebase login
const result = await authAPI.verify(firebaseToken)

// Save health profile
await usersAPI.saveHealthProfile(userId, {
  diabetesType: 'Type 1',
  allergies: ['Peanuts', 'Dairy'],
  dailyCarbLimit: 200,
})

// Search products
const products = await productsAPI.search('almond butter', { maxCarbs: 10 })

// Get product by barcode
const product = await productsAPI.getByBarcode('012345678901')

// Check if product is safe
const safety = await productsAPI.checkSafety(productId, ['Peanuts', 'Dairy'])

// Create shopping list
const list = await shoppingListsAPI.create(userId, 'Weekly Shopping')

// Add item to list
await shoppingListsAPI.addItem(listId, {
  name: 'Almond Milk',
  quantity: 2,
  unit: 'liters',
})

// Update item (toggle checked)
await shoppingListsAPI.updateItem(listId, 0, { checked: true })

// Delete item
await shoppingListsAPI.deleteItem(listId, 0)
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5002/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=safecard-8702c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Backend (.env)
```
PORT=5002
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/safecart
NODE_ENV=development
FIREBASE_PROJECT_ID=safecard-8702c
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

## Database Models

### User
- firebaseId (unique)
- email (unique)
- name
- profilePicture
- healthProfiles (array)
- shoppingLists (references)
- savedProducts (references)
- preferences
- createdAt, updatedAt

### Product
- upc (unique)
- name
- brand
- category
- nutrition (carbs, protein, fat, sugar, etc.)
- diabetesInfo (GI, GL, carbQuality)
- allergens (contains, mayContain, processedIn)
- ingredients
- images
- stores (price, availability)
- createdAt, updatedAt

### ShoppingList
- userId (reference)
- name
- description
- items (array with name, quantity, checked, etc.)
- store
- budget
- totalSpent
- status (active, completed, archived)
- sharedWith (references)
- createdAt, updatedAt, completedAt

## Next Steps

1. ✅ Backend API endpoints created
2. ✅ Frontend API client created
3. ⏳ Integrate API calls into frontend components
4. ⏳ Add sample product data to database
5. ⏳ Test all endpoints
6. ⏳ Add error handling and loading states
7. ⏳ Add real barcode scanning
