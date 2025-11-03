# OpenFoodFacts Multi-Region Strategy

## 🌍 Challenge: Managing Product Data for 3 Regions

**Target Markets:**
1. 🇮🇱 Israel (Hebrew-speaking users)
2. 🇺🇸 USA (English-speaking users)
3. 🇲🇽🇪🇸 Latin America (Spanish-speaking users - Mexico, Argentina, Chile, etc.)

**Problem:** Same barcode can represent DIFFERENT products in different countries!

---

## 📊 OpenFoodFacts Country Coverage

### Database Statistics (2024)

| Region | Products | Quality | Coverage |
|--------|----------|---------|----------|
| 🇺🇸 **USA** | ~800,000 | High | Excellent |
| 🇫🇷 France | ~1,000,000 | Very High | Excellent |
| 🇬🇧 UK | ~500,000 | High | Good |
| 🇪🇸 Spain | ~300,000 | Good | Good |
| 🇲🇽 Mexico | ~50,000 | Medium | Fair |
| 🇮🇱 **Israel** | ~10,000 | Medium | Limited ⚠️ |
| 🇦🇷 Argentina | ~30,000 | Medium | Fair |

**Key Insight:** USA coverage is excellent, Latin America is decent, Israel is LIMITED.

---

## 🎯 SOLUTION: Multi-Source Strategy

### Strategy Overview

```
┌─────────────────────────────────────────────────┐
│         User Scans Barcode                     │
│         Location: Israel / USA / Mexico        │
└─────────────────┬───────────────────────────────┘
                  │
         ┌────────▼────────┐
         │  Detect User    │
         │  Country/Region │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼────┐  ┌────▼───┐  ┌──────▼──────┐
│ Israel │  │  USA   │  │ Latin America│
│ Logic  │  │  Logic │  │   Logic      │
└───┬────┘  └────┬───┘  └──────┬──────┘
    │            │             │
    │    ┌───────▼──────────┐  │
    │    │  OpenFoodFacts   │  │
    │    │   Primary API    │  │
    │    └───────┬──────────┘  │
    │            │             │
    ├────────────┼─────────────┤
    │            │             │
┌───▼────────┐ ┌▼──────────┐ ┌▼────────────┐
│  Shufersal │ │   USDA    │ │  Local DBs  │
│  API (IL)  │ │ FoodData  │ │ (MX/AR/CL)  │
│  (Future)  │ │  Central  │ │             │
└────────────┘ └───────────┘ └─────────────┘
```

---

## 🔧 IMPLEMENTATION APPROACH

### Step 1: Detect User Region

**Methods:**
1. **User Profile** (Best) - Store user's country in profile
2. **IP Geolocation** (Fallback) - Detect from IP address
3. **Browser Language** (Hint) - `navigator.language` (he-IL, en-US, es-MX)
4. **Manual Selection** (Override) - Let user choose their region

**Backend Implementation:**

```javascript
// packages/backend/src/routes/scanner.js

const getUserRegion = async (userId, ipAddress) => {
  // 1. Check user profile first
  const user = await User.findOne({ firebaseId: userId });
  if (user?.region) {
    return user.region; // 'IL', 'US', 'MX', 'AR', etc.
  }

  // 2. Fallback to IP geolocation
  const geoData = await fetch(`https://ipapi.co/${ipAddress}/json/`);
  const { country_code } = await geoData.json();

  return country_code; // 'IL', 'US', 'MX', etc.
};
```

---

### Step 2: Query OpenFoodFacts with Country Filter

**OpenFoodFacts API Endpoints:**

```javascript
// Query with country filter
const queryByCountry = async (barcode, countryCode) => {
  // OpenFoodFacts supports country filtering
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,brands,countries_tags,nutriments&cc=${countryCode}&lc=${languageCode}`
  );

  return response.json();
};

// Examples:
// Israel: cc=il&lc=he
// USA: cc=us&lc=en
// Mexico: cc=mx&lc=es
```

**Country-Specific URLs:**

```javascript
// Israel-specific database
https://il.openfoodfacts.org/api/v2/product/{barcode}

// USA-specific database
https://us.openfoodfacts.org/api/v2/product/{barcode}

// Mexico-specific database
https://mx.openfoodfacts.org/api/v2/product/{barcode}

// Spain-specific database
https://es.openfoodfacts.org/api/v2/product/{barcode}
```

---

### Step 3: Multi-Source Fallback Strategy

**Priority Order by Region:**

#### 🇮🇱 Israel Strategy

```javascript
const fetchProductIsrael = async (barcode) => {
  // 1. Try OpenFoodFacts Israel
  let product = await openFoodFactsAPI(barcode, 'il', 'he');

  if (product) return product;

  // 2. Fallback: Check if sold in Israel (countries_tags)
  product = await openFoodFactsAPI(barcode, 'world', 'he');
  if (product?.countries_tags?.includes('en:israel')) {
    return product;
  }

  // 3. Future: Israeli retailer APIs
  // - Shufersal API (requires partnership)
  // - Rami Levy API (requires partnership)
  // - Victory API (requires partnership)

  // 4. Manual entry + community contributions
  return { notFound: true, region: 'IL' };
};
```

#### 🇺🇸 USA Strategy

```javascript
const fetchProductUSA = async (barcode) => {
  // 1. Try OpenFoodFacts USA (excellent coverage)
  let product = await openFoodFactsAPI(barcode, 'us', 'en');

  if (product) return product;

  // 2. Fallback: USDA FoodData Central
  product = await usdaAPI(barcode);

  if (product) return product;

  // 3. Future: Walmart/Target APIs (requires partnership)

  return { notFound: true, region: 'US' };
};
```

#### 🇲🇽🇪🇸 Latin America Strategy

```javascript
const fetchProductLatinAmerica = async (barcode, country) => {
  // 1. Try country-specific OpenFoodFacts
  let product = await openFoodFactsAPI(barcode, country, 'es');

  if (product) return product;

  // 2. Try broader Latin America search
  product = await openFoodFactsAPI(barcode, 'world', 'es');
  if (product?.countries_tags?.includes(`en:${country}`)) {
    return product;
  }

  // 3. Check if sold in any Latin American country
  const latinCountries = ['mexico', 'argentina', 'chile', 'colombia', 'peru'];
  for (const latinCountry of latinCountries) {
    if (product?.countries_tags?.includes(`en:${latinCountry}`)) {
      return { ...product, approximateMatch: true };
    }
  }

  return { notFound: true, region: country };
};
```

---

### Step 4: Complete Scanner Implementation

**Backend Endpoint:**

```javascript
// packages/backend/src/routes/scanner.js

router.post('/scan', async (req, res) => {
  try {
    const { barcode, userId } = req.body;
    const ipAddress = req.ip;

    // 1. Detect user region
    const userRegion = await getUserRegion(userId, ipAddress);

    // 2. Fetch product based on region
    let product;

    switch (userRegion) {
      case 'IL':
        product = await fetchProductIsrael(barcode);
        break;
      case 'US':
        product = await fetchProductUSA(barcode);
        break;
      case 'MX':
      case 'AR':
      case 'CL':
      case 'CO':
      case 'ES':
        product = await fetchProductLatinAmerica(barcode, userRegion);
        break;
      default:
        // Global fallback
        product = await openFoodFactsAPI(barcode, 'world', 'en');
    }

    // 3. If not found, log for manual review
    if (product.notFound) {
      await logMissingProduct(barcode, userRegion, userId);

      return res.json({
        found: false,
        message: 'Product not found in database. Would you like to add it manually?',
        region: userRegion
      });
    }

    // 4. Analyze safety for user's profile
    const user = await User.findOne({ firebaseId: userId });
    const safetyAnalysis = analyzeSafety(product, user.healthProfiles[0]);

    // 5. Cache the result
    await cacheProduct(barcode, userRegion, product);

    // 6. Return result
    res.json({
      found: true,
      product,
      safetyAnalysis,
      region: userRegion,
      source: product.source // 'openfoodfacts', 'usda', 'manual', etc.
    });

  } catch (error) {
    console.error('Scanner error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🗂️ DATABASE SCHEMA UPDATE

**Add Region-Specific Fields:**

```javascript
// packages/backend/src/models/Product.js

const ProductSchema = new mongoose.Schema({
  // ... existing fields ...

  // NEW: Multi-region support
  regions: [{
    country: String, // 'US', 'IL', 'MX', 'AR', etc.
    available: Boolean,
    barcode: String, // Can be different per region!
    name: String, // Localized name
    brand: String, // May differ
    price: Number,
    stores: [String], // ['Walmart', 'Target'] or ['Shufersal', 'Rami Levy']
    lastUpdated: Date,
    source: String // 'openfoodfacts', 'usda', 'retailer-api', 'manual'
  }],

  // Store best-quality data globally
  globalData: {
    nutrition: Object,
    allergens: Object,
    ingredients: [String],
    diabetesInfo: Object
  }
});
```

---

## 🎨 USER EXPERIENCE IMPROVEMENTS

### 1. Region Selection in Onboarding

**Add to Onboarding Flow (Step 1):**

```javascript
// packages/frontend/src/components/Onboarding.tsx

<div>
  <label>Where do you shop?</label>
  <select value={formData.region} onChange={...}>
    <option value="US">🇺🇸 United States</option>
    <option value="IL">🇮🇱 Israel (ישראל)</option>
    <option value="MX">🇲🇽 Mexico</option>
    <option value="AR">🇦🇷 Argentina</option>
    <option value="CL">🇨🇱 Chile</option>
    <option value="ES">🇪🇸 Spain</option>
  </select>
</div>
```

### 2. "Product Not Found" Flow

```javascript
// When product not found, show:

"We couldn't find this product in our Israeli database.

Would you like to:
1. ✏️ Add it manually (help the community!)
2. 🔍 Search our global database
3. 📸 Send us a photo for review"
```

### 3. Community Contributions

**Encourage users to add missing products:**

```javascript
// Manual product entry form
{
  barcode: '7290000000000',
  name: 'Bamba Peanut Snack',
  brand: 'Osem',
  country: 'IL',
  stores: ['Shufersal', 'Rami Levy'],
  ingredients: [...],
  nutrition: {...},
  userSubmitted: true,
  needsVerification: true
}
```

---

## 📈 PHASED ROLLOUT STRATEGY

### Phase 1: OpenFoodFacts Only (Weeks 1-2)
✅ Implement region detection
✅ Query OpenFoodFacts with country filters
✅ Cache results
✅ Log missing products

**Expected Coverage:**
- USA: 90%+ ✅
- Latin America: 60-70% ⚠️
- Israel: 30-40% ❌

### Phase 2: Add USDA (Week 3)
✅ Integrate USDA FoodData Central (USA only)
✅ Cross-reference OpenFoodFacts with USDA

**Expected Coverage:**
- USA: 95%+ ✅

### Phase 3: Manual Entry + Community (Week 4)
✅ Enable user-submitted products
✅ Community verification system
✅ Admin review queue

**Expected Coverage:**
- Israel: 50-60% (with community help)
- Latin America: 75-80%

### Phase 4: Retailer Partnerships (Months 3-6)
✅ Partner with Israeli supermarkets (Shufersal, Rami Levy)
✅ Partner with Latin American retailers
✅ API integrations for live product data

**Expected Coverage:**
- Israel: 80-90% ✅
- Latin America: 85-90% ✅

---

## 💡 RECOMMENDATION

### For MVP Launch (Next 2-4 weeks):

**1. USA Market First** (Best Coverage)
- Launch with OpenFoodFacts + USDA
- 90-95% product coverage
- Focus marketing on USA users
- Validate product-market fit

**2. Israel + Latin America: Beta**
- Mark as "Beta" in these regions
- Encourage community contributions
- Build up product database
- Partner with local retailers

**3. Gradual Expansion**
- Month 1-2: USA (primary)
- Month 3-4: Add Israel retailers
- Month 5-6: Expand Latin America

### Alternative: Launch All 3 Simultaneously

**Pros:**
- Global reach from day 1
- Diverse user feedback
- Larger addressable market

**Cons:**
- Israel/LatAm users will see "product not found" more often
- More support tickets
- Slower growth in each market

**My Recommendation:** Launch USA first, then expand. This ensures a better user experience and higher retention.

---

## 🔑 KEY TAKEAWAYS

1. **Same barcode ≠ Same product** across countries
2. **OpenFoodFacts coverage varies:** USA (excellent), LatAm (good), Israel (limited)
3. **Solution:** Region detection + multi-source fallback
4. **Strategy:** USA first (best coverage), then expand
5. **Community:** Encourage user contributions for missing products

---

## 📝 NEXT STEPS

1. Add `region` field to User model
2. Implement region detection logic
3. Update scanner endpoint with multi-region support
4. Test with real barcodes from each region
5. Create "add product manually" flow
6. Launch USA market first

**Do you want me to start implementing this multi-region scanner system?**

