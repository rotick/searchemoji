import locale from './locale'
import { resolve } from 'node:path'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  devServer: {
    port: 4000
  },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/color-mode', '@nuxtjs/eslint-module', '@nuxtjs/i18n', 'nuxt-gtag', '@nuxtjs/google-fonts'],
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'dark'
  },
  googleFonts: {
    families: {
      Roboto: [300, 500, 700]
    }
  },
  gtag: {
    id: ''
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
    langDir: resolve('./lang'),
    locales: locale
  }
})
