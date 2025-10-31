import { useTranslation } from '../lib/i18n'
import Layout from '../components/Layout'

export default function About() {
  const { t } = useTranslation()

  return (
    <Layout>
      {/* Header */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('about.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Mission */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('about.mission.title')}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {t('about.mission.description')}
            </p>
          </div>

          {/* Story */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('about.story.title')}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {t('about.story.description')}
            </p>
          </div>

          {/* Values */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {t('about.values.title')}
            </h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-primary-700 rounded-full mt-2 mr-4"></div>
                <p className="text-lg text-gray-600">
                  {t('about.values.privacy')}
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-primary-700 rounded-full mt-2 mr-4"></div>
                <p className="text-lg text-gray-600">
                  {t('about.values.accuracy')}
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-primary-700 rounded-full mt-2 mr-4"></div>
                <p className="text-lg text-gray-600">
                  {t('about.values.accessibility')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
