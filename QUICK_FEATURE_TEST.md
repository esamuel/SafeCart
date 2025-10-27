# 🧪 Quick Feature Testing Guide

## Getting Started
1. Make sure both backend and frontend are running
2. Navigate to http://localhost:3000
3. Create a new account or sign in

---

## Feature 1: User Health Profile Onboarding ✅

### What to Test
- 3-step onboarding wizard on first login
- Profile data persistence
- Automatic profile check

### Steps:
1. **Create new account** or sign in as first-time user
2. **Onboarding appears** - You should see a 3-step form
3. **Step 1: Personal Info**
   - Enter name: "John Doe"
   - Age: 35
   - Height: 175 cm
   - Weight: 80 kg
   - Click "Next"
4. **Step 2: Diabetes Info**
   - Diabetes Type: Select "Type 1"
   - Target Glucose Min: 80
   - Target Glucose Max: 130
   - Daily Carb Limit: 200
   - Toggle "I use insulin" to ON
   - Click "Next"
5. **Step 3: Allergies**
   - Select: Peanuts, Tree Nuts, Milk
   - Click "Complete Setup"
6. **Dashboard appears** - Profile saved! ✅
7. **Refresh page** - Profile still there after reload ✅

### Success Criteria
- [ ] Onboarding shows on first login
- [ ] All 3 steps work
- [ ] Progress indicator shows 3 dots
- [ ] Profile persists after refresh
- [ ] No errors in browser console

---

## Feature 2: Shopping List Persistence 📝

### What to Test
- Create multiple shopping lists
- Add/remove items
- Track quantities
- Toggle completion
- Data persists

### Steps:
1. **Click "Lists" tab** (bottom navigation)
2. **Create new list**
   - Click "+ New List" button
   - Enter name: "Weekly Shopping"
   - Click "Create"
3. **Add items**
   - Enter "Almond Milk"
   - Click "Add"
   - Add more items: "Eggs", "Bread", "Chicken"
4. **Manage items**
   - Click checkmark to toggle "Eggs" as complete ✓
   - Increase quantity of "Almond Milk": click +
   - Delete "Bread": click trash icon
5. **Create second list**
   - Click "+ New List" again
   - Name it: "Farmers Market"
   - Add different items
6. **Switch between lists**
   - Click on "Weekly Shopping" button
   - Then click on "Farmers Market" button
   - Verify each list shows its own items
7. **Refresh page** - All lists still there! ✅

### Success Criteria
- [ ] Multiple lists can be created
- [ ] Items persist in each list
- [ ] Completion toggle works
- [ ] Quantities can be adjusted
- [ ] Items can be deleted
- [ ] Lists persist after page refresh
- [ ] No data loss on reload

---

## Feature 3: Product Search & Discovery 🔍

### What to Test
- Search functionality
- Multiple filters
- Product details display
- Allergen warnings

### Steps:
1. **Click "Profile" tab** (bottom navigation)
   - Or look for "Discover" tab if available
2. **Search for a product**
   - Type: "almond milk"
   - Click "Search" button
   - See results appear
3. **Try filters**
   - Click "Filters" button
   - Category: Select "Dairy"
   - Avoid Allergens: Check "Milk"
   - Search again
4. **Review product card**
   - Product name and brand visible
   - Nutrition info shown (Carbs, Protein, etc.)
   - GI/GL scores displayed
   - Allergens highlighted in red if present
   - "✓ Safe" or "⚠ Check Labels" badge shown
5. **Try different searches**
   - Search: "gluten free" → See bread products
   - Search: "salmon" → See fish products
   - Search: "yogurt" → See dairy products
6. **Try carb filter**
   - Enter max carbs: 10
   - Search: "low carb"
   - See only products with <10g carbs
7. **Favorite products**
   - Click heart icon on product card
   - Heart turns red

### Success Criteria
- [ ] Search returns relevant products
- [ ] Filters apply correctly
- [ ] Nutrition info displays
- [ ] Allergens show with warnings
- [ ] GI/GL scores visible
- [ ] No crashes or errors
- [ ] Loading state appears during search

---

## Feature 4: Barcode Scanner (Camera) 📷

### What to Test
- Camera access
- Manual barcode entry
- Product lookup
- Add to shopping list

### Steps - Camera Method:
1. **Click "Scan" tab** (bottom navigation)
2. **Start camera**
   - Click "Start Camera" button
   - **Grant camera permission** when prompted
   - Video feed should appear
   - You'll see: "Point camera at barcode"
3. **Test with real barcode** (if available)
   - Point phone at a product barcode
   - You should see the product details appear
   - Note: Actual barcode scanning requires additional library
4. **Stop camera**
   - Click "Stop Camera" to close video feed

### Steps - Manual Entry Method (Test Data):
1. **In the manual entry box**, type a test barcode:
   - `012345678901` (Almond Milk)
   - Click "Scan" button
2. **Product details appear**:
   - Product name: "Almond Milk"
   - Barcode: 012345678901
   - Green "✓ SAFE" badge
   - Nutrition info (carbs, GI, GL, sugar)
   - Allergens if any
3. **Add to shopping list**
   - Click "Add to Shopping List" button
   - Product should appear in your shopping list
4. **Try other test barcodes**:
   - `012345678902` - Whole Wheat Bread
   - `012345678903` - Peanut Butter
   - `012345678904` - Coconut Yogurt
   - `012345678907` - Wild Salmon
5. **Test error case**
   - Type: `999999999999` (fake barcode)
   - Click "Scan"
   - Should see error: "Product not found"

### Success Criteria - Camera
- [ ] Camera permission request appears
- [ ] Video feed shows in preview
- [ ] Camera can be started and stopped
- [ ] No errors in console
- [ ] Permission handling works

### Success Criteria - Scanner
- [ ] Manual barcode entry works
- [ ] Product details display correctly
- [ ] Test barcodes find products
- [ ] "Add to Shopping List" button works
- [ ] Error message on invalid barcode
- [ ] No crashes with invalid input

---

## All Features Complete Test

After testing each feature individually:

1. **Create account** → Onboarding (Feature 1)
2. **Search product** → Discovery (Feature 3)
3. **Scan product** → Scanner (Feature 4)
4. **Add to list** → Shopping List (Feature 2)
5. **Check data persists** after page refresh

---

## Common Issues & Solutions

### Issue: Camera permission denied
**Solution**: Check browser settings, allow camera access

### Issue: Products not found
**Solution**: Use test barcodes provided above

### Issue: Data not persisting
**Solution**: Check if backend is running on port 5002

### Issue: "Failed to load shopping lists"
**Solution**: Check MongoDB connection, verify user ID

### Issue: Onboarding not appearing
**Solution**: Make sure it's a new account, or delete health profile

---

## Test Barcodes Reference

```
012345678901 → Almond Milk (SAFE)
012345678902 → Whole Wheat Bread (CHECK - has gluten)
012345678903 → Peanut Butter (CHECK - has peanuts)
012345678904 → Coconut Yogurt (SAFE)
012345678905 → Gluten-Free Bread (SAFE)
012345678906 → Chickpea Pasta (SAFE)
012345678907 → Wild Salmon (SAFE)
012345678908 → Organic Spinach (SAFE)
```

---

## Performance Notes

- Initial search may take 1-2 seconds
- Shopping list sync is instant
- Camera startup takes ~1-2 seconds
- Product lookup is fast (<500ms)

---

## Browser DevTools Tips

### Check Network Requests:
1. Open DevTools (F12)
2. Go to "Network" tab
3. Perform actions to see API calls
4. Check for 200 status codes (success)

### Check Console:
1. Go to "Console" tab
2. Should see minimal errors
3. Look for API response logs

### Check Storage:
1. Go to "Application" tab
2. Look for Firebase auth tokens
3. No sensitive data stored in localStorage

---

## Next Steps After Testing

1. ✅ All features working?
2. 📝 Document any bugs found
3. 🚀 Ready for Phase 2 features
4. 📊 Collect user feedback
5. 🎨 Polish UI/UX based on testing

---

**Happy Testing! 🎉**

Last Updated: October 26, 2025

