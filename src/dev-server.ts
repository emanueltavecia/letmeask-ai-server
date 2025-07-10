import fastifyCors from '@fastify/cors'
import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from './env'
import { getRoomsRoute } from './http/routes/get-rooms'
import { createRoomRoute } from './http/routes/create-room'
import { getRoomQuestionsRoute } from './http/routes/get-room-questions'
import { createQuestionRoute } from './http/routes/create-question'
import { uploadAudioRoute } from './http/routes/upload-audio'
import { fastifyMultipart } from '@fastify/multipart'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: 'http://localhost:5173',
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

app.listen({ port: env.PORT })
