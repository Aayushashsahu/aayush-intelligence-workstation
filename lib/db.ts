import { MongoClient, type Db } from 'mongodb'

/**
 * Server-only MongoDB connection.
 *
 * MONGODB_URI is read at call time (not module scope) so the value is always the
 * one present in the running serverless environment. If it is absent the whole
 * datastore layer degrades to the committed seed content and the public site keeps
 * working.
 */

declare global {
  var __workstationMongo: Promise<MongoClient> | undefined
}

function uri(): string {
  return process.env.MONGODB_URI || ''
}

export function storageConfigured(): boolean {
  return uri().length > 0
}

function dbName(): string {
  if (process.env.MONGODB_DB) return process.env.MONGODB_DB
  try {
    const parsed = new URL(uri())
    const path = parsed.pathname.replace(/^\//, '')
    if (path) return path
  } catch {
    // fall through to the default database name
  }
  return 'workstation'
}

async function connect(): Promise<MongoClient> {
  const connection = uri()
  if (!connection) throw new Error('MONGODB_URI is not configured')
  if (!global.__workstationMongo) {
    const client = new MongoClient(connection, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 6000,
    })
    global.__workstationMongo = client.connect().catch((error) => {
      // Never cache a failed connection.
      global.__workstationMongo = undefined
      throw error
    })
  }
  return global.__workstationMongo
}

export async function getDb(): Promise<Db> {
  const client = await connect()
  return client.db(dbName())
}
