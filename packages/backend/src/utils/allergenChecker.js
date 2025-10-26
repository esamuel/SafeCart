/**
 * Allergen checking utilities
 */

const TOP_9_ALLERGENS = [
  'milk',
  'eggs',
  'fish',
  'shellfish',
  'tree nuts',
  'peanuts',
  'wheat',
  'soybeans',
  'sesame',
]

/**
 * Check if product contains user allergens
 */
function checkProductSafety(product, userAllergens) {
  const productAllergens = product.allergens?.contains || []
  const userAllergensList = userAllergens.map(a => a.toLowerCase())

  const matches = productAllergens.filter(allergen =>
    userAllergensList.includes(allergen.toLowerCase())
  )

  return {
    isSafe: matches.length === 0,
    matchedAllergens: matches,
    mayContainAllergens: product.allergens?.mayContain || [],
    severity: matches.length > 0 ? 'high' : 'none',
  }
}

/**
 * Check cross-contamination risk
 */
function checkCrossContamination(product, userAllergens, sensitivity) {
  if (!sensitivity) return false

  const mayContain = product.allergens?.mayContain || []
  const processedIn = product.allergens?.processedIn || []
  const userAllergensList = userAllergens.map(a => a.toLowerCase())

  const mayContainMatches = mayContain.filter(allergen =>
    userAllergensList.includes(allergen.toLowerCase())
  )

  const processedInMatches = processedIn.filter(allergen =>
    userAllergensList.includes(allergen.toLowerCase())
  )

  return mayContainMatches.length > 0 || processedInMatches.length > 0
}

/**
 * Get allergen severity level
 */
function getAllergenSeverity(allergen) {
  return TOP_9_ALLERGENS.includes(allergen.toLowerCase()) ? 'top-9' : 'other'
}

/**
 * Filter products by allergens
 */
function filterProductsByAllergens(products, userAllergens, excludeMayContain = false) {
  return products.filter(product => {
    const safety = checkProductSafety(product, userAllergens)
    if (!safety.isSafe) return false

    if (excludeMayContain && safety.mayContainAllergens.length > 0) {
      return false
    }

    return true
  })
}

module.exports = {
  checkProductSafety,
  checkCrossContamination,
  getAllergenSeverity,
  filterProductsByAllergens,
  TOP_9_ALLERGENS,
}
