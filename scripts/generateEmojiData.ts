// import { fetch } from 'undici'
import stringify from 'json-stringify-pretty-compact'
import { promises as fs } from 'fs'
function parseTextToJson (text: string) {
  const lines = text.split('\n')
  const json: any[] = []
  let group: any = null
  let subgroup: any

  lines.forEach(line => {
    if (line.startsWith('# group:')) {
      group = {
        name: line.split(': ')[1],
        children: []
      }
      json.push(group)
    } else if (line.startsWith('# subgroup:')) {
      subgroup = {
        name: line.split(': ')[1],
        data: []
      }
      group.children.push(subgroup)
    } else if (line.startsWith('#') || !line) {
      // Ignore comments
    } else {
      const code = line.substring(0, line.indexOf(';')).trim()
      const regex = /# (.+) E(\d+\.\d+) (.+)/
      const match = line.match(regex)
      const emoji = match?.[1]
      const version = match?.[2]
      const name = match?.[3]

      subgroup.data.push({
        code,
        emoji,
        version,
        name
      })
    }
  })

  return json
}
async function main () {
  // const response = await fetch('https://unicode.org/Public/emoji/latest/emoji-test.txt')
  // const res = await response.text()
  const res = await fs.readFile('./data/emoji-test.txt', { encoding: 'utf-8' })
  const json = parseTextToJson(res)
  // console.log(stringify(json))
  await fs.writeFile('./data/emoji.json', stringify(json))
}
main()
