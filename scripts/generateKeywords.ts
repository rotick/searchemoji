import { promises as fs } from 'fs'
import { chatGPT } from './openAI'
import { keywords } from './prompts'
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
  const file = './data/emoji-index.json'
  let emojiData: any[] = []
  try {
    const emojiDataStr = await fs.readFile('./data/emoji.json', { encoding: 'utf-8' })
    emojiData = JSON.parse(emojiDataStr)
  } catch (e: any) {
    console.log(`emoji data read error：${e.message}`)
  }
  let existIndex: any[] = []
  try {
    const existIndexStr = await fs.readFile(file, { encoding: 'utf-8' })
    existIndex = JSON.parse(existIndexStr)
  } catch (e: any) {
    console.log(`emoji index read error：${e.message}`)
  }

  console.log('total:', emojiData.length)
  const emojis = emojiData
    .filter(ed => !existIndex.find(ex => ex.e === ed.e) && (!ed.n.includes('skin tone') || ed.s === 'skin-tone'))
    .map(ed => `${ed.e}:${ed.n}`)
  console.log('pending:', emojis.length)
  const langs = locale.map(l => l.code)

  const batchEmojis = batch(emojis, 1)

  for (const currentWords of batchEmojis) {
    const prompt = keywords(langs, currentWords)
    const res: any = await chatGPT(prompt)
    console.log(`tokens: ${res.usage.total_tokens} (${res.usage.prompt_tokens} + ${res.usage.completion_tokens})`)
    const data = res.choices[0].message.content
    const JSONData = JSON.parse(data)
    // @ts-expect-error wtf
    const aiRes = Object.values(JSONData)?.[0][0]
    // console.log(stringify(aiRes))
    const target = emojiData.find(ed => ed.e === aiRes.emoji)
    target.k = aiRes.keywords
    target.t = aiRes.name
    existIndex.push(target)
    await fs.writeFile(file, stringify(existIndex))
  }
  const skinToneData = emojiData
    .filter(ed => !existIndex.find(ex => ex.e === ed.e) && ed.n.includes('skin tone') && ed.s !== 'skin-tone')
    .map(ed => ({
      ...ed,
      k: null,
      t: null
    }))
  existIndex.push(...skinToneData)
  await fs.writeFile(file, stringify(existIndex))
}
main()
