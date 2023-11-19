// import { fetch } from 'undici'
import stringify from 'json-stringify-pretty-compact'
import { promises as fs } from 'fs'

function parseTextToJson (text: string) {
  const lines = text.split('\n')
  const json: any[] = []
  let group = ''
  let subGroup = ''

  lines.forEach(line => {
    if (line.startsWith('# group:')) {
      group = line.split(': ')[1]?.trim()
    } else if (line.startsWith('# subgroup:')) {
      subGroup = line.split(': ')[1]?.trim()
    } else if (!line.startsWith('#') && line) {
      const code = line.substring(0, line.indexOf(';')).trim()
      const regex = /# (.+) E(\d+\.\d+) (.+)/
      const match = line.match(regex)
      const emoji = match?.[1]
      const version = match?.[2]
      const name = match?.[3]

      json.push({
        code,
        emoji,
        version,
        name,
        group,
        subGroup
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
