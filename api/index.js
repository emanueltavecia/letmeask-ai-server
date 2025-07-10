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

// Configuração para Vercel desabilitar body parsing
export const config = {
  api: {
    bodyParser: false,
  },
}

let appInstance = null

async function getApp() {
  if (appInstance) {
    return appInstance
  }

  const app = fastify({ 
    logger: false,
    // Configurações específicas para Vercel
    disableRequestLogging: true,
    trustProxy: true
  })

  await app.register(fastifyCors, {
    origin: true,
  })

  await app.register(fastifyMultipart, {
    // Configurações específicas para lidar com multipart no Vercel
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  })

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
  
  // Com bodyParser: false, o Vercel não vai parsear o body automaticamente
  // permitindo que o Fastify processe multipart corretamente
  const response = await app.inject({
    method: req.method || 'GET',
    url: req.url || '/',
    headers: req.headers,
    payload: req,
    simulate: {
      split: true,
    },
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
