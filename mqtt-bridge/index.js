/**
 * MQTT Bridge Service
 * 
 * Service này chạy trong Docker, subscribe dữ liệu từ MQTT broker local,
 * lưu vào MongoDB, và đẩy lên HiveMQ mỗi 5 phút.
 */

const mqtt = require('mqtt')
const mongoService = require('./mongodb')
require('dotenv').config()

// Local MQTT Configuration
const LOCAL_MQTT_HOST = process.env.LOCAL_MQTT_HOST || '192.168.221.4'
const LOCAL_MQTT_PORT = Number(process.env.LOCAL_MQTT_PORT || 1883)
const LOCAL_MQTT_TOPIC = process.env.LOCAL_MQTT_TOPIC || 'vicenza/weather/data'
const LOCAL_MQTT_USERNAME = process.env.LOCAL_MQTT_USERNAME
const LOCAL_MQTT_PASSWORD = process.env.LOCAL_MQTT_PASSWORD

// HiveMQ Configuration
const HIVEMQ_HOST = process.env.HIVEMQ_HOST
const HIVEMQ_PORT = Number(process.env.HIVEMQ_PORT || 8883)
const HIVEMQ_TOPIC = process.env.HIVEMQ_TOPIC || 'vicenza/weather/data'
const HIVEMQ_USERNAME = process.env.HIVEMQ_USERNAME
const HIVEMQ_PASSWORD = process.env.HIVEMQ_PASSWORD
const HIVEMQ_CLIENT_ID = process.env.HIVEMQ_CLIENT_ID || `vicenza-bridge-${Date.now()}`

// Publishing interval (5 minutes = 300000 ms)
const PUBLISH_INTERVAL_MS = 5 * 60 * 1000

class MqttBridge {
  constructor() {
    this.localClient = null
    this.hivemqClient = null
    this.latestData = null
    this.publishInterval = null
    this.isRunning = false
  }

  async start() {
    if (this.isRunning) {
      console.log('[Bridge] Service đã đang chạy')
      return
    }

    // Validate HiveMQ configuration
    if (!HIVEMQ_HOST) {
      console.error('[Bridge] ERROR: HIVEMQ_HOST không được cấu hình trong environment variables')
      console.error('[Bridge] Vui lòng thêm HIVEMQ_HOST vào file .env hoặc environment variables')
      process.exit(1)
    }

    console.log('[Bridge] Khởi động MQTT Bridge Service...')
    console.log(`[Bridge] Local MQTT: ${LOCAL_MQTT_HOST}:${LOCAL_MQTT_PORT}`)
    console.log(`[Bridge] HiveMQ: ${HIVEMQ_HOST}:${HIVEMQ_PORT}`)
    console.log(`[Bridge] Publish interval: ${PUBLISH_INTERVAL_MS / 1000} giây`)

    this.isRunning = true

    // Connect to MongoDB
    await mongoService.connect()

    // Connect to local MQTT broker
    await this.connectToLocalMQTT()

    // Connect to HiveMQ
    await this.connectToHiveMQ()

    // Start periodic publishing
    this.startPeriodicPublish()

    // Handle graceful shutdown
    process.on('SIGINT', () => this.shutdown())
    process.on('SIGTERM', () => this.shutdown())
  }

  connectToLocalMQTT() {
    return new Promise((resolve, reject) => {
      const url = `mqtt://${LOCAL_MQTT_HOST}:${LOCAL_MQTT_PORT}`
      console.log(`[Local MQTT] Đang kết nối đến ${url}...`)

      this.localClient = mqtt.connect(url, {
        username: LOCAL_MQTT_USERNAME,
        password: LOCAL_MQTT_PASSWORD,
        reconnectPeriod: 5000,
        connectTimeout: 10000,
        keepalive: 30,
        clientId: `local-subscriber-${Date.now()}`,
      })

      this.localClient.on('connect', () => {
        console.log(`[Local MQTT] Đã kết nối đến ${LOCAL_MQTT_HOST}:${LOCAL_MQTT_PORT}`)
        
        this.localClient.subscribe(LOCAL_MQTT_TOPIC, (err) => {
          if (err) {
            console.error('[Local MQTT] Lỗi subscribe:', err)
            reject(err)
          } else {
            console.log(`[Local MQTT] Đã subscribe topic: ${LOCAL_MQTT_TOPIC}`)
            resolve()
          }
        })
      })

      this.localClient.on('message', (topic, payload) => {
        try {
          const parsed = JSON.parse(payload.toString())
          const data = {
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
          console.log(`[Local MQTT] Nhận dữ liệu mới: ${JSON.stringify(data)} (${timeStr})`)
          
          // Save to MongoDB
          mongoService.saveSensorReading(data).catch(err => {
            console.error('[Local MQTT] Lỗi lưu vào MongoDB:', err.message)
          })
        } catch (error) {
          console.error('[Local MQTT] Lỗi parse message:', error)
        }
      })

      this.localClient.on('error', (err) => {
        console.error('[Local MQTT] Lỗi kết nối:', err.message)
        reject(err)
      })

      this.localClient.on('close', () => {
        console.log('[Local MQTT] Kết nối đã đóng')
      })

      this.localClient.on('reconnect', () => {
        console.log('[Local MQTT] Đang kết nối lại...')
      })
    })
  }

  connectToHiveMQ() {
    return new Promise((resolve, reject) => {
      // Determine protocol (mqtts for port 8883, ws for port 8080)
      const protocol = HIVEMQ_PORT === 8883 ? 'mqtts' : HIVEMQ_PORT === 8080 ? 'ws' : 'mqtt'
      const url = `${protocol}://${HIVEMQ_HOST}:${HIVEMQ_PORT}`
      
      console.log(`[HiveMQ] Đang kết nối đến ${url}...`)
      console.log(`[HiveMQ] Client ID: ${HIVEMQ_CLIENT_ID}`)

      const options = {
        username: HIVEMQ_USERNAME,
        password: HIVEMQ_PASSWORD,
        reconnectPeriod: 10000, // Tăng lên 10s để tránh reconnect quá nhanh
        connectTimeout: 30000, // Tăng timeout lên 30s
        keepalive: 60, // Tăng keepalive lên 60s cho HiveMQ Cloud
        clientId: HIVEMQ_CLIENT_ID,
        clean: true, // Clean session
        protocolVersion: 4, // MQTT 3.1.1
      }

      // Add TLS options for secure connection (mqtts)
      if (protocol === 'mqtts') {
        options.rejectUnauthorized = true // Use proper TLS validation for HiveMQ Cloud
      }

      this.hivemqClient = mqtt.connect(url, options)

      this.hivemqClient.on('connect', (connack) => {
        console.log(`[HiveMQ] ✅ Đã kết nối đến ${HIVEMQ_HOST}:${HIVEMQ_PORT}`)
        console.log(`[HiveMQ] Session present: ${connack.sessionPresent}`)
        resolve()
      })

      this.hivemqClient.on('error', (err) => {
        console.error('[HiveMQ] ❌ Lỗi kết nối:', err.message)
        console.error('[HiveMQ] Error details:', err)
        // Don't reject immediately, let reconnect logic handle it
      })

      this.hivemqClient.on('close', () => {
        console.log('[HiveMQ] ⚠️ Kết nối đã đóng')
      })

      this.hivemqClient.on('offline', () => {
        console.log('[HiveMQ] ⚠️ Client offline')
      })

      this.hivemqClient.on('reconnect', () => {
        console.log('[HiveMQ] 🔄 Đang kết nối lại...')
      })

      // Timeout for initial connection
      setTimeout(() => {
        if (!this.hivemqClient || !this.hivemqClient.connected) {
          console.warn('[HiveMQ] ⏱️ Connection timeout, nhưng sẽ tiếp tục retry...')
          resolve() // Resolve anyway to not block the service
        }
      }, 30000)
    })
  }

  startPeriodicPublish() {
    console.log(`[Bridge] Bắt đầu publish dữ liệu lên HiveMQ mỗi ${PUBLISH_INTERVAL_MS / 1000} giây...`)
    
    // Publish immediately if we have data
    if (this.latestData) {
      this.publishToHiveMQ()
    }

    // Then publish every 5 minutes
    this.publishInterval = setInterval(() => {
      this.publishToHiveMQ()
    }, PUBLISH_INTERVAL_MS)
  }

  publishToHiveMQ() {
    if (!this.hivemqClient || !this.hivemqClient.connected) {
      console.warn('[HiveMQ] Chưa kết nối đến HiveMQ, bỏ qua publish')
      return
    }

    if (!this.latestData) {
      console.warn('[Bridge] Chưa có dữ liệu để publish')
      return
    }

    const payload = JSON.stringify(this.latestData)
    
    // Publish with QoS 1 and retain flag so Vercel backend can receive it even if subscribing after publish
    this.hivemqClient.publish(HIVEMQ_TOPIC, payload, { qos: 1, retain: true }, (err) => {
      if (err) {
        console.error('[HiveMQ] Lỗi publish:', err)
      } else {
        const timeStr = new Date().toLocaleString('vi-VN')
        console.log(`[HiveMQ] Đã publish dữ liệu lên topic ${HIVEMQ_TOPIC} (${timeStr})`)
        console.log(`[HiveMQ] Dữ liệu: ${payload}`)
      }
    })
  }

  async shutdown() {
    console.log('\n[Bridge] Đang dừng service...')
    
    this.isRunning = false

    if (this.publishInterval) {
      clearInterval(this.publishInterval)
      this.publishInterval = null
    }

    if (this.localClient) {
      this.localClient.end()
      console.log('[Local MQTT] Đã ngắt kết nối')
    }

    if (this.hivemqClient) {
      this.hivemqClient.end()
      console.log('[HiveMQ] Đã ngắt kết nối')
    }

    // Disconnect from MongoDB
    await mongoService.disconnect()

    console.log('[Bridge] Service đã dừng')
    process.exit(0)
  }
}

// Start the bridge service
const bridge = new MqttBridge()
bridge.start().catch((error) => {
  console.error('[Bridge] Lỗi khởi động service:', error)
  process.exit(1)
})

