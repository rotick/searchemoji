import { createParser } from 'eventsource-parser'
import { ProxyAgent, fetch, Response } from 'undici'
import { ReadableStream } from 'node:stream/web'
import dotenv from 'dotenv'
import type { ParsedEvent, ReconnectInterval } from 'eventsource-parser'
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}
dotenv.config()

const model = process.env.OPENAI_API_MODEL || 'gpt-3.5-turbo'
const apiKey = process.env.OPENAI_API_KEY as string
const httpsProxy = process.env.HTTPS_PROXY
const baseUrl = (process.env.OPENAI_API_BASE_URL || 'https://api.openai.com').trim().replace(/\/$/, '')

export async function chatGPT (message: string) {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'You are a helpful assistant who is proficient in various languages and designed to output JSON.'
    },
    { role: 'user', content: message }
  ]
  const initOptions = generatePayload(apiKey, messages)
  if (httpsProxy) initOptions.dispatcher = new ProxyAgent(httpsProxy)
  // @ts-expect-error wtf
  const response = await fetch(`${baseUrl}/v1/chat/completions`, initOptions)
  return await response.json()

  // return parseOpenAIStream(response)
}

export const generatePayload = (apiKey: string, messages: ChatMessage[]): RequestInit & { dispatcher?: any } => ({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`
  },
  method: 'POST',
  body: JSON.stringify({
    model,
    messages,
    temperature: 1,
    stream: false,
    response_format: { type: 'json_object' }
  })
})

export const parseOpenAIStream = (rawResponse: Response) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  if (!rawResponse.ok) {
    return new Response(rawResponse.body, {
      status: rawResponse.status,
      statusText: rawResponse.statusText
    })
  }

  const stream = new ReadableStream({
    async start (controller) {
      const streamParser = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data
          if (data === '[DONE]') {
            controller.close()
            return
          }
          try {
            const json = JSON.parse(data)
            const text = json.choices[0].delta?.content || ''
            const queue = encoder.encode(text)
            controller.enqueue(queue)
          } catch (e) {
            controller.error(e)
          }
        }
      }

      const parser = createParser(streamParser)
      for await (const chunk of rawResponse.body as any) {
        parser.feed(decoder.decode(chunk))
      }
    }
  })

  return new Response(stream)
}
