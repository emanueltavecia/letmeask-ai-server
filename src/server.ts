import fastifyCors from '@fastify/cors'
import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { getRoomsRoute } from './http/routes/get-rooms'
import { createRoomRoute } from './http/routes/create-room'
import { getRoomQuestionsRoute } from './http/routes/get-room-questions'
import { createQuestionRoute } from './http/routes/create-question'
import { uploadAudioRoute } from './http/routes/upload-audio'
import { fastifyMultipart } from '@fastify/multipart'
import type { IncomingMessage, ServerResponse } from 'node:http'

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

export default async (req: IncomingMessage, res: ServerResponse) => {
  await app.ready()
  app.routing(req, res)
}
