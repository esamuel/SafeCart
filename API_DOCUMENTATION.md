# AllergyGuard - API Documentation

## Base URL

```
Development: http://localhost:5000
Production: https://allergyguard-api.herokuapp.com
```

## Authentication

All endpoints (except `/health`) require Firebase authentication token in header:

```
Authorization: Bearer <firebase_token>
```

## API Endpoints

### Products

#### Get All Products
```
GET /api/products
```

**Query Parameters:**
- `search` (string) - Search by name or brand
- `category` (string) - Filter by category
- `allergen` (string) - Exclude products with allergen
- `maxCarbs` (number) - Maximum net carbs

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "upc": "012345678901",
    "name": "Almond Butter",
    "brand": "Nature's Best",
    "category": "Spreads",
    "nutrition": {
      "calories": 190,
      "totalCarbs": 6,
      "netCarbs": 3,
      "sugar": 1
    }
  }
]
```

#### Get Product by Barcode
```
GET /api/products/barcode/:barcode
```

**Response:** Single product object

#### Get Product by ID
```
GET /api/products/:id
```

**Response:** Single product object

#### Check Product Safety
```
POST /api/products/check-safety/:productId
```

**Request Body:**
```json
{
  "allergies": ["peanuts", "dairy"]
}
```

**Response:**
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "name": "Almond Butter",
  "safetyStatus": "safe",
  "matchedAllergens": [],
  "mayContainAllergens": ["tree nuts"],
  "recommendations": "Safe to consume"
}
```

#### Create Product
```
POST /api/products
```

**Request Body:**
```json
{
  "upc": "012345678901",
  "name": "Product Name",
  "brand": "Brand Name",
  "category": "Category",
  "nutrition": {
    "calories": 100,
    "totalCarbs": 10,
    "fiber": 2,
    "sugar": 5,
    "protein": 5,
    "fat": 3
  },
  "allergens": {
    "contains": ["dairy"],
    "mayContain": ["tree nuts"],
    "processedIn": ["facility with peanuts"]
  }
}
```

#### Update Product
```
PUT /api/products/:id
```

**Request Body:** Same as create

---

### Users

#### Get User Profile
```
GET /api/users/:userId
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "healthProfiles": [
    {
      "profileId": "profile1",
      "name": "My Profile",
      "diabetes": {
        "type": "type1",
        "targetGlucoseMin": 80,
        "targetGlucoseMax": 130,
        "dailyCarbLimit": 200
      },
      "allergies": [
        {
          "allergen": "peanuts",
          "severity": "severe"
        }
      ]
    }
  ]
}
```

#### Update User Profile
```
PUT /api/users/:userId
```

**Request Body:**
```json
{
  "name": "John Doe",
  "healthProfiles": [
    {
      "profileId": "profile1",
      "name": "My Profile",
      "diabetes": {
        "type": "type1",
        "targetGlucoseMin": 80,
        "targetGlucoseMax": 130,
        "dailyCarbLimit": 200
      },
      "allergies": [
        {
          "allergen": "peanuts",
          "severity": "severe"
        }
      ]
    }
  ]
}
```

---

### Shopping Lists

#### Get User's Shopping Lists
```
GET /api/shopping-lists/:userId
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "name": "Weekly Shopping",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439013",
        "name": "Eggs",
        "quantity": 12,
        "unit": "count",
        "checked": false
      }
    ],
    "status": "active",
    "createdAt": "2025-10-25T10:00:00Z"
  }
]
```

#### Create Shopping List
```
POST /api/shopping-lists
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "name": "Weekly Shopping",
  "description": "Groceries for the week"
}
```

#### Add Item to List
```
POST /api/shopping-lists/:listId/items
```

**Request Body:**
```json
{
  "name": "Eggs",
  "quantity": 12,
  "unit": "count"
}
```

---

### Meals

#### Get User's Meals
```
GET /api/meals/user/:userId
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "name": "Breakfast",
    "mealType": "breakfast",
    "date": "2025-10-25T08:00:00Z",
    "nutrition": {
      "calories": 350,
      "carbs": 45,
      "protein": 15,
      "fat": 12,
      "netCarbs": 40
    },
    "allergens": [],
    "bloodSugarImpact": {
      "predicted": 120,
      "actual": null,
      "recorded": false
    }
  }
]
```

#### Get Meals by Date Range
```
GET /api/meals/user/:userId/range?startDate=2025-10-01&endDate=2025-10-31
```

**Response:** Array of meals

#### Create Meal
```
POST /api/meals
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "name": "Breakfast",
  "mealType": "breakfast",
  "date": "2025-10-25T08:00:00Z",
  "ingredients": [
    {
      "name": "Eggs",
      "quantity": 2,
      "unit": "count"
    }
  ],
  "nutrition": {
    "calories": 350,
    "carbs": 45,
    "protein": 15,
    "fat": 12
  }
}
```

#### Update Meal
```
PUT /api/meals/:id
```

**Request Body:** Same as create

#### Delete Meal
```
DELETE /api/meals/:id
```

#### Get Nutrition Summary for Date
```
GET /api/meals/user/:userId/nutrition/:date
```

**Response:**
```json
{
  "date": "2025-10-25",
  "totalCalories": 1800,
  "totalCarbs": 200,
  "totalProtein": 100,
  "totalFat": 60,
  "totalFiber": 30,
  "totalSugar": 45,
  "meals": 3
}
```

---

### Authentication

#### Verify Token
```
POST /api/auth/verify
```

**Request Body:**
```json
{
  "token": "firebase_token"
}
```

**Response:**
```json
{
  "verified": true
}
```

---

### Health Check

#### Server Status
```
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-25T10:00:00Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

- 100 requests per minute per user
- 1000 requests per hour per user

---

## Pagination

For list endpoints, use query parameters:

```
GET /api/products?page=1&limit=20
```

---

## Filtering & Sorting

### Filtering
```
GET /api/products?category=spreads&maxCarbs=10
```

### Sorting
```
GET /api/products?sort=name&order=asc
```

---

## Utilities

### Allergen Checker
```javascript
const { checkProductSafety } = require('./utils/allergenChecker')

const safety = checkProductSafety(product, ['peanuts', 'dairy'])
// Returns: { isSafe, matchedAllergens, mayContainAllergens, severity }
```

### Nutrition Calculator
```javascript
const { calculateNetCarbs, estimateBloodSugarImpact } = require('./utils/nutritionCalculator')

const netCarbs = calculateNetCarbs(45, 5) // 40
const impact = estimateBloodSugarImpact(70, 28) // 'moderate'
```

---

## WebSocket Events (Future)

Real-time updates for:
- Shopping list changes
- Meal logging
- Blood sugar notifications
- Product availability

---

## Webhook Events (Future)

- `product.updated` - Product information changed
- `user.profile.updated` - User profile changed
- `meal.logged` - Meal added to diary
- `shopping.list.shared` - List shared with user

---

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios')

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

// Get products
const products = await api.get('/products?search=almond')

// Check safety
const safety = await api.post('/products/check-safety/productId', {
  allergies: ['peanuts']
})
```

### Python
```python
import requests

headers = {'Authorization': f'Bearer {token}'}

# Get products
response = requests.get(
  'http://localhost:5000/api/products',
  params={'search': 'almond'},
  headers=headers
)
products = response.json()
```

---

## Support

For API issues or questions:
1. Check this documentation
2. Review error messages
3. Check server logs
4. Contact support

---

**Last Updated:** October 25, 2025
