import { MongoClient, Db, Collection } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'vicenza_weather'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

interface SensorReading {
  _id?: string
  temp_room: number
  hum_room: number
  temp_out: number
  lux: number
  ldr_raw: number
  timestamp: Date
  created_at: Date
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global as typeof globalThis & {
  mongo?: { client: MongoClient; db: Db }
}

let client: MongoClient
let db: Db

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cached.mongo) {
    return cached.mongo
  }

  if (!client) {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log('[MongoDB] Connected successfully')
  }

  if (!db) {
    db = client.db(MONGODB_DB)
  }

  cached.mongo = { client, db }
  return { client, db }
}

export async function getSensorReadingsCollection(): Promise<Collection<SensorReading>> {
  const { db } = await connectToDatabase()
  return db.collection<SensorReading>('sensor_readings')
}

export interface SensorDataInput {
  temp_room: number
  hum_room: number
  temp_out: number
  lux: number
  ldr_raw: number
  timestamp?: Date
}

/**
 * Save a sensor reading to MongoDB
 */
export async function saveSensorReading(data: SensorDataInput) {
  try {
    const collection = await getSensorReadingsCollection()
    const reading: SensorReading = {
      temp_room: data.temp_room,
      hum_room: data.hum_room,
      temp_out: data.temp_out,
      lux: data.lux,
      ldr_raw: data.ldr_raw,
      timestamp: data.timestamp ?? new Date(),
      created_at: new Date(),
    }
    
    const result = await collection.insertOne(reading as any)
    console.log(`[MongoDB] Saved sensor reading with ID: ${result.insertedId}`)
    return { ...reading, _id: result.insertedId.toString() }
  } catch (error) {
    console.error('[MongoDB] Error saving sensor reading:', error)
    return null
  }
}

/**
 * Get the latest sensor reading from MongoDB
 */
export async function getLatestSensorReading() {
  try {
    const collection = await getSensorReadingsCollection()
    const reading = await collection
      .find()
      .sort({ created_at: -1 })
      .limit(1)
      .toArray()
    
    return reading.length > 0 ? reading[0] : null
  } catch (error) {
    console.error('[MongoDB] Error fetching latest reading:', error)
    return null
  }
}

/**
 * Get sensor readings within a time range
 */
export async function getSensorReadings(from: Date, to: Date, limit = 100) {
  try {
    const collection = await getSensorReadingsCollection()
    const readings = await collection
      .find({
        timestamp: {
          $gte: from,
          $lte: to,
        },
      })
      .sort({ timestamp: 1 })
      .limit(limit)
      .toArray()
    
    return readings
  } catch (error) {
    console.error('[MongoDB] Error fetching readings:', error)
    return []
  }
}

