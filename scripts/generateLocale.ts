import en from '../lang/en.json'
import zh from '../lang/zh-hans.json'
import { localePrompt } from './prompts'
import { promises as fs } from 'node:fs'
import { chatGPT } from './openAI'
import stringify from 'json-stringify-pretty-compact'
import locale from '../locale'

async function main (lang: string) {
  const prompt = localePrompt(en, zh, lang)
  console.log(lang)
  // console.log(prompt)
  const res: any = await chatGPT(prompt)
  console.log(`tokens: ${res.usage.total_tokens} (${res.usage.prompt_tokens} + ${res.usage.completion_tokens})`)
  const data = JSON.parse(res.choices[0].message.content)

  await fs.writeFile(`./lang/${lang}.json`, stringify(data))
}

// const badResult = ['da', 'fi', 'he', 'hu', 'id', 'it', 'th', 'tr'].map(lang => ({ code: lang }))
async function go () {
  for (const l of locale) {
    if (l.code !== 'en' && l.code !== 'zh-hans') {
      await main(l.code)
    }
  }
}

go()
