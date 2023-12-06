import type { RouterConfig } from '@nuxt/schema'

const options: RouterConfig = {
  scrollBehavior (_to, _from, savedPosition) {
    if (_to.hash) {
      // don't back to hash when close detail but refresh
      if (_from.hash && savedPosition) {
        return savedPosition
      }
      return {
        el: _to.hash,
        top: 96,
        behavior: 'smooth'
      }
    }
  }
}
export default options
