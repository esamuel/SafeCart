import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translation files
import enCommon from '../../public/locales/en/common.json'
import heCommon from '../../public/locales/he/common.json'
import esCommon from '../../public/locales/es/common.json'

import enScanner from '../../public/locales/en/scanner.json'
import heScanner from '../../public/locales/he/scanner.json'
import esScanner from '../../public/locales/es/scanner.json'

import enShopping from '../../public/locales/en/shopping.json'
import heShopping from '../../public/locales/he/shopping.json'
import esShopping from '../../public/locales/es/shopping.json'

import enMeals from '../../public/locales/en/meals.json'
import heMeals from '../../public/locales/he/meals.json'
import esMeals from '../../public/locales/es/meals.json'

import enProfile from '../../public/locales/en/profile.json'
import heProfile from '../../public/locales/he/profile.json'
import esProfile from '../../public/locales/es/profile.json'

import enDiscover from '../../public/locales/en/discover.json'
import heDiscover from '../../public/locales/he/discover.json'
import esDiscover from '../../public/locales/es/discover.json'

import enAnalytics from '../../public/locales/en/analytics.json'
import heAnalytics from '../../public/locales/he/analytics.json'
import esAnalytics from '../../public/locales/es/analytics.json'

import enSettings from '../../public/locales/en/settings.json'
import heSettings from '../../public/locales/he/settings.json'
import esSettings from '../../public/locales/es/settings.json'

import enInventory from '../../public/locales/en/inventory.json'
import heInventory from '../../public/locales/he/inventory.json'
import esInventory from '../../public/locales/es/inventory.json'

import enCommunity from '../../public/locales/en/community.json'
import heCommunity from '../../public/locales/he/community.json'
import esCommunity from '../../public/locales/es/community.json'

import enDashboard from '../../public/locales/en/dashboard.json'
import heDashboard from '../../public/locales/he/dashboard.json'
import esDashboard from '../../public/locales/es/dashboard.json'

const resources = {
  en: {
    common: enCommon,
    scanner: enScanner,
    shopping: enShopping,
    meals: enMeals,
    profile: enProfile,
    discover: enDiscover,
    analytics: enAnalytics,
    settings: enSettings,
    inventory: enInventory,
    community: enCommunity,
    dashboard: enDashboard,
  },
  he: {
    common: heCommon,
    scanner: heScanner,
    shopping: heShopping,
    meals: heMeals,
    profile: heProfile,
    discover: heDiscover,
    analytics: heAnalytics,
    settings: heSettings,
    inventory: heInventory,
    community: heCommunity,
    dashboard: heDashboard,
  },
  es: {
    common: esCommon,
    scanner: esScanner,
    shopping: esShopping,
    meals: esMeals,
    profile: esProfile,
    discover: esDiscover,
    analytics: esAnalytics,
    settings: esSettings,
    inventory: esInventory,
    community: esCommunity,
    dashboard: esDashboard,
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') || 'en' : 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

// Update HTML dir attribute when language changes
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng
    document.documentElement.dir = lng === 'he' ? 'rtl' : 'ltr'
  }
})

export default i18n
