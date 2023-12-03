import { promises as fs } from 'fs'

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
export default defineEventHandler(async event => {
  await loadEmojiData().catch(err => {
    console.log(err)
  })
  await loadGroupsData().catch(err => {
    console.log(err)
  })
  event.context.emojis = emojis
  event.context.groups = groups
})
