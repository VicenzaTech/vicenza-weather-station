/**
 * MongoDB Helper for MQTT Bridge Service
 * 
 * This module handles saving sensor data to MongoDB
 */

const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'vicenza_weather'

class MongoDBService {
  constructor() {
    this.client = null
    this.db = null
    this.collection = null
    this.connecting = false
  }

  async connect() {
    if (this.client && this.client.topology && this.client.topology.isConnected()) {
      return
    }

    if (this.connecting) {
      console.log('[MongoDB] Connection already in progress...')
      return
    }

    this.connecting = true

    try {
      console.log(`[MongoDB] Connecting to ${MONGODB_URI}...`)
      this.client = new MongoClient(MONGODB_URI)
      await this.client.connect()
      
      this.db = this.client.db(MONGODB_DB)
      this.collection = this.db.collection('sensor_readings')
      
      console.log(`[MongoDB] Connected successfully to database: ${MONGODB_DB}`)
      
      // Create index on timestamp for faster queries
      await this.collection.createIndex({ timestamp: -1 })
      await this.collection.createIndex({ created_at: -1 })
      console.log('[MongoDB] Indexes created successfully')
      
      this.connecting = false
    } catch (error) {
      this.connecting = false
      console.error('[MongoDB] Connection error:', error.message)
      throw error
    }
  }

  async saveSensorReading(data) {
    try {
      if (!this.collection) {
        await this.connect()
      }

      const reading = {
        temp_room: data.temp_room,
        hum_room: data.hum_room,
        temp_out: data.temp_out,
        lux: data.lux,
        ldr_raw: data.ldr_raw,
        timestamp: data.timestamp ? new Date(data.timestamp * 1000) : new Date(),
        created_at: new Date(),
      }

      const result = await this.collection.insertOne(reading)
      const timeStr = reading.timestamp.toLocaleString('vi-VN')
      console.log(`[MongoDB] Saved sensor reading (${timeStr}), ID: ${result.insertedId}`)
      
      return result
    } catch (error) {
      console.error('[MongoDB] Error saving sensor reading:', error.message)
      return null
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close()
      console.log('[MongoDB] Disconnected')
      this.client = null
      this.db = null
      this.collection = null
    }
  }

  isConnected() {
    return this.client && this.client.topology && this.client.topology.isConnected()
  }
}

// Export singleton instance
const mongoService = new MongoDBService()
module.exports = mongoService

