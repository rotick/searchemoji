import { promises as fs } from 'fs'
// import { chatGPT } from './openAI'
// import { keywords } from './prompts'
import stringify from 'json-stringify-pretty-compact'
async function main () {
  const file = './data/emoji-index.json'
  let emojiData: any[] = []
  try {
    const emojiDataStr = await fs.readFile('./data/emoji.json', { encoding: 'utf-8' })
    emojiData = JSON.parse(emojiDataStr)
  } catch (e: any) {
    console.log(`emoji data read error：${e.message}`)
  }

  console.log(emojiData.length)
  // const promptWords = emojiData.map(ed => (`${ed.emoji}:${ed.name}`))

  // const res = await chatGPT(keywords + JSON.stringify(promptWords))
  const res = [
    {
      emoji: '😀',
      keywords: {
        en: ['smile', 'laugh', 'happy', 'haha'],
        zh: ['嘿嘿', '咧嘴', '笑脸', '开心', '喜悦', '大笑']
      }
    },
    {
      emoji: '😃',
      keywords: {
        en: ['smile', 'laugh', 'happy', 'haha'],
        zh: ['哈哈', '咧嘴', '笑脸', '开心', '喜悦', '大笑']
      }
    }
  ]
  res.forEach(r => {
    const target = emojiData.find(ed => ed.emoji === r.emoji)
    target.keywords = r.keywords
  })
  await fs.writeFile(file, stringify(emojiData))
}
main()
