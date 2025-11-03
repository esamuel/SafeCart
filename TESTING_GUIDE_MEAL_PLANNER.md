# Testing Guide - Meal Planner & Expanded Products

## Server Status ✅

Both servers are running and ready for testing:
- **Backend**: http://localhost:5002 ✅
- **Frontend**: http://localhost:3000 ✅

## Quick Verification

### API Endpoints Working:
```bash
# Check backend health
curl http://localhost:5002/health

# Check recipes (should return 12)
curl http://localhost:5002/api/recipes | jq '. | length'

# Check products (should return 50)
curl http://localhost:5002/api/products | jq '. | length'

# Check breakfast recipes (should return 3)
curl "http://localhost:5002/api/recipes?mealType=breakfast" | jq '. | length'
```

---

## Step-by-Step Testing Guide

### 1. Access the Application

Open your browser and go to: **http://localhost:3000**

### 2. Complete Onboarding (if new user)

If this is your first time:

1. **Sign in** with Firebase (email/password or Google)
2. **Onboarding appears automatically**:
   - **Step 1**: Personal Info
     - Enter name, age, height, weight
   - **Step 2**: Diabetes Management
     - Select diabetes type (Type 1, Type 2, or None)
     - Set daily carb limit (e.g., **200g**)
     - Set target glucose range
   - **Step 3**: Allergen Selection
     - Select any allergies (e.g., **Milk**, **Peanuts**, **Tree nuts**)
     - Click "Complete Profile"

### 3. Test the Meal Planner 🍽️

#### Access Meal Planner:
1. Navigate to the **"Meal Planner"** tab (or "Plans" depending on UI)
2. Wait for the meal plan to load (2-3 seconds)

#### What You Should See:

**Header Section:**
- "Weekly Meal Plan" title
- "Personalized for your dietary needs" subtitle
- Refresh button (to regenerate plan)

**Carb Budget Card:**
- Daily carb budget: 200g (or your set amount)
- Average per meal: ~67g

**7-Day View:**
Each day should display:
- **Day header** (e.g., "Monday" with date)
- **Total carbs** for the day (e.g., "58g")
- **Percentage of limit** (e.g., "29% of limit")

**Meal Cards** for each day:
- 🍳 **Breakfast** (e.g., "Veggie Omelet with Spinach")
  - Net carbs: 6g
  - Calories, protein shown
  - Dietary tags: "Low GI", "High Protein", "Gluten-free"
  - Time: ~15 min
  - Difficulty: easy

- 🥗 **Lunch** (e.g., "Quinoa Power Bowl")
  - Net carbs: 38g
  - Dietary tags: "Vegan", "High Fiber", "Balanced"

- 🍽️ **Dinner** (e.g., "Grilled Salmon with Asparagus")
  - Net carbs: 4g
  - Dietary tags: "High Protein", "Low Carb", "Omega-3"

- 🍎 **Snack** (e.g., "Cucumber Hummus Bites")
  - Net carbs: 8g

**Bottom Section:**
- Large green button: "Generate Shopping List from Meal Plan"
- Info card explaining personalization

#### Expected Behavior:

✅ **All meals should be safe** for your selected allergies
- If you selected "Milk" allergy: No recipes with dairy
- If you selected "Peanuts": No peanut-containing recipes
- If you selected "Tree nuts": Almond recipes excluded

✅ **Carb budgets respected**
- Each meal stays within reasonable carb limits
- Daily totals should be under your set limit (200g)
- Breakfast/snacks: typically 5-15g net carbs
- Lunch/dinner: typically 4-40g net carbs

✅ **Variety across days**
- Different recipes each day
- Mix of protein sources (fish, chicken, turkey, plant-based)
- Variety of vegetables and preparations

### 4. Test Shopping List Generation 🛒

#### Generate List:
1. On the Meal Planner page, scroll to the bottom
2. Click **"Generate Shopping List from Meal Plan"** button
3. Wait for success message (2-3 seconds)
4. Should see: "✅ Added [X] items to your shopping list!"

#### Verify Shopping List:
1. Navigate to **"Shopping Lists"** tab
2. Look for a list named "Weekly Meal Plan - [Date]" or it adds to your existing list

**Expected Items:**
You should see aggregated ingredients like:
- **Eggs**: 14 whole (for 7 breakfasts)
- **Salmon**: 2 servings (for dinner recipes)
- **Spinach**: 4 cups (used in multiple meals)
- **Bell Pepper**: 1.5 cups (various recipes)
- **Olive Oil**: 8 tbsp
- **Garlic**: 15 cloves
- And many more...

**Item Features:**
- Each item shows quantity and unit
- Items can be checked off
- Safety badges (✓ SAFE / ⚠️ DANGER) based on your allergies
- Red border on dangerous items

### 5. Test Product Discovery 🔍

#### Access Product Discovery:
1. Navigate to **"Profile"** or **"Discover"** tab
2. You should see the product search interface

#### Search Tests:

**Test 1: Search by Name**
- Search: **"chicken"**
- Expected: Find "Chicken Breast Boneless Skinless"
- Should show nutrition info, allergens

**Test 2: Search by Category**
- Use category filter: **"Dairy"**
- Expected: See milk, yogurt, cheese products
- If you're allergic to milk: Should see danger warnings

**Test 3: Allergen Filtering**
- Use allergen filter: Select **"Milk"**
- Expected: Dairy products excluded from results
- Only non-dairy items shown

**Test 4: Search New Products**
- Search: **"quinoa"** → Should find quinoa grain
- Search: **"almond"** → Should find almond flour, almond milk
- Search: **"salmon"** → Should find salmon fillet
- Search: **"chickpea"** → Should find chickpeas and chickpea pasta

**Test 5: Low-Carb Filtering**
- Use max carbs filter: **10g**
- Expected: Only low-carb items
- Should see proteins, leafy greens, nuts

### 6. Test Barcode Scanner 📷

1. Navigate to **"Scan"** tab
2. Try manual barcode entry with test barcodes:

**Test Barcodes:**
- `012345678901` → Almond Milk (Tree nuts warning if allergic)
- `012345678907` → Wild Salmon (Fish warning if allergic)
- `012345678908` → Organic Spinach (Safe)
- `030034933265` → Organic Whole Milk (Milk warning if allergic)
- `041303000069` → Chicken Breast (Safe)

**Expected Behavior:**
- Product details appear after scan
- Allergen warnings if applicable
- Nutrition information displayed
- Can add to shopping list

---

## Advanced Testing

### Test Refresh Meal Plan

1. On Meal Planner, click the **"Refresh"** button (top right)
2. Meal plan should reload
3. Some recipes may change (randomized within constraints)
4. All meals still respect your allergies and carb budget

### Test with Different Allergy Profiles

**Profile 1: No Allergies**
- Should see all 12 recipes available
- More variety in meal plans

**Profile 2: Milk Allergy**
- Should exclude: Greek Yogurt Parfait, any dairy-containing recipes
- Should still get 7 full days of meals

**Profile 3: Tree Nuts Allergy**
- Should exclude: Almond Flour Pancakes, Mixed Nuts snack
- Alternative recipes automatically selected

**Profile 4: Multiple Allergies (Milk + Peanuts + Tree Nuts)**
- More restricted menu
- Should still generate complete 7-day plan
- Focuses on: vegetables, grains, fish, poultry, legumes

### Test Edge Cases

**Test 1: No Shopping Lists**
- Delete all existing shopping lists
- Generate from meal plan
- Should create new list: "Weekly Meal Plan - [Date]"

**Test 2: Existing Shopping List**
- Have a shopping list already
- Generate from meal plan
- Should add items to existing list (not create duplicate)

**Test 3: Multiple Generations**
- Generate shopping list
- Generate again
- Should add more items (may have duplicates - expected behavior)

---

## Troubleshooting

### Frontend Issues

**Issue: "localhost refused to connect"**
```bash
# Check if frontend is running
lsof -ti:3000

# If not running, start it:
npm run dev -w packages/frontend
```

**Issue: Frontend starts but shows errors**
```bash
# Check the logs
cat frontend.log | tail -30

# Restart frontend
pkill -f "next dev"
npm run dev -w packages/frontend
```

### Backend Issues

**Issue: API errors or 500 responses**
```bash
# Check if backend is running
lsof -ti:5002

# If not running, start it:
npm run dev -w packages/backend

# Check backend logs
cat backend.log | tail -30
```

**Issue: "Recipe not found" or empty meal plans**
```bash
# Re-seed the database
npm run seed:all -w packages/backend

# Should see:
# ✅ Seeded 8 products
# ✅ Added 44 new products
# ✅ Seeded 12 recipes
```

### Database Issues

**Issue: No data in database**
```bash
# Seed all data
npm run seed:all -w packages/backend

# Verify
curl http://localhost:5002/api/recipes | jq '. | length'  # Should return 12
curl http://localhost:5002/api/products | jq '. | length'  # Should return 50
```

**Issue: MongoDB connection errors**
- Check your `.env` file in `packages/backend`
- Verify `MONGODB_URI` is set correctly
- Make sure MongoDB is running

---

## Expected Results Summary

### Meal Planner:
- ✅ 7 days of meals (28 recipes total: 7 breakfasts, 7 lunches, 7 dinners, 7 snacks)
- ✅ All allergen-safe (filtered by user profile)
- ✅ Within carb budget (respects daily limit)
- ✅ Diabetes-friendly (low GI/GL recipes only)
- ✅ Professional UI with nutrition info
- ✅ One-click shopping list generation

### Product Database:
- ✅ 52 products available
- ✅ 6 major categories (Dairy, Proteins, Vegetables, Grains, Nuts, Snacks)
- ✅ Complete nutrition data
- ✅ Allergen warnings
- ✅ Diabetes info (GI, GL, carb quality)
- ✅ Search and filter working

### Shopping List Generation:
- ✅ Aggregates ingredients from all 28 recipes
- ✅ Combines duplicate items (e.g., "Eggs: 14 whole")
- ✅ Preserves units and measurements
- ✅ Creates/updates shopping list automatically
- ✅ Typically 30-40 items per week

---

## Performance Expectations

- **Meal plan load time**: 1-3 seconds
- **Shopping list generation**: 2-5 seconds
- **Product search**: < 500ms
- **Recipe filtering**: < 1 second

---

## Success Criteria

You'll know everything is working correctly when:

1. ✅ Meal planner shows 7 complete days
2. ✅ All recipes respect your allergen settings
3. ✅ Daily carb totals shown and within budget
4. ✅ Shopping list generates with 30+ items
5. ✅ Product search finds newly added items
6. ✅ No console errors in browser (F12)
7. ✅ All API calls return 200 status codes

---

## Screenshots Checklist

When testing, you should see:

1. **Meal Planner Page**:
   - Week view with 7 day cards
   - Each day has 4 meal types
   - Carb budget card at top
   - Green "Generate Shopping List" button

2. **Each Meal Card Shows**:
   - Meal emoji and name
   - Net carbs in large purple text
   - Dietary tags (Low GI, High Protein, etc.)
   - Time and difficulty indicators

3. **Shopping List**:
   - List named "Weekly Meal Plan - [Date]"
   - Multiple items with quantities
   - Safety badges on items
   - Checkboxes to mark as purchased

4. **Product Discovery**:
   - Search bar
   - Filter options (category, allergens, carbs)
   - Product cards with nutrition info
   - More products than before (52 vs 8)

---

## Next Steps After Testing

If everything works:
- ✅ Mark high-priority features as complete
- ✅ Consider adding more recipes (currently 12)
- ✅ Consider integrating OpenFoodFacts API for 2M+ products
- ✅ Add recipe details page (full instructions view)
- ✅ Add meal substitution feature (swap out meals)

If issues found:
- Check console for errors (F12 in browser)
- Check backend logs: `cat backend.log`
- Check frontend logs: `cat frontend.log`
- Verify database seed: `npm run seed:all -w packages/backend`

---

**Ready to Test!** 🎉

Open http://localhost:3000 and follow the guide above. The meal planner should blow your mind with how well it personalizes to your dietary needs!
