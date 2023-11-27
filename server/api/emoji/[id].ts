export default defineEventHandler(ev => {
  const id = ev.context.params?.id || ''
  const query = getQuery(ev)
  const locale = query.locale as string
  // todo replace it in generate
  const emoji = ev.context.emojis.find((emoji: any) => emoji.c.replace(/ /g, '-') === id)
  if (!emoji) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Emoji not found'
    })
  }
  emoji.keywords = emoji.k?.[locale]
  console.log(emoji)
  return emoji
})
