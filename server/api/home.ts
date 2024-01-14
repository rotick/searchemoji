export default defineEventHandler(ev => {
  const query = getQuery(ev)
  const locale = query.locale as string
  const quality = ((query.quality as string) || '').split(',')
  const skinTone = ((query.skinTone as string) || '').split(',')

  const groups = ev.context.groups.map((g: any) => ({ n: g.name, nt: g[locale] }))
  const skinToneSubGroupIndex = groups.findIndex((gn: any) => gn.n === 'skin-tone')
  const filtered = ev.context.emojis.filter(
    (li: any) =>
      quality.includes(li.q) &&
      (!li.n.includes('skin tone') || (li.n.includes('skin tone') && (skinTone.find(fst => li.n.includes(' ' + fst)) || li.s === skinToneSubGroupIndex)))
  )

  const emojis = filtered.map((emoji: any) => ({
    c: emoji.c,
    e: emoji.e,
    g: emoji.g,
    s: emoji.s,
    t: emoji.t[locale]
  }))

  return { groups, emojis }
})
