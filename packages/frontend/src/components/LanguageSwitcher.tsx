'use client'

import { useEffect } from 'react'
import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n' // Initialize i18n

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation('common')

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
    { code: 'he', name: 'עברית', flag: '🇮🇱', dir: 'rtl' },
    { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  ]

  // Set initial language and dir on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en'
    if (i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang)
    }
    const lang = languages.find(l => l.code === savedLang)
    if (lang) {
      document.documentElement.dir = lang.dir
      document.documentElement.lang = savedLang
    }
  }, [])

  const changeLanguage = (newLocale: string) => {
    const selectedLang = languages.find(lang => lang.code === newLocale)

    // Update HTML dir attribute for RTL support
    if (selectedLang) {
      document.documentElement.dir = selectedLang.dir
      document.documentElement.lang = newLocale
    }

    // Change i18n language
    i18n.changeLanguage(newLocale)

    // Store preference in localStorage
    localStorage.setItem('preferredLanguage', newLocale)

    // Reload page to apply RTL/LTR changes properly
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-xl border border-white border-opacity-30 hover:bg-opacity-30 transition">
      <Globe className="w-5 h-5 text-white" />
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-transparent border-none outline-none font-medium text-white cursor-pointer"
        style={{ colorScheme: 'dark' }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} style={{ color: '#000' }}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  )
}
