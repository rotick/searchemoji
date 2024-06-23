import { promises as fs } from 'fs'
// import emojis from '../../data/emoji-index.json'
// import groups from '../../data/group-translate.json'

let emojis: any[] = []
let loadEmojisPromise: Promise<any> | null = null
async function loadEmojiData () {
  if (emojis.length) {
    return Promise.resolve(emojis)
  }
  if (loadEmojisPromise) {
    return loadEmojisPromise
  }
  // eslint-disable-next-line
  loadEmojisPromise = new Promise(async (resolve, reject) => {
    try {
      const emojiDataStr = await fs.readFile('./data/emoji-index.json', { encoding: 'utf-8' })
      emojis = JSON.parse(emojiDataStr)
      resolve(emojis)
    } catch (err) {
      reject(err)
    }
    loadEmojisPromise = null
  })
  return loadEmojisPromise
}
let groups: any[] = []
let loadGroupsPromise: Promise<any> | null = null
async function loadGroupsData () {
  if (groups.length) {
    return Promise.resolve(groups)
  }
  if (loadGroupsPromise) {
    return loadGroupsPromise
  }
  // eslint-disable-next-line
  loadGroupsPromise = new Promise(async (resolve, reject) => {
    try {
      const groupDataStr = await fs.readFile('./data/group-translate.json', { encoding: 'utf-8' })
      groups = JSON.parse(groupDataStr)
      resolve(groups)
    } catch (err) {
      reject(err)
    }
    loadGroupsPromise = null
  })
  return loadGroupsPromise
}
function extractName (str: string) {
  if (str.includes(':') && !str.includes(',')) {
    str = str.replace(/: \w+(-\w+)* skin tone/g, '')
  }
  if (str.includes(':') && str.includes(',')) {
    str = str
      .replace(/\w+(-\w+)* skin tone, /g, '')
      .replace(/(,|:) \w+(-\w+)* skin tone/g, '')
      .replace(/ \w+(-\w+)* skin tone/g, '')
  }
  return str.trim()
}

export default defineEventHandler(async event => {
  await loadEmojiData().catch(err => {
    console.log(err)
  })
  await loadGroupsData().catch(err => {
    console.log(err)
  })
  const skinToneGroupIndex = groups.findIndex(gn => gn.name === 'People & Body')
  const hasSkinTone = emojis
    .filter(ve => ve.g === skinToneGroupIndex && !ve.n.includes('skin tone'))
    .reduce((acc, cur) => {
      acc[cur.n] = cur
      return acc
    }, {})
  const langs = Object.keys(emojis[0].t)
  for (const item of emojis) {
    // To save tokens, tone-modified emoji will not have their own separate keyword generation, but will share the keywords from their non-tone-modified versions.
    if (item.n.includes('skin tone') && !item.t) {
      const name = extractName(item.n)
      const target = hasSkinTone[name]
      item.t = {}
      if (target) {
        for (const i in target.t) {
          item.t[i] = `${target.t[i]} (${item.n})`
        }
        item.k = target.k
      } else {
        item.k = {}
        for (const i of langs) {
          item.t[i] = item.n
          item.k[i] = [item.n]
        }
      }
    }
  }
  event.context.emojis = emojis
  event.context.groups = groups
})
