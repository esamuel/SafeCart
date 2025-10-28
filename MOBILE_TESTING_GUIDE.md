# Mobile Testing Guide 📱

## Quick Access URLs

### From Your Mobile Device:

**Current Local IP**: `192.168.1.130`

- **Frontend**: http://192.168.1.130:3000
- **Backend API**: http://192.168.1.130:5002/api

---

## Testing Checklist

### ✅ Phase 1: Basic Connectivity

1. **Open SafeCart on Mobile**
   - Open Safari (iOS) or Chrome (Android)
   - Navigate to: `http://192.168.1.130:3000`
   - **Expected**: App loads, shows onboarding or login

2. **Test Navigation**
   - Click through all tabs in bottom navigation
   - **Expected**: All tabs load without errors

3. **Test Settings**
   - Go to Settings tab (⚙️)
   - Toggle tabs on/off
   - Click "Save Changes"
   - **Expected**: Tabs immediately hide/show in navigation

---

### ✅ Phase 2: Scanner Testing

#### Camera Access (HTTP - Expected to Fail)

1. **Navigate to Scanner Tab** (📷)
2. **Read Info Box**:
   - Should see blue box explaining HTTPS requirement
3. **Click "Start Camera"**
   - **Expected Error**: "Camera requires secure connection (HTTPS). Please use manual barcode entry below, or access via HTTPS."
   - **Why**: Mobile browsers require HTTPS for camera
   - **Solution**: Use manual entry (see below)

#### Manual Barcode Entry (Should Work)

1. **Scroll to "Manual Entry" section**
2. **Enter test barcode**: `041220673001`
3. **Click "Scan" button**
4. **Expected Result**:
   - Shows product: "2% Milk"
   - Displays nutrition info (carbs, GI, sugar, GL)
   - Shows "SAFE" badge (green)
   - Shows "Add to Shopping List" button

#### Test More Products:

| Product | Barcode | Expected Result |
|---------|---------|-----------------|
| 2% Milk | 041220673001 | ✅ SAFE |
| Almond Milk | 041570054826 | ✅ SAFE |
| Quinoa | 039978027009 | ✅ SAFE |
| Salmon Fillet | 075283100057 | ✅ SAFE |
| Sweet Potatoes | 042563400044 | ✅ SAFE |

---

### ✅ Phase 3: Shopping Lists

1. **After scanning a product**
   - Click "Add to Shopping List"
   - **Expected**: "✅ Product added to shopping list!"

2. **Navigate to Shopping Lists tab** (📝)
   - Should see your shopping list
   - Product should appear in the list
   - **Test**: Check item, mark as purchased

3. **Create New List**:
   - Click "Create List"
   - Enter name and description
   - Click "Create"
   - **Expected**: New list appears

---

### ✅ Phase 4: Analytics

1. **Navigate to Home tab** (🏠)
2. **Check Quick Stats**:
   - Safety Score
   - Streak
   - Daily Carbs
   - Nutrition chart

3. **Click "View Analytics" button**:
   - Should navigate to Analytics tab
   - Shows detailed charts
   - Shows AI insights
   - Time range filters (7/14/30 days)

4. **Test Analytics Tab Visibility**:
   - Go to Settings → Hide Analytics
   - Go to Home → Click "View Analytics"
   - **Expected**: Analytics still accessible even when hidden

---

### ✅ Phase 5: Meal Planner

1. **Navigate to Meal Planner tab** (📅)
2. **Generate Meal Plan**:
   - Click "Generate 7-Day Plan"
   - **Expected**: Shows 7 days of meals
   - Each day has breakfast, lunch, dinner, snacks

3. **View Recipe Details**:
   - Click on a recipe card
   - **Expected**: Shows full recipe with:
     - Ingredients
     - Nutrition facts
     - Cooking instructions
     - Allergen warnings

4. **Generate Shopping List**:
   - Click "Generate Shopping List from Meal Plan"
   - **Expected**: Creates new shopping list with all ingredients

---

### ✅ Phase 6: Product Discovery

1. **Navigate to Discover tab** (🔍)
2. **Browse Products**:
   - Click "Browse All Products"
   - **Expected**: Shows all 52 products

3. **Filter Products**:
   - Select category (e.g., "Dairy")
   - Select dietary tags (e.g., "Low GI")
   - **Expected**: Products filtered instantly

4. **Search Products**:
   - Enter "milk" in search box
   - **Expected**: Shows all milk products

5. **View Product Details**:
   - Click on a product card
   - **Expected**: Shows full nutrition info, allergens, safety status

---

### ✅ Phase 7: Profile & Settings

1. **Navigate to Settings** (⚙️)
2. **Click "Your Profile"**:
   - Should show health profile
   - Diabetes type
   - Allergies
   - Daily carb budget

3. **Test Tab Visibility**:
   - Hide Community and Inventory
   - Save changes
   - **Expected**: Tabs immediately disappear from navigation

4. **Test Reset**:
   - Click "Reset to Default"
   - **Expected**: All tabs reappear

---

## Mobile-Specific Tests

### Touch Interactions

1. **Tap Targets**:
   - All buttons should be easy to tap (minimum 44px)
   - No accidental taps on nearby elements

2. **Scrolling**:
   - Smooth scrolling on all pages
   - Bottom navigation should stay fixed
   - No content hidden behind navigation

3. **Safe Area**:
   - On iPhone: Check notch area
   - Bottom navigation should respect home indicator

### Performance

1. **Page Load Speed**:
   - All pages should load quickly
   - No long loading spinners

2. **Transitions**:
   - Tab switching should be instant
   - No lag or stutter

---

## Known Issues & Workarounds

### ❌ Camera Access on HTTP

**Issue**: Camera shows error "Camera requires secure connection (HTTPS)"

**Why**: Mobile browsers require HTTPS for camera access

**Workarounds**:
1. ✅ **Manual Entry** (recommended): Use the input field to enter barcodes
2. ✅ **HTTPS Setup**: Use ngrok, Vercel, or SSL certificate
3. ✅ **Desktop Testing**: Camera works on `localhost:3000` from desktop

**Details**: See [MOBILE_CAMERA_FIX.md](MOBILE_CAMERA_FIX.md)

---

## Testing Notes

### What Works on HTTP:
- ✅ All navigation
- ✅ Manual barcode entry
- ✅ Shopping lists
- ✅ Meal planner
- ✅ Product discovery
- ✅ Analytics
- ✅ Settings
- ✅ Profile management
- ✅ All API calls

### What Requires HTTPS:
- ❌ Camera access (getUserMedia API)

### Optional: Quick HTTPS Setup

**For testing camera on mobile, use ngrok**:

```bash
# Terminal 1: Start frontend
cd /Users/samueleskenasy/safecart/packages/frontend
npm run dev

# Terminal 2: Start backend
cd /Users/samueleskenasy/safecart/packages/backend
npm start

# Terminal 3: Create HTTPS tunnel
ngrok http 3000
# Note the HTTPS URL (e.g., https://abc123.ngrok.io)

# Terminal 4: Create backend tunnel
ngrok http 5002
# Update frontend API_URL to this HTTPS backend URL
```

**Then test camera on mobile with HTTPS URL**

---

## Reporting Issues

When reporting issues, please include:

1. **Device**: iPhone 15 / Samsung Galaxy S23 / etc.
2. **Browser**: Safari / Chrome / Firefox
3. **OS Version**: iOS 17.2 / Android 14 / etc.
4. **URL**: http://192.168.1.130:3000 or https://...
5. **Steps**: What you did
6. **Expected**: What should happen
7. **Actual**: What actually happened
8. **Screenshot**: If possible

---

## Success Criteria

### ✅ Core Features Working:
- [x] App loads on mobile
- [x] Navigation works
- [x] Manual barcode scanning works
- [x] Shopping lists work
- [x] Meal planner generates plans
- [x] Analytics shows data
- [x] Settings customizes tabs
- [x] Product discovery filters work

### ⚠️ Known Limitation:
- [ ] Camera (requires HTTPS for mobile)

---

## Current Status

**Ready to Test!**

- ✅ Frontend running on port 3000
- ✅ Backend running on port 5002
- ✅ All features implemented
- ✅ Mobile optimizations applied
- ✅ Error handling improved

**Start Testing**: Open `http://192.168.1.130:3000` on your mobile device now!

---

## Quick Test (2 minutes)

1. Open `http://192.168.1.130:3000` on mobile
2. Navigate to Scanner tab
3. Enter barcode: `041220673001`
4. Click "Scan"
5. Click "Add to Shopping List"
6. Go to Shopping Lists tab
7. Verify product appears

**If all 7 steps work**: ✅ Core functionality confirmed!
