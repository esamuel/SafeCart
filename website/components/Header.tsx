import { useTranslation } from '../lib/i18n'
import Link from 'next/link'
import { useState } from 'react'

const Header = () => {
  const { t, locale, setLocale } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const changeLanguage = (newLocale: 'en' | 'he' | 'es') => {
    setLocale(newLocale)
  }

  const navigation = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.features'), href: '/features' },
    { name: t('nav.pricing'), href: '/pricing' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.faq'), href: '/faq' },
    { name: t('nav.contact'), href: '/contact' },
  ]

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'he', name: 'עברית' },
    { code: 'es', name: 'Español' },
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">SC</span>
            </div>
            <span className="text-xl font-bold text-gray-900">SafeCart</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-primary-700 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Language Selector */}
          <div className="flex items-center space-x-4">
            <select
              value={locale}
              onChange={(e) => changeLanguage(e.target.value as 'en' | 'he' | 'es')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 hover:text-primary-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-2 text-gray-700 hover:text-primary-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header
