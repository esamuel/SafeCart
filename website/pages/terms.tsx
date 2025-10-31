import { useTranslation } from '../lib/i18n'
import Layout from '../components/Layout'

export default function Terms() {
  const { t } = useTranslation()
  const sections = t('terms.sections') as Array<{ title: string; content: string }>

  return (
    <Layout>
      {/* Header */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('terms.title')}
          </h1>
          <p className="text-sm text-gray-600">
            {t('terms.lastUpdated')}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 leading-relaxed mb-12">
              {t('terms.intro')}
            </p>

            {sections.map((section, index) => (
              <div key={index} className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {index + 1}. {section.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}

            <div className="mt-16 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Questions about these terms?</strong> Contact us at{' '}
                <a href="mailto:legal@safecart.app" className="text-primary-700 hover:underline">
                  legal@safecart.app
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
