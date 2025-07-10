import fastifyCors from '@fastify/cors'
import { fastify, type FastifyInstance } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { getRoomsRoute } from '../src/http/routes/get-rooms'
import { createRoomRoute } from '../src/http/routes/create-room'
import { getRoomQuestionsRoute } from '../src/http/routes/get-room-questions'
import { createQuestionRoute } from '../src/http/routes/create-question'
import { uploadAudioRoute } from '../src/http/routes/upload-audio'
import { fastifyMultipart } from '@fastify/multipart'
import type { VercelRequest, VercelResponse } from '@vercel/node'

let appInstance: FastifyInstance | null = null

async function getApp() {
  if (appInstance) {
    return appInstance
  }

  const app = fastify({ logger: false }).withTypeProvider<ZodTypeProvider>()

  app.register(fastifyCors, {
    origin: true,
  })

  app.register(fastifyMultipart)

  app.setSerializerCompiler(serializerCompiler)
  app.setValidatorCompiler(validatorCompiler)

  app.get('/health', () => {
    return { status: 200, data: 'OK' }
  })

  app.register(getRoomsRoute)
  app.register(createRoomRoute)
  app.register(getRoomQuestionsRoute)
  app.register(createQuestionRoute)
  app.register(uploadAudioRoute)

  await app.ready()
  appInstance = app
  return app
}

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const app = await getApp()
    const response = await app.inject({
      method: (req.method || 'GET') as
        | 'GET'
        | 'POST'
        | 'PUT'
        | 'DELETE'
        | 'PATCH'
        | 'HEAD'
        | 'OPTIONS',
      url: req.url || '/',
      headers: req.headers,
      payload:
        req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH'
          ? req.body
          : undefined,
    })

    res.status(response.statusCode)
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
      res.json(JSON.parse(response.payload))
    } else {
      res.send(response.payload)
    }
  } catch {
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
