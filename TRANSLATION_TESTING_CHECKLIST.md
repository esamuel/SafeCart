# Translation Testing Checklist

## 🎯 Testing Instructions

The app is running at: **http://localhost:3000**

Test each page in **all 3 languages**: English (🇬🇧), Hebrew (🇮🇱), Spanish (🇪🇸)

---

## 📋 Pages to Test

### 1. **Login/Auth Page** (`Auth.tsx`)
**URL:** http://localhost:3000 (when logged out)

**Test:**
- [ ] Tagline: "Shop safely with allergies & diabetes"
- [ ] Email label and placeholder
- [ ] Password label and placeholder
- [ ] "Sign In" / "Sign Up" buttons
- [ ] "Forgot Password?" link
- [ ] "Already have an account?" / "Don't have an account?" text
- [ ] Switch between Sign In and Sign Up modes
- [ ] Password reset form:
  - [ ] Description text
  - [ ] "Email Address" label
  - [ ] "Send Reset Link" button
  - [ ] "Back to Sign In" button

**Hebrew RTL Check:**
- [ ] Text aligns right
- [ ] Form inputs align right
- [ ] Buttons stay in correct position

---

### 2. **Onboarding Page** (`Onboarding.tsx`)
**Test onboarding by creating a new account**

**Test:**
- [ ] Header: "Welcome to SafeCart!"
- [ ] Subtitle: "Step X of 3: Let's set up your health profile"

**Step 1 - Personal Information:**
- [ ] "Personal Information" title
- [ ] "Name", "Age", "Height (cm)", "Weight (kg)" labels
- [ ] Placeholders
- [ ] "Next" button

**Step 2 - Diabetes Information:**
- [ ] "Diabetes Information" title
- [ ] "Diabetes Type" label
- [ ] Diabetes type options in dropdown (Type 1, Type 2, Prediabetes, Gestational)
- [ ] "Min (mg/dL)" and "Max (mg/dL)" labels
- [ ] "Daily Carb Limit (g)" label
- [ ] "I use insulin" checkbox
- [ ] "Back" and "Next" buttons

**Step 3 - Allergies:**
- [ ] "Allergies & Intolerances" title
- [ ] "Select your allergies" subtitle
- [ ] All allergen names translated (Peanuts, Tree Nuts, Milk, Eggs, Soy, Wheat, Fish, Shellfish, Sesame)
- [ ] "Back" and "Complete Setup" buttons
- [ ] "Saving..." when submitting

**Hebrew RTL Check:**
- [ ] All text aligns right
- [ ] Progress dots at bottom work correctly
- [ ] Allergen grid displays properly

---

### 3. **Home Page / Dashboard** (`EnhancedDashboard.tsx`)
**URL:** http://localhost:3000 (after login)

**Test:**
- [ ] Page title: "Health Dashboard"
- [ ] Subtitle: "Your personalized health insights"
- [ ] Period buttons: "7 days", "14 days", "30 days"

**Insight Messages (at top):**
- [ ] "Perfect safety score! All X items are safe for you."
- [ ] "Great carb control! You're staying within your budget."
- [ ] "Try the Meal Planner to get personalized diabetes-friendly recipes!"
- [ ] Other dynamic messages

**4 Stat Cards:**
- [ ] "Safety Score" - "X safe / Y total items"
- [ ] "Safe Streak" - "X days allergen-free!"
- [ ] "Carb Control" - "Avg Xg / Yg daily"
- [ ] "Dangers Avoided"

**Nutrition Chart:**
- [ ] "Daily Nutrition Tracking" title
- [ ] "Carbs:" and "Protein:" labels
- [ ] Legend: "Carbs (goal: Xg)" and "Protein (goal: ~100g)"

**3 Stat Boxes:**
- [ ] "Nutrition Averages" - Daily Carbs, Daily Protein, Daily Calories, Meals Tracked
- [ ] "Shopping Activity" - Total Lists, Items Added, Completed, Completion Rate
- [ ] "Achievements" - All achievement names

**Hebrew RTL Check:**
- [ ] Period selector buttons align correctly
- [ ] Stat cards display properly
- [ ] Charts and progress bars work in RTL
- [ ] Number positioning is correct

---

### 4. **Scanner Page** (`Scanner.tsx`)
**Navigate to Scanner tab**

**Test:**
- [ ] All labels and buttons
- [ ] Camera controls
- [ ] Manual entry form
- [ ] Result display
- [ ] Safety warnings

---

### 5. **Shopping Lists Page** (`ShoppingList.tsx`)
**Navigate to Shopping Lists tab**

**Test:**
- [ ] Page title
- [ ] List names
- [ ] Item names
- [ ] Add/edit/delete buttons
- [ ] Allergen warnings

---

### 6. **Meal Planner Page** (`MealPlanner.tsx`)
**Navigate to Meals tab**

**Test:**
- [ ] Page title
- [ ] Days of week
- [ ] Recipe names
- [ ] Nutrition info labels
- [ ] Generate meal plan button

---

### 7. **Product Discovery Page** (`ProductDiscovery.tsx`)
**Navigate to Discover tab**

**Test:**
- [ ] Search placeholder
- [ ] Filter labels
- [ ] Category names
- [ ] Product details
- [ ] Safety badges

---

### 8. **Analytics Page** (`HealthAnalytics.tsx`)
**Navigate to Analytics tab**

**Test:**
- [ ] Page title
- [ ] Chart labels
- [ ] Time period selectors
- [ ] Insight messages
- [ ] AI recommendations

---

### 9. **Profile Page** (`Profile.tsx`)
**Navigate to Profile tab**

**Test:**
- [ ] Page title
- [ ] Section headings
- [ ] Field labels
- [ ] Edit/Save buttons
- [ ] Health profile info

---

### 10. **Settings Page** (`Settings.tsx`)
**Navigate to Settings tab**

**Test:**
- [ ] Page title
- [ ] Setting labels
- [ ] Toggle switches
- [ ] Save button

---

## 🐛 Common Issues to Check

### For All Pages:
- [ ] No English text appears when Hebrew/Spanish is selected
- [ ] No missing translations (no translation keys showing like "common.title")
- [ ] Numbers and dates format correctly
- [ ] Buttons are clickable and work

### Hebrew RTL Specific:
- [ ] Text aligns to the right
- [ ] Icons position correctly (left/right swap)
- [ ] Form inputs work correctly
- [ ] Dropdowns open in the right direction
- [ ] Margins and padding are mirrored
- [ ] Flex layouts reverse correctly
- [ ] Navigation tabs display properly

### Spanish:
- [ ] Accents display correctly (á, é, í, ó, ú, ñ, ¿, ¡)
- [ ] Text wrapping works properly
- [ ] No text overflow issues

---

## ✅ Testing Steps

1. **Open the app:** http://localhost:3000

2. **Log out if logged in** (to test Auth page)

3. **Test Auth Page:**
   - Switch to Hebrew (עברית) using browser settings or URL
   - Verify all text is translated
   - Check RTL layout
   - Switch to Spanish (Español)
   - Verify translations

4. **Sign up with a new account** (test Onboarding):
   - Go through all 3 steps
   - Test each language

5. **Test Home Page** (EnhancedDashboard):
   - Use language switcher (🌐 globe icon) in header
   - Check insight messages
   - Verify all sections

6. **Test all other pages** using navigation tabs

7. **Document any issues found**

---

## 📝 Report Issues

If you find any problems, note:
- Which page
- Which language
- What's wrong (missing translation, wrong text, layout issue)
- Screenshot if possible

