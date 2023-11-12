import { fetch } from 'undici'
function parseTextToJson (text) {
  const lines = text.split('\n')
  const json = []
  let group = null
  let subgroup

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
      const emoji = line.substring(line.indexOf('#') + 1, line.indexOf(' E')).trim()
      const regex = / E(\d+\.\d+) (.+)/
      const match = line.match(regex)
      const version = match[1]
      const name = match[2]

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
  const response = await fetch('https://unicode.org/Public/emoji/latest/emoji-test.txt')
  const res = await response.text()
  const json = parseTextToJson(res)
  console.log(JSON.stringify(json))
}
main()
