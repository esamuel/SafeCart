import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import enTranslations from '../public/locales/en/common.json'
import heTranslations from '../public/locales/he/common.json'
import esTranslations from '../public/locales/es/common.json'

type Translations = typeof enTranslations
type Locale = 'en' | 'he' | 'es'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => any
}

const translations: Record<Locale, Translations> = {
  en: enTranslations,
  he: heTranslations,
  es: esTranslations,
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    // Load locale from localStorage or browser language
    const savedLocale = localStorage.getItem('locale') as Locale
    const browserLang = navigator.language.split('-')[0] as Locale

    if (savedLocale && ['en', 'he', 'es'].includes(savedLocale)) {
      setLocaleState(savedLocale)
    } else if (['en', 'he', 'es'].includes(browserLang)) {
      setLocaleState(browserLang)
    }
  }, [])

  useEffect(() => {
    // Update document direction for RTL languages
    document.documentElement.setAttribute('lang', locale)
    document.documentElement.setAttribute('dir', locale === 'he' ? 'rtl' : 'ltr')
  }, [locale])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const t = (key: string): any => {
    const keys = key.split('.')
    let value: any = translations[locale]

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key // Return key if translation not found
      }
    }

    return value
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useTranslation = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider')
  }
  return context
}
