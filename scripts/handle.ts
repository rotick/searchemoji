import { promises as fs } from 'fs'
import stringify from 'json-stringify-pretty-compact'

async function main () {
  const file = './data/emoji-index.json'
  let groupNames: any[] = []
  try {
    const groupDataStr = await fs.readFile('./data/groupNames.json', { encoding: 'utf-8' })
    groupNames = JSON.parse(groupDataStr)
  } catch (e: any) {
    console.log(`read error：${e.message}`)
  }
  let existIndex: any[] = []
  try {
    const existIndexStr = await fs.readFile(file, { encoding: 'utf-8' })
    existIndex = JSON.parse(existIndexStr)
  } catch (e: any) {
    console.log(`read error：${e.message}`)
  }
  existIndex.forEach(ex => {
    ex.g = groupNames.findIndex(gn => gn === ex.g)
    ex.s = groupNames.findIndex(gn => gn === ex.s)
  })
  await fs.writeFile(file, stringify(existIndex))
}
main()
