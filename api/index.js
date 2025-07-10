import fastifyCors from '@fastify/cors'
import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { getRoomsRoute } from '../dist/http/routes/get-rooms.js'
import { createRoomRoute } from '../dist/http/routes/create-room.js'
import { getRoomQuestionsRoute } from '../dist/http/routes/get-room-questions.js'
import { createQuestionRoute } from '../dist/http/routes/create-question.js'
import { uploadAudioRoute } from '../dist/http/routes/upload-audio.js'
import { fastifyMultipart } from '@fastify/multipart'

let appInstance = null

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

async function handleRequest(req, res) {
  const app = await getApp()
  
  // Para requisições multipart, precisamos passar o req original para o Fastify
  // conseguir processar corretamente os arquivos
  let payload
  
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'] || ''
    
    if (!contentType.includes('multipart/form-data')) {
      payload = req.body
    }
  }

  const response = await app.inject({
    method: req.method || 'GET',
    url: req.url || '/',
    headers: req.headers,
    payload,
    // Para multipart, passamos o request original
    ...(req.headers['content-type']?.includes('multipart/form-data') && {
      simulate: {
        split: true,
      },
      remoteAddress: req.socket?.remoteAddress,
    }),
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
}

export default async (req, res) => {
  try {
    await handleRequest(req, res)
  } catch {
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
