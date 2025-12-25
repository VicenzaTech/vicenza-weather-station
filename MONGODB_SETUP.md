# MongoDB Setup Guide

## Architecture Overview

```
IoT Device → Local MQTT Broker → mqtt-bridge → MongoDB + HiveMQ → Vercel
                                                      ↓
                                                  Vercel reads from MongoDB
```

### Data Flow:
1. **IoT Device** publishes sensor data to **Local MQTT Broker** (192.168.221.4:1883)
2. **mqtt-bridge** service:
   - Subscribes to Local MQTT Broker
   - Saves every reading to **MongoDB**
   - Publishes to **HiveMQ** every 5 minutes (with `retain: true`)
3. **Vercel Backend**:
   - Subscribes to **HiveMQ** for real-time updates
   - Reads historical data from **MongoDB**
4. **Frontend** receives data via Server-Sent Events (SSE)

## MongoDB Options

### Option 1: Local MongoDB (Development)

1. **Install MongoDB locally:**
   - Windows: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Mac: `brew install mongodb-community`
   - Linux: Follow [official guide](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. **Start MongoDB:**
   ```bash
   # Windows (as service)
   net start MongoDB
   
   # Mac/Linux
   brew services start mongodb-community
   # or
   mongod --dbpath /path/to/data
   ```

3. **Configure environment:**
   ```bash
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB=vicenza_weather
   ```

### Option 2: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create free MongoDB Atlas account:**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up and create a free cluster (M0 tier)

2. **Configure cluster:**
   - Create a database user (username/password)
   - Whitelist IP addresses:
     - Add `0.0.0.0/0` for development (allow all)
     - Or add specific IPs for production
   - Get connection string

3. **Configure environment:**
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
   MONGODB_DB=vicenza_weather
   ```

### Option 3: Docker MongoDB (Recommended for Development)

Already configured in `docker-compose.yml`:

```yaml
mongodb:
  image: mongo:7
  ports:
    - "27017:27017"
  volumes:
    - mongodb-data:/data/db
```

Just run:
```bash
docker-compose up -d mongodb
```

## Environment Variables

### For Next.js App (Vercel)

Add to Vercel environment variables:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
MONGODB_DB=vicenza_weather

HIVEMQ_HOST=your-broker.hivemq.cloud
HIVEMQ_PORT=8883
HIVEMQ_USERNAME=your-username
HIVEMQ_PASSWORD=your-password
HIVEMQ_TOPIC=vicenza/weather/data
HIVEMQ_CLIENT_ID=vicenza-client
```

### For mqtt-bridge Service

Create `.env` file in `mqtt-bridge/` directory:

```bash
# Local MQTT Broker
LOCAL_MQTT_HOST=192.168.221.4
LOCAL_MQTT_PORT=1883
LOCAL_MQTT_TOPIC=vicenza/weather/data

# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=vicenza_weather

# HiveMQ
HIVEMQ_HOST=your-broker.hivemq.cloud
HIVEMQ_PORT=8883
HIVEMQ_USERNAME=your-username
HIVEMQ_PASSWORD=your-password
HIVEMQ_TOPIC=vicenza/weather/data
HIVEMQ_CLIENT_ID=vicenza-bridge
```

## Installation

### 1. Install Dependencies

**Next.js App:**
```bash
npm install
```

**mqtt-bridge:**
```bash
cd mqtt-bridge
npm install
```

### 2. Start Services

**Option A: Docker (Recommended)**
```bash
docker-compose up -d
```

This will start:
- MongoDB
- mqtt-bridge service
- Next.js web app (optional)

**Option B: Manual**

Start MongoDB:
```bash
# If using local MongoDB
mongod

# If using Docker MongoDB only
docker-compose up -d mongodb
```

Start mqtt-bridge:
```bash
cd mqtt-bridge
npm start
```

Start Next.js:
```bash
npm run dev
```

## Verify Setup

### 1. Check MongoDB Connection

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017

# Switch to database
use vicenza_weather

# Check collections
show collections

# View recent sensor readings
db.sensor_readings.find().sort({created_at: -1}).limit(5)
```

### 2. Check mqtt-bridge Logs

You should see:
```
[MongoDB] Connected successfully to database: vicenza_weather
[MongoDB] Indexes created successfully
[Local MQTT] Đã kết nối đến 192.168.221.4:1883
[HiveMQ] Đã kết nối đến your-broker.hivemq.cloud:8883
[Local MQTT] Nhận dữ liệu mới: {...}
[MongoDB] Saved sensor reading (...)
[HiveMQ] Đã publish dữ liệu lên topic vicenza/weather/data
```

### 3. Check Vercel Logs

After deploying to Vercel, check logs for:
```
[MongoDB] Connected successfully
[MQTT] Connected to HiveMQ at your-broker.hivemq.cloud:8883
[MQTT] Subscribed to topic: vicenza/weather/data (QoS: 1)
[MQTT] Received message from HiveMQ on topic: vicenza/weather/data
```

## Database Schema

Collection: `sensor_readings`

```javascript
{
  _id: ObjectId,
  temp_room: Number,    // Room temperature (°C)
  hum_room: Number,     // Room humidity (%)
  temp_out: Number,     // Outdoor temperature (°C)
  lux: Number,          // Light intensity (lux)
  ldr_raw: Number,      // Raw LDR sensor value
  timestamp: Date,      // Sensor reading timestamp
  created_at: Date      // Database insert timestamp
}
```

Indexes:
- `timestamp: -1` (descending)
- `created_at: -1` (descending)

## Troubleshooting

### mqtt-bridge not saving to MongoDB

1. Check MongoDB is running:
   ```bash
   docker ps | grep mongo
   # or
   mongosh mongodb://localhost:27017
   ```

2. Check MONGODB_URI in mqtt-bridge environment

3. Check mqtt-bridge logs for connection errors

### Vercel not reading from MongoDB

1. Verify MONGODB_URI in Vercel environment variables
2. Check MongoDB Atlas IP whitelist (add `0.0.0.0/0`)
3. Check Vercel function logs for connection errors

### No data in MongoDB

1. Check mqtt-bridge is receiving data from local MQTT:
   ```
   [Local MQTT] Nhận dữ liệu mới: {...}
   ```

2. Check for MongoDB save errors in logs

3. Verify IoT device is publishing to local MQTT broker

## Migration from SQLite

If you have existing SQLite data, you can migrate it:

```javascript
// migration-script.js (example)
const { PrismaClient } = require('@prisma/client')
const { MongoClient } = require('mongodb')

async function migrate() {
  const prisma = new PrismaClient()
  const mongo = new MongoClient('mongodb://localhost:27017')
  
  await mongo.connect()
  const db = mongo.db('vicenza_weather')
  const collection = db.collection('sensor_readings')
  
  const readings = await prisma.sensorReading.findMany()
  
  const mongoReadings = readings.map(r => ({
    temp_room: r.tempRoom,
    hum_room: r.humRoom,
    temp_out: r.tempOut,
    lux: r.lux,
    ldr_raw: r.ldrRaw,
    timestamp: r.timestamp,
    created_at: r.createdAt,
  }))
  
  await collection.insertMany(mongoReadings)
  console.log(`Migrated ${mongoReadings.length} readings`)
  
  await mongo.close()
  await prisma.$disconnect()
}

migrate()
```

## Performance Tips

1. **Indexes**: Already created automatically by mqtt-bridge
2. **Data Retention**: Consider adding TTL index for old data:
   ```javascript
   db.sensor_readings.createIndex(
     { "created_at": 1 },
     { expireAfterSeconds: 2592000 } // 30 days
   )
   ```
3. **Connection Pooling**: MongoDB driver handles this automatically
4. **Atlas Tier**: M0 (free) supports up to 500 connections

## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)

