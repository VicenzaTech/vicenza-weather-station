# Migration Summary: SQLite → MongoDB

## Overview

Successfully migrated from SQLite (Prisma) to MongoDB for sensor data storage.

## Changes Made

### 1. **Package Dependencies**

**Removed:**
- `@prisma/client` (^6.19.1)
- `prisma` (^6.19.1)

**Added:**
- `mongodb` (^6.3.0) - to both main app and mqtt-bridge

### 2. **New Files Created**

- **`lib/mongodb.ts`**: MongoDB connection and database operations
  - `connectToDatabase()`: Singleton connection
  - `saveSensorReading()`: Save sensor data
  - `getLatestSensorReading()`: Get most recent reading
  - `getSensorReadings()`: Get readings in time range

- **`mqtt-bridge/mongodb.js`**: MongoDB helper for bridge service
  - Connects to MongoDB
  - Saves sensor readings
  - Creates indexes automatically

- **`MONGODB_SETUP.md`**: Complete MongoDB setup guide
  - Local MongoDB setup
  - MongoDB Atlas (cloud) setup
  - Docker MongoDB setup
  - Troubleshooting guide

- **`MIGRATION_SUMMARY.md`**: This file

### 3. **Modified Files**

**`lib/db.ts`**
- Rewritten to use MongoDB instead of Prisma
- Maintains same API interface for compatibility
- Transforms MongoDB documents to expected format

**`lib/mqttService.ts`**
- Removed database saving logic (now handled by mqtt-bridge)
- Added detailed logging for HiveMQ connection
- Vercel backend now only reads from MongoDB, doesn't write

**`mqtt-bridge/index.js`**
- Added MongoDB integration
- Saves every sensor reading to MongoDB
- Publishes to HiveMQ with `retain: true` flag
- Graceful shutdown includes MongoDB disconnect

**`package.json`** (both main and mqtt-bridge)
- Updated dependencies

**`docker-compose.yml`**
- Added MongoDB service (mongo:7)
- Added MongoDB volume (`mongodb-data`)
- Removed SQLite volume
- Added MongoDB environment variables to all services

**`env.local.example`**
- Replaced `DATABASE_URL` with `MONGODB_URI` and `MONGODB_DB`
- Added MongoDB configuration examples

**`README.md`**
- Updated architecture diagrams
- Updated prerequisites (added MongoDB)
- Updated environment variables section
- Updated project structure
- Updated technologies list

### 4. **Deleted Files**

- `prisma/schema.prisma`
- `prisma/dev.db`
- `prisma/migrations/migration_lock.toml`
- `prisma/migrations/20251224110241_init/migration.sql`

## New Architecture

### Data Flow

```
IoT Device → Local MQTT → mqtt-bridge → MongoDB + HiveMQ
                                             ↓
                            Vercel (reads MongoDB + subscribes HiveMQ)
                                             ↓
                                         Frontend
```

### Responsibilities

**mqtt-bridge Service:**
1. Subscribes to Local MQTT Broker
2. **Saves all readings to MongoDB** (new!)
3. Publishes to HiveMQ every 5 minutes (with retain)

**Vercel Backend:**
1. Subscribes to HiveMQ for real-time updates
2. **Reads historical data from MongoDB** (new!)
3. Does NOT write to database (changed!)

**Frontend:**
- Receives real-time data via SSE
- Displays current and historical data

## Database Schema

### MongoDB Collection: `sensor_readings`

```javascript
{
  _id: ObjectId,
  temp_room: Number,
  hum_room: Number,
  temp_out: Number,
  lux: Number,
  ldr_raw: Number,
  timestamp: Date,
  created_at: Date
}
```

**Indexes:**
- `timestamp: -1`
- `created_at: -1`

### Comparison with Previous Schema

| Field | SQLite (Prisma) | MongoDB |
|-------|----------------|---------|
| ID | `id` (Int, autoincrement) | `_id` (ObjectId) |
| Room Temp | `tempRoom` (Float) | `temp_room` (Number) |
| Room Humidity | `humRoom` (Float) | `hum_room` (Number) |
| Outdoor Temp | `tempOut` (Float) | `temp_out` (Number) |
| Light | `lux` (Float) | `lux` (Number) |
| LDR Raw | `ldrRaw` (Int) | `ldr_raw` (Number) |
| Timestamp | `timestamp` (DateTime) | `timestamp` (Date) |
| Created | `createdAt` (DateTime) | `created_at` (Date) |

## Environment Variables

### Before (SQLite)

```env
DATABASE_URL="file:./dev.db"
```

### After (MongoDB)

```env
MONGODB_URI=mongodb://localhost:27017
# or
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
MONGODB_DB=vicenza_weather
```

## Deployment Changes

### Local Development

**Before:**
```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

**After:**
```bash
# Start MongoDB (choose one):
docker-compose up -d mongodb
# or
mongod
# or use MongoDB Atlas

npm run dev
```

### Vercel Deployment

**Before:**
- Used file-based SQLite (didn't work on Vercel)
- Database writes were skipped

**After:**
- Uses MongoDB Atlas (cloud database)
- Full database functionality on Vercel
- Environment variables:
  ```
  MONGODB_URI=mongodb+srv://...
  MONGODB_DB=vicenza_weather
  HIVEMQ_HOST=...
  HIVEMQ_USERNAME=...
  HIVEMQ_PASSWORD=...
  ```

### mqtt-bridge Deployment

**Before:**
- Only handled MQTT bridging

**After:**
- Handles MQTT bridging + MongoDB writes
- Requires MongoDB connection
- Environment variables:
  ```
  MONGODB_URI=mongodb://...
  MONGODB_DB=vicenza_weather
  LOCAL_MQTT_HOST=...
  HIVEMQ_HOST=...
  ```

## Benefits of MongoDB

1. **Cloud-Ready**: MongoDB Atlas works perfectly with Vercel
2. **No File System**: No need for persistent file storage
3. **Scalability**: Better for growing data
4. **Flexibility**: Schema-less, easier to modify
5. **Performance**: Indexed queries are fast
6. **Replication**: Built-in redundancy with Atlas

## Migration Steps (for existing deployments)

### 1. Setup MongoDB

Choose one:
- Local: Install MongoDB locally
- Docker: `docker-compose up -d mongodb`
- Cloud: Create MongoDB Atlas cluster (recommended)

### 2. Update Code

```bash
git pull  # Get latest changes
npm install  # Install MongoDB driver
cd mqtt-bridge && npm install  # Install MongoDB in bridge
```

### 3. Update Environment Variables

**Local `.env.local`:**
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=vicenza_weather
```

**Vercel:**
Add in Vercel dashboard:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
MONGODB_DB=vicenza_weather
```

**mqtt-bridge `.env`:**
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=vicenza_weather
```

### 4. Restart Services

```bash
# If using Docker
docker-compose down
docker-compose up -d

# If manual
# Restart mqtt-bridge
cd mqtt-bridge && npm start

# Restart Next.js
npm run dev
```

### 5. Verify

Check logs for:
```
[MongoDB] Connected successfully
[MongoDB] Indexes created successfully
[MongoDB] Saved sensor reading...
```

### 6. (Optional) Migrate Old Data

If you have existing SQLite data, create a migration script:

```javascript
// migrate.js
const { PrismaClient } = require('@prisma/client')
const { MongoClient } = require('mongodb')

async function migrate() {
  const prisma = new PrismaClient({
    datasources: { db: { url: 'file:./prisma/dev.db' } }
  })
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
  
  if (mongoReadings.length > 0) {
    await collection.insertMany(mongoReadings)
    console.log(`✓ Migrated ${mongoReadings.length} readings`)
  }
  
  await mongo.close()
  await prisma.$disconnect()
}

migrate().catch(console.error)
```

Run: `node migrate.js`

## Troubleshooting

### mqtt-bridge not saving to MongoDB

1. Check MongoDB is running
2. Check `MONGODB_URI` in mqtt-bridge environment
3. Check logs for connection errors

### Vercel not reading from MongoDB

1. Check `MONGODB_URI` in Vercel environment variables
2. Verify MongoDB Atlas IP whitelist (add `0.0.0.0/0`)
3. Check Vercel function logs

### No data showing on frontend

1. Check mqtt-bridge is receiving data from local MQTT
2. Check mqtt-bridge is saving to MongoDB
3. Check Vercel is connected to HiveMQ
4. Check browser console for errors

## Testing

### Test MongoDB Connection

```bash
mongosh mongodb://localhost:27017
use vicenza_weather
db.sensor_readings.find().sort({created_at: -1}).limit(5)
```

### Test mqtt-bridge

Check logs for:
```
[MongoDB] Connected successfully
[Local MQTT] Nhận dữ liệu mới: {...}
[MongoDB] Saved sensor reading (...)
[HiveMQ] Đã publish dữ liệu lên topic vicenza/weather/data
```

### Test Vercel

Check Vercel logs for:
```
[MongoDB] Connected successfully
[MQTT] Connected to HiveMQ
[MQTT] Received message from HiveMQ
```

## Rollback (if needed)

If you need to rollback to SQLite:

1. Checkout previous commit: `git checkout <commit-before-migration>`
2. Reinstall dependencies: `npm install`
3. Run Prisma migrations: `npx prisma migrate dev`
4. Restart services

## Support

For issues or questions:
- See [MONGODB_SETUP.md](MONGODB_SETUP.md) for detailed setup
- See [README.md](README.md) for general documentation
- Check MongoDB logs: `docker logs mongodb` or check Atlas logs
- Check mqtt-bridge logs: `docker logs mqtt-bridge`

