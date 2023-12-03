export default defineEventHandler(ev => {
  const query = getQuery(ev)
  const locale = query.locale as string
  const emojis = ev.context.emojis.map((emoji: any) => ({
    ...emoji,
    c: emoji.c,
    keywords: {
      en: emoji.keywords?.en || [],
      [locale]: emoji.keywords?.[locale] || []
    }
  }))
  return emojis
})
