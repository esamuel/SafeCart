module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'he', 'es'],
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  localePath: typeof window === 'undefined' ? require('path').resolve('./public/locales') : '/locales',
}
