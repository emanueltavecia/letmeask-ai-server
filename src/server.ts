import fastifyCors from '@fastify/cors'
import { fastify, type FastifyInstance } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { getRoomsRoute } from './http/routes/get-rooms'
import { createRoomRoute } from './http/routes/create-room'
import { getRoomQuestionsRoute } from './http/routes/get-room-questions'
import { createQuestionRoute } from './http/routes/create-question'
import { uploadAudioRoute } from './http/routes/upload-audio'
import { fastifyMultipart } from '@fastify/multipart'
import type { IncomingMessage, ServerResponse } from 'node:http'

let appInstance: FastifyInstance | null = null

async function getApp() {
  if (appInstance) {
    return appInstance
  }

  const app = fastify({ logger: false })

  await app.register(fastifyCors, {
    origin: true,
  })

  await app.register(fastifyMultipart)

  app.setSerializerCompiler(serializerCompiler)
  app.setValidatorCompiler(validatorCompiler)

  app.get('/health', () => {
    return { status: 200, data: 'OK' }
  })

  await app.register(getRoomsRoute)
  await app.register(createRoomRoute)
  await app.register(getRoomQuestionsRoute)
  await app.register(createQuestionRoute)
  await app.register(uploadAudioRoute)

  await app.ready()
  appInstance = app
  return app
}
export default async (req: IncomingMessage, res: ServerResponse) => {
  try {
    let body: string | undefined
    if (
      req.method === 'POST' ||
      req.method === 'PUT' ||
      req.method === 'PATCH'
    ) {
      const chunks: Buffer[] = []
      for await (const chunk of req) {
        chunks.push(chunk)
      }
      body = Buffer.concat(chunks).toString()
    }

    const app = await getApp()
    const response = await app.inject({
      method: (req.method || 'GET') as
        | 'GET'
        | 'POST'
        | 'PUT'
        | 'PATCH'
        | 'DELETE',
      url: req.url || '/',
      headers: req.headers,
      payload: body,
    })

    res.statusCode = response.statusCode
    for (const [key, value] of Object.entries(response.headers)) {
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        Array.isArray(value)
      ) {
        res.setHeader(key, value)
      }
    }

    if (response.headers['content-type']?.includes('application/json')) {
      res.setHeader('Content-Type', 'application/json')
      res.end(response.payload)
    } else {
      res.end(response.payload)
    }
  } catch {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Internal Server Error' }))
  }
}
