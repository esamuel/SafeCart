# 📦 Smart Inventory Management - Implementation Spec

## Overview

Smart Inventory Management helps users track pantry, fridge, and freezer items, manage expiration dates, prevent food waste, and automatically generate shopping lists based on inventory levels.

---

## 🎯 Goals

1. **Reduce Food Waste** - Track expiration dates and alert users
2. **Save Money** - Prevent duplicate purchases, use what you have
3. **Auto-Restock** - Generate shopping lists from low inventory
4. **Recipe Integration** - Suggest recipes using expiring ingredients
5. **Health Safety** - Prevent eating expired items (crucial for diabetes/allergies)

---

## 📊 Database Schema

### InventoryItem Model

```javascript
{
  _id: ObjectId,
  userId: String (indexed),
  productId: ObjectId,           // Reference to Product collection

  // Basic Info
  name: String,
  barcode: String,
  category: String,              // Dairy, Produce, Meat, etc.
  brand: String,

  // Quantity & Location
  quantity: Number,
  unit: String,                  // pieces, kg, lbs, oz, liters
  location: String,              // 'pantry', 'fridge', 'freezer'

  // Dates
  purchaseDate: Date,
  expirationDate: Date,
  estimatedDaysToExpire: Number,
  addedAt: Date,
  lastUpdated: Date,

  // Status Flags
  isLow: Boolean,                // Below minimum threshold
  isExpiring: Boolean,           // Expires in < 3 days
  isExpired: Boolean,            // Past expiration

  // Auto-Restock Settings
  minThreshold: Number,          // Restock when below this
  autoAddToList: Boolean,        // Auto-add to shopping list when low

  // Nutrition & Safety (from Product)
  allergens: [String],
  nutritionInfo: {
    calories: Number,
    carbs: Number,
    protein: Number,
    fat: Number,
    fiber: Number
  },

  // Metadata
  notes: String,
  image: String,

  createdAt: Date,
  updatedAt: Date
}
```

### Indexes:
```javascript
{ userId: 1, location: 1 }
{ userId: 1, isExpiring: 1 }
{ userId: 1, isLow: 1 }
{ expirationDate: 1 }
{ category: 1 }
```

---

## 🔌 API Endpoints

### Inventory CRUD

```
POST   /api/inventory
Body: { userId, productId, name, quantity, unit, location, expirationDate }
Response: { item: InventoryItem }
Description: Add item to inventory
```

```
GET    /api/inventory/:userId
Query: ?location=fridge&category=dairy&status=expiring
Response: { items: [InventoryItem], stats: Object }
Description: Get user's inventory with optional filters
```

```
GET    /api/inventory/:userId/:itemId
Response: { item: InventoryItem }
Description: Get single item details
```

```
PUT    /api/inventory/:itemId
Body: { quantity, expirationDate, location }
Response: { item: InventoryItem }
Description: Update item
```

```
DELETE /api/inventory/:itemId
Body: { userId }
Response: { success: Boolean }
Description: Remove item from inventory
```

### Batch Operations

```
POST   /api/inventory/batch
Body: { userId, items: [InventoryItem] }
Response: { added: Number, items: [InventoryItem] }
Description: Add multiple items at once
```

```
PUT    /api/inventory/batch
Body: { updates: [{ itemId, changes }] }
Response: { updated: Number }
Description: Update multiple items
```

### Smart Features

```
GET    /api/inventory/:userId/expiring
Query: ?days=3
Response: { items: [InventoryItem], count: Number }
Description: Get items expiring soon
```

```
GET    /api/inventory/:userId/expired
Response: { items: [InventoryItem], count: Number }
Description: Get expired items
```

```
GET    /api/inventory/:userId/low-stock
Response: { items: [InventoryItem], count: Number }
Description: Get items below minimum threshold
```

```
POST   /api/inventory/:userId/restock-list
Response: { shoppingList: ShoppingList, items: [InventoryItem] }
Description: Generate shopping list from low stock items
```

```
GET    /api/inventory/:userId/use-up-recipes
Query: ?ingredientIds=id1,id2,id3
Response: { recipes: [Recipe] }
Description: Get recipes using expiring ingredients
```

```
GET    /api/inventory/:userId/stats
Response: {
  totalItems: Number,
  totalValue: Number,
  expiringCount: Number,
  expiredCount: Number,
  lowStockCount: Number,
  byLocation: Object,
  byCategory: Object,
  wasteValue: Number
}
Description: Inventory statistics
```

### Barcode Integration

```
POST   /api/inventory/scan
Body: { userId, barcode, quantity, location }
Response: { item: InventoryItem, product: Product }
Description: Scan barcode and add to inventory
```

---

## 🎨 UI Components

### 1. InventoryDashboard.tsx (Main Component)

**Features:**
- Overview cards (Total Items, Expiring Soon, Low Stock)
- Location tabs (All, Pantry, Fridge, Freezer)
- Search and filter
- Sort options
- List/Grid view toggle

**Layout:**
```tsx
<InventoryDashboard>
  <StatsCards />
  <FilterBar />
  <LocationTabs />
  <InventoryList>
    {items.map(item => <InventoryItem key={item._id} item={item} />)}
  </InventoryList>
  <AddButton onClick={openAddModal} />
</InventoryDashboard>
```

### 2. InventoryItem.tsx (Item Card)

**Features:**
- Item name, quantity, location
- Expiration date with color coding
- Edit/Delete actions
- Low stock indicator
- Allergen badges

**Status Colors:**
- 🔴 Red: Expired
- 🟡 Yellow: Expiring soon (< 3 days)
- 🟢 Green: Fresh
- ⚪ Gray: No expiration date

### 3. AddToInventory.tsx (Add/Edit Modal)

**Features:**
- Manual entry or barcode scan
- Product autocomplete search
- Quantity and unit selector
- Location picker
- Expiration date picker
- Smart expiration estimates
- Minimum threshold setting

**Smart Features:**
- Auto-fill product info from database
- Suggest expiration dates by product type
- Remember user preferences

### 4. ExpiringItems.tsx (Alert Widget)

**Features:**
- List of items expiring soon
- Countdown timers
- Quick actions (Use Now, Extend Date, Remove)
- Recipe suggestions button

### 5. LowStockItems.tsx (Restock Widget)

**Features:**
- Items below threshold
- "Add to Shopping List" button
- Adjust threshold option
- Purchase frequency stats

### 6. UseUpRecipes.tsx (Recipe Suggestions)

**Features:**
- Recipes using expiring ingredients
- Ingredient matching score
- Quick add to meal plan
- Save to favorites

### 7. InventoryStats.tsx (Analytics)

**Features:**
- Pie charts by category
- Bar charts by location
- Waste reduction metrics
- Cost savings estimate
- Monthly trends

---

## 🧮 Business Logic

### Expiration Status Calculation

```javascript
function calculateExpirationStatus(item) {
  const now = new Date()
  const expirationDate = new Date(item.expirationDate)
  const daysUntilExpiration = Math.floor((expirationDate - now) / (1000 * 60 * 60 * 24))

  return {
    isExpired: daysUntilExpiration < 0,
    isExpiring: daysUntilExpiration >= 0 && daysUntilExpiration <= 3,
    isFresh: daysUntilExpiration > 3,
    daysRemaining: Math.max(0, daysUntilExpiration),
    urgency: getUrgencyLevel(daysUntilExpiration)
  }
}

function getUrgencyLevel(days) {
  if (days < 0) return 'expired'
  if (days === 0) return 'today'
  if (days === 1) return 'tomorrow'
  if (days <= 3) return 'soon'
  if (days <= 7) return 'week'
  return 'fresh'
}
```

### Auto-Restock Logic

```javascript
function checkAutoRestock(item) {
  if (!item.autoAddToList) return false
  if (!item.minThreshold) return false

  return item.quantity <= item.minThreshold && !item.isExpired
}

async function generateRestockList(userId) {
  const lowStockItems = await InventoryItem.find({
    userId,
    isLow: true,
    isExpired: false,
    autoAddToList: true
  })

  // Create shopping list
  const list = await ShoppingList.create({
    userId,
    name: `Restock - ${new Date().toLocaleDateString()}`,
    items: lowStockItems.map(item => ({
      name: item.name,
      quantity: item.minThreshold - item.quantity + 1,
      unit: item.unit,
      category: item.category,
      productInfo: {
        productId: item.productId,
        barcode: item.barcode
      }
    })),
    source: 'auto-restock'
  })

  return list
}
```

### Smart Expiration Estimates

```javascript
// Default expiration estimates by category
const expirationEstimates = {
  'Dairy': {
    'Milk': 7,
    'Yogurt': 14,
    'Cheese': 21,
    'Butter': 60
  },
  'Produce': {
    'Leafy Greens': 7,
    'Berries': 5,
    'Apples': 30,
    'Bananas': 7,
    'Carrots': 21
  },
  'Meat': {
    'Chicken': 2,
    'Beef': 3,
    'Pork': 3,
    'Fish': 2
  },
  'Bread': 7,
  'Eggs': 35,
  'Condiments': 180,
  'Canned Goods': 730,
  'Frozen Foods': 180
}

function estimateExpirationDate(productName, category, location) {
  const daysToExpire = expirationEstimates[category]?.[productName] ||
                       expirationEstimates[category] ||
                       30 // Default 30 days

  // Adjust for freezer
  if (location === 'freezer') {
    daysToExpire *= 3
  }

  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + daysToExpire)

  return expirationDate
}
```

### Recipe Matching Algorithm

```javascript
async function findRecipesUsingIngredients(userId, ingredientIds) {
  const items = await InventoryItem.find({
    _id: { $in: ingredientIds },
    userId
  })

  const ingredientNames = items.map(item => item.name.toLowerCase())

  // Find recipes with matching ingredients
  const recipes = await Recipe.find({
    'ingredients.name': { $in: ingredientNames }
  })

  // Score recipes by ingredient match
  const scoredRecipes = recipes.map(recipe => {
    const matchingIngredients = recipe.ingredients.filter(ing =>
      ingredientNames.includes(ing.name.toLowerCase())
    )

    const matchScore = matchingIngredients.length / recipe.ingredients.length

    return {
      ...recipe.toObject(),
      matchScore,
      matchingIngredients: matchingIngredients.length,
      totalIngredients: recipe.ingredients.length
    }
  })

  // Sort by match score
  return scoredRecipes.sort((a, b) => b.matchScore - a.matchScore)
}
```

---

## 🔔 Notifications

### Expiration Alerts

**Daily Check (Cron Job):**
```javascript
// Run daily at 8am
cron.schedule('0 8 * * *', async () => {
  const users = await User.find({ notificationsEnabled: true })

  for (const user of users) {
    const expiringItems = await InventoryItem.find({
      userId: user._id,
      isExpiring: true
    })

    if (expiringItems.length > 0) {
      await sendNotification(user, {
        title: `${expiringItems.length} items expiring soon!`,
        body: expiringItems.map(i => i.name).join(', '),
        action: 'VIEW_INVENTORY'
      })
    }
  }
})
```

### Low Stock Alerts

**Weekly Check (Cron Job):**
```javascript
// Run weekly on Sunday at 9am
cron.schedule('0 9 * * 0', async () => {
  const users = await User.find({ autoRestockEnabled: true })

  for (const user of users) {
    const lowStockItems = await InventoryItem.find({
      userId: user._id,
      isLow: true
    })

    if (lowStockItems.length > 0) {
      await sendNotification(user, {
        title: `Time to restock ${lowStockItems.length} items`,
        body: 'Generate shopping list?',
        action: 'GENERATE_RESTOCK_LIST'
      })
    }
  }
})
```

---

## 📱 User Flows

### Flow 1: Add Item to Inventory

```
User opens Inventory tab
  ↓
Clicks "Add Item" button
  ↓
Choose: Manual Entry or Scan Barcode
  ↓
[If Scan] Scan product barcode
  → System fetches product info
  → Auto-fills name, category, allergens
  ↓
[If Manual] Type product name
  → Autocomplete suggests products
  → Select from suggestions
  ↓
Enter quantity and unit
  ↓
Select location (Pantry/Fridge/Freezer)
  ↓
Set expiration date
  → System suggests date based on category
  → User can adjust
  ↓
Optional: Set minimum threshold for auto-restock
  ↓
Click "Add to Inventory"
  ↓
Item appears in inventory list
Success message shown
```

### Flow 2: Handle Expiring Items

```
User receives notification: "3 items expiring soon!"
  ↓
Opens app → Inventory tab
  ↓
Sees "Expiring Soon" alert widget at top
  ↓
Views list of expiring items with countdown
  ↓
For each item, user can:
  → Use Now: Get recipe suggestions
  → Extend Date: Update expiration
  → Mark as Used: Remove from inventory
  → Ignore: Keep in inventory
  ↓
[If Use Now clicked]
  → Shows recipes using that ingredient
  → User selects recipe
  → Adds to meal plan
  → Item marked as "planned to use"
```

### Flow 3: Auto-Restock from Low Inventory

```
System detects 5 items below minimum threshold
  ↓
Sends notification: "5 items need restocking"
  ↓
User opens notification
  ↓
"Generate Shopping List?" prompt
  ↓
User clicks "Generate"
  ↓
System creates new shopping list:
  - Name: "Restock - [Date]"
  - Items: All low stock items
  - Quantities: (threshold - current + buffer)
  ↓
Shopping list opens
  ↓
User can edit quantities
  ↓
Goes shopping with list
  ↓
After purchase, user:
  → Checks off items bought
  → Optionally: Quick add to inventory
```

### Flow 4: Prevent Duplicate Purchase

```
User at grocery store
  ↓
Scans barcode or searches product
  ↓
Product page shows:
  "⚠️ You already have 2 in your pantry"
  ↓
User sees:
  - Current quantity in inventory
  - Location (Pantry)
  - Expiration date
  - "View in Inventory" button
  ↓
User decides:
  → Skip purchase (already have enough)
  → Buy anyway (running low)
  → Check inventory first
```

---

## 🎯 Success Metrics

### Key Metrics to Track:

1. **Food Waste Reduction**
   - Items used before expiration / Total items
   - Estimated waste value prevented
   - Month-over-month improvement

2. **Money Saved**
   - Duplicate purchases prevented
   - Cost of items used vs thrown away
   - Average savings per user

3. **Feature Usage**
   - % users who add items to inventory
   - Average items tracked per user
   - Auto-restock adoption rate

4. **Engagement**
   - Daily active users on Inventory tab
   - Items added per week
   - Notification open rate

5. **Health Impact**
   - Allergen-safe items in inventory
   - Expired items caught before consumption
   - Recipe suggestions used

---

## 🚀 MVP Features (Phase 1)

Focus on core functionality:

✅ **Must Have:**
- Add/edit/delete inventory items
- Track quantity and location
- Expiration date tracking
- Visual status indicators (expired/expiring/fresh)
- Basic filtering and search
- Barcode scan to add
- Inventory statistics

⏳ **Nice to Have (Phase 2):**
- Auto-restock shopping lists
- Recipe suggestions
- Notifications
- Batch operations
- Advanced analytics
- Waste reduction insights

---

## 🎨 UI Mockup

```
┌─────────────────────────────────────────┐
│  Inventory        🔔 (3) expiring       │
├─────────────────────────────────────────┤
│  📊 Quick Stats                          │
│  ┌───────┐ ┌───────┐ ┌───────┐         │
│  │ 42    │ │ 3     │ │ 5     │         │
│  │ Items │ │Expiring│ │ Low  │         │
│  └───────┘ └───────┘ └───────┘         │
├─────────────────────────────────────────┤
│  🔍 Search...              [📷] [+]     │
├─────────────────────────────────────────┤
│  [All] [Pantry] [Fridge] [Freezer]     │
├─────────────────────────────────────────┤
│  🟡 Expiring Soon (3)                   │
│  ┌─────────────────────────────────┐   │
│  │ 🥛 Milk - 2 liters               │   │
│  │ 📍 Fridge  ⏰ Expires in 2 days  │   │
│  │ [Use Now] [Extend] [Delete]      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 🥬 Spinach - 1 bag               │   │
│  │ 📍 Fridge  ⏰ Expires tomorrow   │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  🟢 Pantry (12)                         │
│  ┌─────────────────────────────────┐   │
│  │ 🍝 Pasta - 3 boxes               │   │
│  │ 📍 Pantry  ✓ Fresh               │   │
│  └─────────────────────────────────┘   │
│  ...                                    │
└─────────────────────────────────────────┘
```

---

## 🎉 Ready to Implement!

**Implementation Order:**
1. ✅ Database model (InventoryItem)
2. ✅ API routes (CRUD operations)
3. ✅ Basic UI (list, add, edit, delete)
4. ✅ Expiration tracking
5. ✅ Statistics dashboard
6. ⏳ Auto-restock (Phase 2)
7. ⏳ Recipe suggestions (Phase 2)

**Let's start building!** 🚀
