# 🍽️ Meal Planner - Concept & Implementation

## The Idea

The Meal Planner helps users with **allergies + diabetes** plan safe, nutritious meals that:
1. ✅ Avoid their allergens
2. ✅ Fit their carb budget for diabetes management
3. ✅ Meet their nutritional goals
4. ✅ Generate shopping lists automatically

---

## How It Works

### User Flow:

```
1. User opens Meal Planner
   ↓
2. Selects date range (this week/month)
   ↓
3. System suggests safe meals based on:
   - User's allergies
   - Carb budget from diabetes profile
   - Nutritional targets
   ↓
4. User picks meals for each day
   ↓
5. System calculates daily nutrition
   - Total carbs for day
   - Net carbs (carbs - fiber)
   - GI/GL scores
   - Allergen status (✓ safe)
   ↓
6. Generate Shopping List button
   - Extracts all ingredients from planned meals
   - Creates shopping list automatically
   - Organized by category
   ↓
7. User goes shopping with safe list!
```

---

## Smart Meal Suggestions

The system will:

**For User with Milk Allergy + Type 1 Diabetes:**

```
Suggested Meals:

Breakfast:
🍳 Scrambled Eggs with Spinach
   ✓ Safe (no milk, eggs + veggies OK)
   Carbs: 8g | Protein: 20g
   
🥞 Almond Flour Pancakes
   ✓ Safe (no milk, gluten-free)
   Carbs: 12g | Protein: 15g

Lunch:
🥗 Grilled Chicken Salad
   ✓ Safe (no milk, low carb)
   Carbs: 6g | Protein: 35g
   
🌮 Turkey Lettuce Wraps
   ✓ Safe (no milk, low GI)
   Carbs: 8g | Protein: 25g

Dinner:
🍲 Grilled Salmon with Asparagus
   ✓ Safe (no milk, heart-healthy)
   Carbs: 5g | Protein: 40g | GI: 30
   
🍝 Zucchini Pasta with Turkey Meatballs
   ✓ Safe (no milk, dairy-free)
   Carbs: 12g | Protein: 35g
```

**NOT Suggested:**
- ❌ Anything with milk/cheese
- ❌ Anything over carb limit
- ❌ High GI foods (white bread, pasta)
- ❌ Foods with cross-contamination risks

---

## Features to Build

### Phase 1: Basic Meal Planner ⭐ (START HERE)
- [x] UI with calendar view
- [x] Pre-populated sample meals
- [ ] Connect to database
- [ ] Save meal plans
- [ ] Show nutrition totals
- [ ] Filter by meal type (breakfast/lunch/dinner)

### Phase 2: Smart Meal Suggestions
- [ ] AI-powered meal recommendations
- [ ] Filter by allergies automatically
- [ ] Respect carb budget from user profile
- [ ] Show GI/GL scores
- [ ] Mark meals as ✓ Safe or ⚠️ Check

### Phase 3: Generate Shopping List
- [ ] Extract ingredients from planned meals
- [ ] Create shopping list automatically
- [ ] Organize by category/store
- [ ] Check ingredients for allergens
- [ ] Add quantities needed

### Phase 4: Recipe Integration
- [ ] Add recipes to database
- [ ] Show full recipe instructions
- [ ] Show prep time, cook time
- [ ] Nutrition facts per serving
- [ ] User can add custom recipes

---

## Database Schema (Already Exists!)

```javascript
Meal {
  userId: ObjectId,
  name: "Grilled Salmon",
  description: "Healthy protein with veggies",
  mealType: "dinner", // breakfast, lunch, dinner, snack
  date: Date,
  
  ingredients: [
    { productId: ObjectId, name: "Salmon", quantity: 200, unit: "g" },
    { productId: ObjectId, name: "Asparagus", quantity: 150, unit: "g" },
    ...
  ],
  
  nutrition: {
    calories: 350,
    carbs: 5,
    netCarbs: 4, // carbs - fiber
    protein: 40,
    fat: 15,
    fiber: 1,
    sugar: 2,
    glycemicIndex: 30,
    glycemicLoad: 2,
  },
  
  allergens: ["Fish"], // contains these allergens
  notes: "Delicious and filling!",
  rating: 5,
}
```

---

## Meal Selection UI

```
┌──────────────────────────────────────────────────────────┐
│ Meal Planner - Week of Oct 23                           │
├──────────────────────────────────────────────────────────┤
│ Daily Budget: 200g carbs | Remaining: 127g               │
│                                                           │
│ ┌─────────┬───────┬───────┬───────┬───────┐            │
│ │ Monday  │ Tue   │ Wed   │ Thu   │ Fri   │            │
│ ├─────────┼───────┼───────┼───────┼───────┤            │
│ │🍳 Eggs  │🥞     │🍳     │🥞     │🍳     │            │
│ │8g carbs │Pancakes│Eggs   │Pancakes│Eggs   │            │
│ │✓ Safe   │12g    │8g     │12g    │8g     │            │
│ │         │✓ Safe │✓ Safe │✓ Safe │✓ Safe │            │
│ ├─────────┼───────┼───────┼───────┼───────┤            │
│ │🥗 Salad │🌮     │🥗     │🌮     │🥗     │            │
│ │6g carbs │Turkey │Salad  │Turkey │Salad  │            │
│ │✓ Safe   │8g     │6g     │8g     │6g     │            │
│ │         │✓ Safe │✓ Safe │✓ Safe │✓ Safe │            │
│ ├─────────┼───────┼───────┼───────┼───────┤            │
│ │🍲 Salmon│🍝     │🍲     │🍝     │🍲     │            │
│ │5g carbs │Pasta  │Salmon │Pasta  │Salmon │            │
│ │✓ Safe   │12g    │5g     │12g    │5g     │            │
│ │         │✓ Safe │✓ Safe │✓ Safe │✓ Safe │            │
│ └─────────┴───────┴───────┴───────┴───────┘            │
│                                                           │
│ Total Carbs: 73g / 200g                                 │
│ Daily Average: ~15g per meal                            │
│                                                           │
│ [Generate Shopping List] [Save Plan]                    │
└──────────────────────────────────────────────────────────┘
```

---

## Implementation Strategy

### Step 1: Connect Meal Planner to Database ✅ (EASY - 1 hour)
- Load user's meals from database
- Save meal selections
- Calculate nutrition totals

### Step 2: Smart Meal Filtering ✅ (MEDIUM - 2 hours)
- Filter meals based on user allergies
- Filter by carb budget
- Show only ✓ Safe meals
- Calculate GI/GL impact

### Step 3: Auto-Generate Shopping List ✅ (MEDIUM - 2 hours)
- Extract ingredients from all meals
- Create shopping list with quantities
- Check ingredients for allergens
- Organize by category

### Step 4: Recipe Integration ✅ (HARD - 4 hours)
- Add recipe database
- Show full recipe details
- Allow adding custom recipes
- Nutrition calculation per recipe

---

## Why This Is Valuable

### For Users:
1. **Saves Time** - No more wondering "what can I safely eat?"
2. **Prevents Mistakes** - Allergen-safe meals only
3. **Diabetes Management** - Stays within carb budget
4. **Auto Shopping Lists** - Ingredients collected automatically
5. **Meal Variety** - Discovers new safe recipes

### Example Impact:

**Before Meal Planner:**
- User spends 30 min deciding what to cook
- Goes to store, forgets ingredients
- Accidentally buys food with allergens
- Loses track of carb intake
- Stress about food safety

**After Meal Planner:**
- Pre-planned meals for whole week
- Shopping list with all ingredients (no forgotten items!)
- Only safe meals suggested (no allergen mistakes)
- Tracks carbs for diabetes management
- Peace of mind about food safety

---

## Quick Implementation Plan

**MVP (Today):**
1. Connect existing UI to database
2. Save/load meal plans
3. Show nutrition totals
4. Basic filtering by allergies

**Phase 2 (Next):**
5. Auto-generate shopping list
6. Smart meal suggestions
7. Recipe database integration

---

**Would you like me to start implementing the Meal Planner now?** 🍽️




