import { promises as fs } from 'fs'
import { chatGPT } from './openAI'
import { groupNamePrompt } from './prompts'
import locale from '../locale'
import stringify from 'json-stringify-pretty-compact'
function batch (arr: any[], size: number) {
  const batches = []
  /* eslint-disable @typescript-eslint/restrict-plus-operands */
  for (let i = 0; i < arr.length; i += size) {
    batches.push(arr.slice(i, i + size))
  }
  return batches
}
async function main () {
  const file = './data/group-translate.json'
  let groupData: any[] = []
  try {
    const groupDataStr = await fs.readFile('./data/groupNames.json', { encoding: 'utf-8' })
    groupData = JSON.parse(groupDataStr)
  } catch (e: any) {
    console.log(`emoji data read error：${e.message}`)
  }
  let existTranslate: any[] = []
  try {
    const existTranslateStr = await fs.readFile(file, { encoding: 'utf-8' })
    existTranslate = JSON.parse(existTranslateStr)
  } catch (e: any) {
    console.log(`emoji index read error：${e.message}`)
  }

  console.log('total:', groupData.length)
  const pending = groupData.filter(gd => !existTranslate.find(ex => ex.name === gd))
  console.log('pending:', pending.length)
  const langs = locale.map(l => l.code)

  const batchData = batch(pending, 8)

  for (const currentWords of batchData) {
    const prompt = groupNamePrompt(langs, currentWords)
    try {
      const res: any = await chatGPT(prompt)
      console.log(`tokens: ${res.usage.total_tokens} (${res.usage.prompt_tokens} + ${res.usage.completion_tokens})`)
      const data = res.choices[0].message.content
      const JSONData = JSON.parse(data)
      const aiRes = Object.values(JSONData)?.[0] as any[]
      const filtered = aiRes.filter(r => Object.keys(r).length === 31)
      // console.log(stringify(aiRes))
      existTranslate.push(...filtered)
      await fs.writeFile(file, stringify(existTranslate))
    } catch (err) {
      console.log('Something Wrong: ', err)
    }
  }
  if (pending.length === 0) {
    existTranslate.sort((x, y) => {
      return groupData.indexOf(x.name) - groupData.indexOf(y.name)
    })
    await fs.writeFile(file, stringify(existTranslate))
  }
}
main()
