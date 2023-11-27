export default defineEventHandler(ev => {
  const query = getQuery(ev)
  const locale = query.locale as string
  const emojis = ev.context.emojis.map((emoji: any) => ({
    ...emoji,
    // todo replace it in generate
    c: emoji.c.replace(/ /g, '-'),
    keywords: {
      en: emoji.keywords?.en || [],
      [locale]: emoji.keywords?.[locale] || []
    }
  }))
  return emojis
})
