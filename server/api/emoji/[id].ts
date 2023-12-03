export default defineEventHandler(ev => {
  const id = ev.context.params?.id || ''
  const query = getQuery(ev)
  const locale = query.locale as string
  const res = ev.context.emojis.find((emoji: any) => emoji.c === id)
  const groups = ev.context.groups.map((g: any) => ({ n: g.name, nt: g[locale] }))
  const groupName = groups[res.g]
  const subGroupName = groups[res.s]
  if (!res) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Emoji not found'
    })
  }
  const emoji = {
    ...res,
    t: res.t?.[locale] || null,
    k: {
      en: res.k?.en || [],
      [locale]: res.k?.[locale] || []
    },
    g: groupName.nt,
    s: subGroupName.nt
  }
  return emoji
})
