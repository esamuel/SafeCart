# AllergyGuard - Testing Guide

## Testing Strategy

This guide covers manual testing, automated testing, and deployment verification.

## Manual Testing

### Authentication Flow

**Test Case 1: Sign Up**
1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Enter email: `test@example.com`
4. Enter password: `TestPassword123!`
5. Click "Sign Up"
6. **Expected:** User created, redirected to dashboard

**Test Case 2: Sign In**
1. Navigate to http://localhost:3000
2. Click "Sign In"
3. Enter email: `test@example.com`
4. Enter password: `TestPassword123!`
5. Click "Sign In"
6. **Expected:** User logged in, dashboard displayed

**Test Case 3: Sign Out**
1. Click "Logout" button
2. **Expected:** Redirected to login page

### Dashboard

**Test Case 4: Dashboard Load**
1. Sign in
2. **Expected:** 
   - Dashboard displays
   - Stats cards show: Products Scanned, Safe Products, Meals Planned, Avg GI Score
   - Bottom navigation visible

**Test Case 5: Navigation**
1. Click each tab: Home, Scanner, Shopping, Meals, Profile
2. **Expected:** Each page loads correctly

### Barcode Scanner

**Test Case 6: Product Search**
1. Go to Scanner tab
2. Enter barcode: `012345678901`
3. Click "Scan"
4. **Expected:** Product details displayed with nutrition info

**Test Case 7: Product Not Found**
1. Enter invalid barcode: `999999999999`
2. Click "Scan"
3. **Expected:** Error message or empty state

### Shopping List

**Test Case 8: Add Item**
1. Go to Shopping tab
2. Enter item name: `Eggs`
3. Click "Add"
4. **Expected:** Item appears in list

**Test Case 9: Check Item**
1. Click checkbox next to item
2. **Expected:** Item marked as checked, text strikethrough

**Test Case 10: Delete Item**
1. Click trash icon
2. **Expected:** Item removed from list

### Meal Planner

**Test Case 11: View Meals**
1. Go to Meals tab
2. **Expected:** Weekly meals displayed

**Test Case 12: Add Meal**
1. Click "Add Meal"
2. **Expected:** Meal form opens

### Profile

**Test Case 13: View Profile**
1. Go to Profile tab
2. **Expected:** User email, health profile, allergies displayed

## API Testing

### Using Postman

#### Setup
1. Download [Postman](https://www.postman.com/downloads/)
2. Create new collection: "AllergyGuard"
3. Add environment variable: `base_url = http://localhost:5000`

#### Test Products API

**Get All Products**
```
GET {{base_url}}/api/products
```

**Get Product by Barcode**
```
GET {{base_url}}/api/products/barcode/012345678901
```

**Check Product Safety**
```
POST {{base_url}}/api/products/check-safety/PRODUCT_ID
Body (JSON):
{
  "allergies": ["peanuts", "dairy"]
}
```

**Create Product**
```
POST {{base_url}}/api/products
Body (JSON):
{
  "upc": "012345678901",
  "name": "Test Product",
  "brand": "Test Brand",
  "category": "Spreads",
  "nutrition": {
    "calories": 190,
    "totalCarbs": 6,
    "fiber": 2,
    "sugar": 1,
    "protein": 7,
    "fat": 16
  },
  "allergens": {
    "contains": ["tree nuts"],
    "mayContain": [],
    "processedIn": []
  }
}
```

#### Test Users API

**Get User Profile**
```
GET {{base_url}}/api/users/USER_ID
```

**Update User Profile**
```
PUT {{base_url}}/api/users/USER_ID
Body (JSON):
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

#### Test Shopping Lists API

**Get Shopping Lists**
```
GET {{base_url}}/api/shopping-lists/USER_ID
```

**Create Shopping List**
```
POST {{base_url}}/api/shopping-lists
Body (JSON):
{
  "userId": "USER_ID",
  "name": "Weekly Shopping",
  "description": "Groceries for the week"
}
```

**Add Item to List**
```
POST {{base_url}}/api/shopping-lists/LIST_ID/items
Body (JSON):
{
  "name": "Eggs",
  "quantity": 12,
  "unit": "count"
}
```

#### Test Meals API

**Get User Meals**
```
GET {{base_url}}/api/meals/user/USER_ID
```

**Create Meal**
```
POST {{base_url}}/api/meals
Body (JSON):
{
  "userId": "USER_ID",
  "name": "Breakfast",
  "mealType": "breakfast",
  "date": "2025-10-25T08:00:00Z",
  "nutrition": {
    "calories": 350,
    "carbs": 45,
    "protein": 15,
    "fat": 12
  }
}
```

**Get Nutrition Summary**
```
GET {{base_url}}/api/meals/user/USER_ID/nutrition/2025-10-25
```

## Automated Testing

### Frontend Unit Tests

Create `packages/frontend/src/components/__tests__/Auth.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Auth from '../Auth'

describe('Auth Component', () => {
  it('renders sign in form', () => {
    render(<Auth />)
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })

  it('allows user to toggle between sign in and sign up', async () => {
    render(<Auth />)
    const toggleButton = screen.getByText(/sign up/i)
    await userEvent.click(toggleButton)
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })

  it('validates email input', async () => {
    render(<Auth />)
    const emailInput = screen.getByPlaceholderText(/email/i)
    await userEvent.type(emailInput, 'invalid-email')
    expect(emailInput).toHaveValue('invalid-email')
  })
})
```

### Backend Unit Tests

Create `packages/backend/src/utils/__tests__/allergenChecker.test.js`:

```javascript
const { checkProductSafety, calculateNetCarbs } = require('../allergenChecker')

describe('Allergen Checker', () => {
  it('identifies safe products', () => {
    const product = {
      allergens: {
        contains: ['dairy'],
        mayContain: [],
      }
    }
    const result = checkProductSafety(product, ['peanuts'])
    expect(result.isSafe).toBe(true)
  })

  it('identifies unsafe products', () => {
    const product = {
      allergens: {
        contains: ['peanuts'],
        mayContain: [],
      }
    }
    const result = checkProductSafety(product, ['peanuts'])
    expect(result.isSafe).toBe(false)
    expect(result.matchedAllergens).toContain('peanuts')
  })
})
```

### E2E Tests with Playwright

Create `packages/frontend/e2e/auth.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can sign up', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.click('text=Sign Up')
    await page.fill('input[type="email"]', 'newuser@test.com')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button:has-text("Sign Up")')
    await expect(page).toHaveURL('http://localhost:3000')
  })

  test('user can sign in', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button:has-text("Sign In")')
    await expect(page).toHaveURL('http://localhost:3000')
  })
})
```

## Test Data

### Sample Products

```javascript
const sampleProducts = [
  {
    upc: '012345678901',
    name: 'Almond Butter',
    brand: 'Nature\'s Best',
    category: 'Spreads',
    nutrition: {
      calories: 190,
      totalCarbs: 6,
      fiber: 3,
      sugar: 1,
      protein: 7,
      fat: 16,
      netCarbs: 3
    },
    allergens: {
      contains: ['tree nuts'],
      mayContain: [],
      processedIn: []
    }
  },
  {
    upc: '012345678902',
    name: 'Whole Wheat Bread',
    brand: 'Dave\'s',
    category: 'Bread',
    nutrition: {
      calories: 100,
      totalCarbs: 18,
      fiber: 3,
      sugar: 2,
      protein: 4,
      fat: 1,
      netCarbs: 15
    },
    allergens: {
      contains: ['wheat'],
      mayContain: ['tree nuts'],
      processedIn: ['facility with peanuts']
    }
  }
]
```

## Performance Testing

### Load Testing with k6

Create `packages/backend/load-test.js`:

```javascript
import http from 'k6/http'
import { check } from 'k6'

export let options = {
  vus: 10,
  duration: '30s',
}

export default function () {
  let response = http.get('http://localhost:5000/api/products')
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  })
}
```

Run: `k6 run load-test.js`

## Deployment Testing

### Pre-Deployment Checklist

**Frontend:**
- [ ] All components render without errors
- [ ] Authentication works
- [ ] API calls succeed
- [ ] Responsive design on mobile/tablet/desktop
- [ ] No console errors
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables set

**Backend:**
- [ ] All routes tested with Postman
- [ ] MongoDB connection works
- [ ] Error handling works
- [ ] CORS enabled
- [ ] No security vulnerabilities
- [ ] Logs are clean

### Staging Deployment Test

1. Deploy to staging environment
2. Run full manual test suite
3. Run automated tests
4. Load test with k6
5. Security scan
6. Performance profiling

## Continuous Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run frontend tests
        run: cd packages/frontend && npm run test
      
      - name: Run backend tests
        run: cd packages/backend && npm run test
      
      - name: Build frontend
        run: cd packages/frontend && npm run build
```

## Test Coverage Goals

- **Frontend:** 80% coverage
- **Backend:** 85% coverage
- **E2E:** All critical user flows

## Bug Reporting

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots/videos
5. Browser/OS version
6. Error logs

## Performance Benchmarks

- Page load: < 2 seconds
- API response: < 200ms
- Database query: < 100ms
- Barcode scan: < 1 second

---

**Last Updated:** October 25, 2025
