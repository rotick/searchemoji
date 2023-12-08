import { promises as fs } from 'fs'
import stringify from 'json-stringify-pretty-compact'
import { chatGPT } from './openAI'
import { complementNamePrompt } from './prompts'
import locale from '../locale'

// async function main () {
//   const file = './data/emoji-index.json'
//   let groupNames: any[] = []
//   try {
//     const groupDataStr = await fs.readFile('./data/groupNames.json', { encoding: 'utf-8' })
//     groupNames = JSON.parse(groupDataStr)
//   } catch (e: any) {
//     console.log(`read error：${e.message}`)
//   }
//   let existIndex: any[] = []
//   try {
//     const existIndexStr = await fs.readFile(file, { encoding: 'utf-8' })
//     existIndex = JSON.parse(existIndexStr)
//   } catch (e: any) {
//     console.log(`read error：${e.message}`)
//   }
//   existIndex.forEach(ex => {
//     ex.g = groupNames.findIndex(gn => gn === ex.g)
//     ex.s = groupNames.findIndex(gn => gn === ex.s)
//   })
//   await fs.writeFile(file, stringify(existIndex))
// }
// async function main () {
//   const file = './data/emoji-index.json'
//   let existIndex: any[] = []
//   try {
//     const existIndexStr = await fs.readFile(file, { encoding: 'utf-8' })
//     existIndex = JSON.parse(existIndexStr)
//   } catch (e: any) {
//     console.log(`read error：${e.message}`)
//   }
//   const filtered = existIndex.filter(ex => !ex.k || Object.keys(ex.k).length === 30)
//   await fs.writeFile(file, stringify(filtered))
// }
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
  let existIndex: any[] = []
  try {
    const existIndexStr = await fs.readFile(file, { encoding: 'utf-8' })
    existIndex = JSON.parse(existIndexStr)
  } catch (e: any) {
    console.log(`read error：${e.message}`)
  }
  const emojis = existIndex.filter(ex => (ex.t && Object.keys(ex.t).length < 30) || (ex.k && Object.keys(ex.k).length < 30)).map(ex => `${ex.e}:${ex.n}`)
  let emojisLength = emojis.length
  console.log(emojis)

  const langs = locale.map(l => l.code)
  const batchEmojis = batch(emojis, 2)
  for (const currentWords of batchEmojis) {
    emojisLength -= 7
    console.log('pending:', emojisLength)
    const prompt = complementNamePrompt(langs, currentWords)
    try {
      const res: any = await chatGPT(prompt)
      console.log(`tokens: ${res.usage.total_tokens} (${res.usage.prompt_tokens} + ${res.usage.completion_tokens})`)
      const data = res.choices[0].message.content
      console.log(data)
      const JSONData = JSON.parse(data)
      const aiResArr = Object.values(JSONData)?.[0]
      for (const aiRes of aiResArr as any[]) {
        const langsLength = Object.keys(aiRes.name).length
        if (langsLength < 30) {
          console.log('Bad result')
          continue
        }
        // console.log(stringify(aiRes))
        const target = existIndex.find(ed => ed.e === aiRes.emoji)
        target.t = aiRes.name
      }
      await fs.writeFile(file, stringify(existIndex))
    } catch (err) {
      console.log('Something Wrong: ', err)
    }
  }
}
// function unique (arr, key) {
//   const result = []
//   const seen = new Set()
//
//   for (let i = 0; i < arr.length; i++) {
//     const item = arr[i]
//     if (!seen.has(item[key])) {
//       result.push(item)
//       seen.add(item[key])
//     }
//   }
//
//   return result
// }
// async function main () {
//   const file = './data/emoji-index.json'
//   let existIndex: any[] = []
//   try {
//     const existIndexStr = await fs.readFile(file, { encoding: 'utf-8' })
//     existIndex = JSON.parse(existIndexStr)
//   } catch (e: any) {
//     console.log(`read error：${e.message}`)
//   }
//   existIndex = unique(existIndex, 'c')
//   await fs.writeFile(file, JSON.stringify(existIndex))
// }
main()
// 1FAE0
// todo generate emoji name with skin tone
// async function generateNameWithSkinTone () {
//   console.log('start generateNameWithSkinTone')
//   const file = './data/emoji-index.json'
//   let existIndex: any[] = []
//   try {
//     const existIndexStr = await fs.readFile(file, { encoding: 'utf-8' })
//     existIndex = JSON.parse(existIndexStr)
//   } catch (e: any) {
//     console.log(`read error：${e.message}`)
//   }
//   const emojis = existIndex.filter(ex => !ex.t).map(ex => `${ex.e}:${ex.n}`)
//   let emojisLength = emojis.length
//
//   const langs = locale.map(l => l.code)
//   const batchEmojis = batch(emojis, 6)
//   for (const currentWords of batchEmojis) {
//     emojisLength -= 6
//     console.log('pending:', emojisLength)
//     const prompt = complementNamePrompt(langs, currentWords)
//     try {
//       const res: any = await chatGPT(prompt)
//       console.log(`tokens: ${res.usage.total_tokens} (${res.usage.prompt_tokens} + ${res.usage.completion_tokens})`)
//       const data = res.choices[0].message.content
//       console.log(data)
//       const JSONData = JSON.parse(data)
//       const aiResArr = Object.values(JSONData)?.[0]
//       for (const aiRes of aiResArr as any[]) {
//         const langsLength = Object.keys(aiRes.name).length
//         if (langsLength < 30) {
//           console.log('Bad result')
//           continue
//         }
//         // console.log(stringify(aiRes))
//         const target = existIndex.find(ed => ed.e === aiRes.emoji)
//         target.t = aiRes.name
//       }
//       await fs.writeFile(file, stringify(existIndex))
//     } catch (err) {
//       console.log('Something Wrong: ', err)
//     }
//   }
// }
