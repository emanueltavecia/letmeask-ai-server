import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { schema } from './schema'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required')
}

export const sql = postgres(databaseUrl)
export const db = drizzle(sql, {
  schema,
  casing: 'snake_case',
})
