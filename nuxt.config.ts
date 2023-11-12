// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  devServer: {
    port: 4000
  },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/color-mode', '@nuxtjs/eslint-module', '@nuxtjs/i18n'],
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'dark'
  },
  eslint: {
    lintOnStart: false
  },
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'lang',
      cookieCrossOrigin: true
    },
    locales: [
      {
        code: 'en',
        iso: 'en',
        name: 'English'
      },
      {
        code: 'zh-hans',
        iso: 'zh-CN',
        name: '简体中文'
      },
      {
        code: 'es',
        iso: 'es',
        name: 'Español'
      },
      {
        code: 'zh-hant',
        iso: 'zh-TW',
        name: '正體中文'
      },
      {
        code: 'de',
        iso: 'de',
        name: 'Deutsch'
      },
      {
        code: 'ja',
        iso: 'ja',
        name: '日本語'
      },
      {
        code: 'fr',
        iso: 'fr',
        name: 'Français'
      },
      {
        code: 'pt',
        iso: 'pt',
        name: 'Português'
      }
    ]
  }
})
