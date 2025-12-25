/**
 * Database module - MongoDB implementation
 * 
 * This module provides database functions for sensor readings using MongoDB.
 * It replaces the previous Prisma/SQLite implementation.
 */

import { 
  saveSensorReading as mongoSaveSensorReading,
  getLatestSensorReading as mongoGetLatestSensorReading,
  getSensorReadings as mongoGetSensorReadings,
  SensorDataInput
} from './mongodb'

export type { SensorDataInput }

/**
 * Save a sensor reading to the database
 */
export async function saveSensorReading(data: SensorDataInput) {
  return mongoSaveSensorReading(data)
}

/**
 * Get the latest sensor reading from the database
 */
export async function getLatestSensorReading() {
  const reading = await mongoGetLatestSensorReading()
  
  if (!reading) return null
  
  // Transform MongoDB document to match expected format
  return {
    id: reading._id?.toString() || '',
    tempRoom: reading.temp_room,
    humRoom: reading.hum_room,
    tempOut: reading.temp_out,
    lux: reading.lux,
    ldrRaw: reading.ldr_raw,
    timestamp: reading.timestamp,
    createdAt: reading.created_at,
  }
}

/**
 * Get sensor readings within a time range
 */
export async function getSensorReadings(from: Date, to: Date, limit = 100) {
  const readings = await mongoGetSensorReadings(from, to, limit)
  
  // Transform MongoDB documents to match expected format
  return readings.map((reading) => ({
    id: reading._id?.toString() || '',
    tempRoom: reading.temp_room,
    humRoom: reading.hum_room,
    tempOut: reading.temp_out,
    lux: reading.lux,
    ldrRaw: reading.ldr_raw,
    timestamp: reading.timestamp,
    createdAt: reading.created_at,
  }))
}
