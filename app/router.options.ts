import type { RouterConfig } from '@nuxt/schema'

const options: RouterConfig = {
  scrollBehavior (_to, _from, savedPosition) {
    if (_to.hash) {
      return {
        el: _to.hash,
        top: 96,
        behavior: 'smooth'
      }
    }
  }
}
export default options
