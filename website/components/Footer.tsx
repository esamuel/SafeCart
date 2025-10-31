import { useTranslation } from '../lib/i18n'
import Link from 'next/link'

const Footer = () => {
  const { t } = useTranslation()

  const productLinks = [
    { name: t('nav.features'), href: '/features' },
    { name: t('nav.pricing'), href: '/pricing' },
    { name: t('nav.faq'), href: '/faq' },
  ]

  const companyLinks = [
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.contact'), href: '/contact' },
  ]

  const legalLinks = [
    { name: t('footer.privacy'), href: '/privacy' },
    { name: t('footer.terms'), href: '/terms' },
  ]

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">SC</span>
              </div>
              <span className="text-xl font-bold text-white">SafeCart</span>
            </div>
            <p className="text-sm text-gray-400">{t('footer.tagline')}</p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.product')}</h3>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
