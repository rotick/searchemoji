export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    if (response.headers?.location.includes('?cfcache=')) {
      response.headers.location = response.headers.location.replace(/\?[^]*/g, '')
    }
  })
})
