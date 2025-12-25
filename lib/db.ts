import { PrismaClient } from '@prisma/client'

// Prevent multiple instances in development
const globalForPrisma = global as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export interface SensorDataInput {
  tempRoom: number
  humRoom: number
  tempOut: number
  lux: number
  ldrRaw: number
  timestamp?: Date
}

/**
 * Save a sensor reading to the database
 * Note: On Vercel, file-based SQLite doesn't work. Use a cloud database instead.
 */
export async function saveSensorReading(data: SensorDataInput) {
  try {
    // Check if database is available (not file-based SQLite on Vercel)
    const dbUrl = process.env.DATABASE_URL || ''
    if (dbUrl.startsWith('file:') && process.env.VERCEL) {
      console.warn('[DB] File-based SQLite not supported on Vercel. Skipping database save.')
      return null
    }

    const reading = await prisma.sensorReading.create({
      data: {
        tempRoom: data.tempRoom,
        humRoom: data.humRoom,
        tempOut: data.tempOut,
        lux: data.lux,
        ldrRaw: data.ldrRaw,
        timestamp: data.timestamp ?? new Date(),
      }
    })
    return reading
  } catch (error) {
    console.error('[DB] Error saving sensor reading:', error)
    return null
  }
}

/**
 * Get the latest sensor reading from the database
 * Note: On Vercel, file-based SQLite doesn't work. Use a cloud database instead.
 */
export async function getLatestSensorReading() {
  try {
    // Check if database is available (not file-based SQLite on Vercel)
    const dbUrl = process.env.DATABASE_URL || ''
    if (dbUrl.startsWith('file:') && process.env.VERCEL) {
      console.warn('[DB] File-based SQLite not supported on Vercel. Returning null.')
      return null
    }

    const reading = await prisma.sensorReading.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    return reading
  } catch (error) {
    console.error('[DB] Error fetching latest reading:', error)
    return null
  }
}

/**
 * Get sensor readings within a time range
 * Note: On Vercel, file-based SQLite doesn't work. Use a cloud database instead.
 */
export async function getSensorReadings(from: Date, to: Date, limit = 100) {
  try {
    // Check if database is available (not file-based SQLite on Vercel)
    const dbUrl = process.env.DATABASE_URL || ''
    if (dbUrl.startsWith('file:') && process.env.VERCEL) {
      console.warn('[DB] File-based SQLite not supported on Vercel. Returning empty array.')
      return []
    }

    const readings = await prisma.sensorReading.findMany({
      where: {
        timestamp: {
          gte: from,
          lte: to
        }
      },
      orderBy: { timestamp: 'asc' },
      take: limit
    })
    return readings
  } catch (error) {
    console.error('[DB] Error fetching readings:', error)
    return []
  }
}
