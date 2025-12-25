import mqtt, { MqttClient } from 'mqtt'

export interface SensorData {
  temp_room: number
  hum_room: number
  temp_out: number
  lux: number
  ldr_raw: number
  timestamp: number
}

type Subscriber = (data: SensorData) => void

// HiveMQ Configuration (for Vercel deployment)
const HIVEMQ_HOST = process.env.HIVEMQ_HOST
const HIVEMQ_PORT = Number(process.env.HIVEMQ_PORT || 8883)
const HIVEMQ_USERNAME = process.env.HIVEMQ_USERNAME
const HIVEMQ_PASSWORD = process.env.HIVEMQ_PASSWORD
const HIVEMQ_TOPIC = process.env.HIVEMQ_TOPIC || 'vicenza/weather/data'
const HIVEMQ_CLIENT_ID = process.env.HIVEMQ_CLIENT_ID || `vicenza-client-${Date.now()}`

// Local MQTT Configuration (for local development)
const LOCAL_MQTT_HOST = process.env.LOCAL_MQTT_HOST || process.env.MQTT_HOST || '192.168.221.4'
const LOCAL_MQTT_PORT = Number(process.env.LOCAL_MQTT_PORT || process.env.MQTT_PORT || 1883)
const LOCAL_MQTT_USERNAME = process.env.LOCAL_MQTT_USERNAME || process.env.MQTT_USERNAME
const LOCAL_MQTT_PASSWORD = process.env.LOCAL_MQTT_PASSWORD || process.env.MQTT_PASSWORD
const LOCAL_MQTT_TOPIC = process.env.LOCAL_MQTT_TOPIC || process.env.MQTT_TOPIC || 'vicenza/weather/data'

// Determine which MQTT broker to use
// If HIVEMQ_HOST is set, use HiveMQ (Vercel), otherwise use local MQTT
const USE_HIVEMQ = !!HIVEMQ_HOST
const MQTT_HOST = USE_HIVEMQ ? HIVEMQ_HOST! : LOCAL_MQTT_HOST
const MQTT_PORT = USE_HIVEMQ ? HIVEMQ_PORT : LOCAL_MQTT_PORT
const MQTT_USERNAME = USE_HIVEMQ ? HIVEMQ_USERNAME : LOCAL_MQTT_USERNAME
const MQTT_PASSWORD = USE_HIVEMQ ? HIVEMQ_PASSWORD : LOCAL_MQTT_PASSWORD
const MQTT_TOPIC = USE_HIVEMQ ? HIVEMQ_TOPIC : LOCAL_MQTT_TOPIC

class MqttService {
  private client: MqttClient | null = null
  private latestData: SensorData | null = null
  private subscribers: Set<Subscriber> = new Set()
  private connecting = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private lastErrorTime = 0
  private errorThrottleMs = 10000 // Chỉ log lỗi mỗi 10 giây

  connect() {
    if (this.client || this.connecting) {
      if (this.client?.connected) {
        console.log('[MQTT] Already connected, skipping connection attempt')
      } else {
        console.log('[MQTT] Connection already in progress, skipping')
      }
      return
    }
    this.connecting = true

    // Determine protocol based on port and broker type
    let protocol = 'mqtt'
    if (USE_HIVEMQ) {
      // HiveMQ: use mqtts for port 8883, ws for port 8080
      protocol = MQTT_PORT === 8883 ? 'mqtts' : MQTT_PORT === 8080 ? 'ws' : 'mqtt'
    }

    const url = `${protocol}://${MQTT_HOST}:${MQTT_PORT}`
    const brokerType = USE_HIVEMQ ? 'HiveMQ' : 'Local MQTT'
    console.log(`[MQTT] Connecting to ${brokerType}: ${url}`)
    console.log(`[MQTT] Topic: ${MQTT_TOPIC}, Client ID: ${USE_HIVEMQ ? HIVEMQ_CLIENT_ID : `local-client-${Date.now()}`}`)

    const options: any = {
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
      reconnectPeriod: 5000,
      connectTimeout: 10_000,
      keepalive: 30,
      clientId: USE_HIVEMQ ? HIVEMQ_CLIENT_ID : `local-client-${Date.now()}`,
      will: {
        topic: 'vicenza/weather/status',
        payload: 'offline',
        qos: 1,
        retain: false,
      },
    }

    // Add TLS options for secure HiveMQ connection
    if (USE_HIVEMQ && protocol === 'mqtts') {
      options.rejectUnauthorized = false // Set to true in production with proper certificates
    }

    this.client = mqtt.connect(url, options)

    this.client.on('connect', () => {
      this.connecting = false
      this.reconnectAttempts = 0
      const brokerType = USE_HIVEMQ ? 'HiveMQ' : 'Local MQTT'
      console.log(`[MQTT] Connected to ${brokerType} at ${MQTT_HOST}:${MQTT_PORT}`)
      
      // Subscribe with QoS 1 to ensure message delivery, and request retained messages
      this.client?.subscribe(MQTT_TOPIC, { qos: 1 }, (err) => {
        if (err) {
          console.error('[MQTT] Subscribe error:', err)
        } else {
          console.log(`[MQTT] Subscribed to topic: ${MQTT_TOPIC} (QoS: 1)`)
          console.log(`[MQTT] Waiting for messages from ${brokerType}...`)
        }
      })
    })

    this.client.on('message', (topic, payload) => {
      try {
        const brokerType = USE_HIVEMQ ? 'HiveMQ' : 'Local MQTT'
        console.log(`[MQTT] Received message from ${brokerType} on topic: ${topic}`)
        
        const parsed = JSON.parse(payload.toString())
        const data: SensorData = {
          temp_room: Number(parsed.temp_room) || 0,
          hum_room: Number(parsed.hum_room) || 0,
          temp_out: Number(parsed.temp_out) || 0,
          lux: Number(parsed.lux) || 0,
          ldr_raw: Number(parsed.ldr_raw) || 0,
          timestamp: Number(parsed.timestamp) || Math.floor(Date.now() / 1000),
        }
        // Validate data
        if (isNaN(data.temp_room)) data.temp_room = 0
        if (isNaN(data.hum_room)) data.hum_room = 0
        if (isNaN(data.temp_out)) data.temp_out = 0
        if (isNaN(data.lux)) data.lux = 0
        if (isNaN(data.ldr_raw)) data.ldr_raw = 0
        if (isNaN(data.timestamp)) data.timestamp = Math.floor(Date.now() / 1000)
        
        this.latestData = data
        
        const timeStr = new Date(data.timestamp * 1000).toLocaleString('vi-VN')
        console.log(`[MQTT] Processed sensor data from ${brokerType}:`, {
          temp_room: data.temp_room,
          hum_room: data.hum_room,
          temp_out: data.temp_out,
          lux: data.lux,
          timestamp: timeStr
        })
        
        // Note: Database saving is handled by mqtt-bridge service, not here
        // Vercel backend only reads from MongoDB, doesn't write to it
        
        this.notify(data)
      } catch (error) {
        console.error('[MQTT] Message parse error:', error)
        console.error('[MQTT] Raw payload:', payload.toString())
      }
    })

    this.client.on('error', (err) => {
      const now = Date.now()
      // Chỉ log lỗi nếu đã qua thời gian throttle
      if (now - this.lastErrorTime > this.errorThrottleMs) {
        console.error(`[MQTT] Connection error (${err.message}):`, {
          host: MQTT_HOST,
          port: MQTT_PORT,
          code: (err as any).code,
        })
        this.lastErrorTime = now
      }
      
      // Reset connecting flag để có thể thử lại
      this.connecting = false
      this.reconnectAttempts++
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn(`[MQTT] Max reconnect attempts (${this.maxReconnectAttempts}) reached. Stopping automatic reconnection.`)
        if (this.client) {
          this.client.end()
          this.client = null
        }
      }
    })

    this.client.on('close', () => {
      console.log('[MQTT] Connection closed')
      this.client = null
      this.connecting = false
    })

    this.client.on('offline', () => {
      console.log('[MQTT] Client offline')
      this.connecting = false
    })

    this.client.on('reconnect', () => {
      this.reconnectAttempts++
      console.log(`[MQTT] Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    })
  }

  getLatestData() {
    return this.latestData
  }

  subscribe(callback: Subscriber) {
    this.subscribers.add(callback)
    if (this.latestData) callback(this.latestData)
    return () => this.subscribers.delete(callback)
  }

  isConnected(): boolean {
    return this.client?.connected ?? false
  }

  disconnect() {
    if (this.client) {
      this.client.end()
      this.client = null
      this.connecting = false
    }
  }

  private notify(data: SensorData) {
    for (const subscriber of this.subscribers) {
      try {
        subscriber(data)
      } catch (err) {
        console.error('MQTT subscriber error:', err)
      }
    }
  }
}

const globalForMqtt = global as unknown as { mqttService?: MqttService }

export const mqttService = globalForMqtt.mqttService ?? new MqttService()
if (!globalForMqtt.mqttService) {
  globalForMqtt.mqttService = mqttService
}

export function ensureMqttConnected() {
  mqttService.connect()
}


