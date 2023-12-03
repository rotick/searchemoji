export default defineEventHandler(ev => {
  const query = getQuery(ev)
  const locale = query.locale as string
  const groups = ev.context.groups.map((g: any) => ({ n: g.name, nt: g[locale] }))
  const emojis = ev.context.emojis.map((emoji: any) => ({
    ...emoji,
    t: emoji.t?.[locale] || null,
    k: {
      en: emoji.k?.en || [],
      [locale]: emoji.k?.[locale] || []
    }
  }))
  return { groups, emojis }
})
