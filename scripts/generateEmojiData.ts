// import { fetch } from 'undici'
import stringify from 'json-stringify-pretty-compact'
import { promises as fs } from 'fs'
import { qualityMap } from '~/utils'

function parseTextToJson (text: string) {
  const lines = text.split('\n')
  const groupNames: string[] = []
  const json: any[] = []
  let group = ''
  let subGroup = ''

  lines.forEach(line => {
    if (line.startsWith('# group:')) {
      group = line.split(': ')[1]?.trim()
      if (!groupNames.includes(group)) {
        groupNames.push(group)
      }
    } else if (line.startsWith('# subgroup:')) {
      subGroup = line.split(': ')[1]?.trim()
      if (!groupNames.includes(subGroup)) {
        groupNames.push(subGroup)
      }
    } else if (!line.startsWith('#') && line) {
      const regex = /(.+) ; (.+) # (.+) E(\d+\.\d+) (.+)/
      const match = line.match(regex)
      const code = match?.[1].trim() || ''
      const quality = match?.[2].trim() || ''
      const emoji = match?.[3]
      const version = match?.[4]
      const name = match?.[5]

      json.push({
        c: code.replace(/ /g, '-'),
        q: qualityMap[quality],
        e: emoji,
        v: version,
        n: name,
        g: group,
        s: subGroup
      })
    }
  })

  const JsonWithGroupIndex = json.map(j => ({
    ...j,
    g: groupNames.findIndex(gn => gn === j.g),
    s: groupNames.findIndex(gn => gn === j.s)
  }))
  return [JsonWithGroupIndex, groupNames]
}
async function main () {
  // const response = await fetch('https://unicode.org/Public/emoji/latest/emoji-test.txt')
  // const res = await response.text()
  const res = await fs.readFile('./data/emoji-test.txt', { encoding: 'utf-8' })
  const [json, groupNames] = parseTextToJson(res)
  await fs.writeFile('./data/emoji.json', stringify(json))
  await fs.writeFile('./data/groupNames.json', stringify(groupNames))
}
main()
