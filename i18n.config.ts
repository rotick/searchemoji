import en from './lang/en.json'
import es from './lang/es.json'
import zhHans from './lang/zh-hans.json'
import zhHant from './lang/zh-hant.json'
import ja from './lang/ja.json'
import de from './lang/de.json'
import fr from './lang/fr.json'
import pt from './lang/pt.json'
export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  globalInjection: true,
  messages: {
    en,
    es,
    'zh-hans': zhHans,
    'zh-hant': zhHant,
    ja,
    de,
    fr,
    pt
  }
}))
