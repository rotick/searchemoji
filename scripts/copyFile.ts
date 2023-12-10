import { $ } from 'zx'
async function main () {
  await $`cp -r ./data ./dist`
  // await $`cp -r ./data ./output`
}
main()
