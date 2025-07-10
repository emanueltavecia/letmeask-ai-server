import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { count, eq } from 'drizzle-orm'
import { db } from '../../db/connection'
import { schema } from '../../db/schema/index'

export const getRoomsRoute: FastifyPluginCallbackZod = (app) => {
  app.get('/rooms', async () => {
    const results = await db
      .select({
        id: schema.rooms.id,
        name: schema.rooms.name,
        questionsCount: count(schema.questions.id),
        createdAt: schema.rooms.createdAt,
      })
      .from(schema.rooms)
      .leftJoin(schema.questions, eq(schema.rooms.id, schema.questions.roomId))
      .groupBy(schema.rooms.id)
      .orderBy(schema.rooms.createdAt)

    return results
  })
}
