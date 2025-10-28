import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translation files
import enCommon from '../../public/locales/en/common.json'
import heCommon from '../../public/locales/he/common.json'
import esCommon from '../../public/locales/es/common.json'

const resources = {
  en: {
    common: enCommon,
  },
  he: {
    common: heCommon,
  },
  es: {
    common: esCommon,
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
