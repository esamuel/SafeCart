import { useTranslation } from '../lib/i18n'
import Layout from '../components/Layout'
import Button from '../components/Button'

export default function Pricing() {
  const { t } = useTranslation()

  const CheckIcon = () => (
    <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )

  const plans = [
    {
      name: t('pricing.free.name'),
      price: t('pricing.free.price'),
      description: t('pricing.free.description'),
      features: t('pricing.free.features') as string[],
      cta: t('pricing.free.cta'),
      badge: null,
      featured: false,
    },
    {
      name: t('pricing.pro.name'),
      price: t('pricing.pro.price'),
      description: t('pricing.pro.description'),
      features: t('pricing.pro.features') as string[],
      cta: t('pricing.pro.cta'),
      badge: t('pricing.pro.badge'),
      featured: true,
    },
    {
      name: t('pricing.family.name'),
      price: t('pricing.family.price'),
      description: t('pricing.family.description'),
      features: t('pricing.family.features') as string[],
      cta: t('pricing.family.cta'),
      badge: t('pricing.family.badge'),
      featured: false,
    },
  ]

  return (
    <Layout>
      {/* Header Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('pricing.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                  plan.featured ? 'ring-4 ring-primary-700 transform md:scale-105' : ''
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="bg-primary-700 text-white text-center py-2 px-4 text-sm font-semibold">
                    {plan.badge}
                  </div>
                )}

                {/* Card Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">{t('pricing.perMonth')}</span>
                    {plan.price !== '0' && (
                      <p className="text-sm text-gray-500 mt-1">{t('pricing.billedMonthly')}</p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    variant={plan.featured ? 'primary' : 'outline'}
                    className="w-full mb-6"
                  >
                    {plan.cta}
                  </Button>

                  {/* Features List */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <span className="flex-shrink-0 mt-0.5">
                          <CheckIcon />
                        </span>
                        <span className="ml-3 text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            {t('pricing.allPlansInclude')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-900">{t('pricing.securePayment')}</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="font-semibold text-gray-900">{t('pricing.cancelAnytime')}</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-900">{t('pricing.moneyBack')}</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
