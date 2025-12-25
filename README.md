# Vicenza Weather Station

> A modern, beautiful weather forecast application built with Next.js, featuring a glassmorphism design and dark theme with real-time sensor data integration.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [MQTT Bridge Service](#mqtt-bridge-service)
- [MQTT Integration](#mqtt-integration)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Real-time Weather Data**: Current weather display with detailed conditions
- **Wind Status**: Interactive graphs showing wind speed and direction
- **Sunrise/Sunset Widget**: Visual gauge with time indicators
- **7-Day Forecast**: Extended weather predictions
- **Sensor Data Integration**: Real-time MQTT sensor data (temperature, humidity, light)
- **Modern UI**: Glassmorphism design with dark theme
- **Animated Backgrounds**: Dynamic storm and weather effects
- **Responsive Design**: Optimized for all devices
- **Data Visualization**: Charts and statistics for sensor data
- **Historical Data**: Sensor data table with sorting and pagination

## Architecture

### Local Development

```
Local MQTT Broker (192.168.221.4) → Next.js Backend → Frontend
```

Backend directly subscribes to local MQTT broker for real-time sensor data.

### Production (Vercel)

```
Local MQTT Broker → Docker Bridge Service → HiveMQ → Vercel Backend → Frontend
```

- **Docker Bridge Service**: Runs independently, publishes data to HiveMQ every 5 minutes
- **Vercel Backend**: Subscribes to HiveMQ to retrieve sensor data
- **Frontend**: Displays real-time data via Server-Sent Events (SSE)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- MQTT broker reachable (default `192.168.221.4:1883`)
- Docker (optional, for bridge service)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd vicenza-weather-station
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy the example environment file:

```bash
cp env.local.example .env.local
```

Edit `.env.local` with your configuration (see [Configuration](#configuration) section).

4. **Run database migrations**

```bash
npx prisma generate
npx prisma migrate dev
```

5. **Start the development server**

```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration

### Environment Variables

Create `./.env.local` (or copy from `env.local.example`):

#### Local MQTT Configuration (for local development)

```env
LOCAL_MQTT_HOST=192.168.221.4
LOCAL_MQTT_PORT=1883
LOCAL_MQTT_TOPIC=vicenza/weather/data
# LOCAL_MQTT_USERNAME=
# LOCAL_MQTT_PASSWORD=
```

#### HiveMQ Configuration (for Vercel deployment)

```env
HIVEMQ_HOST=your-hivemq-broker.hivemq.cloud
HIVEMQ_PORT=8883
HIVEMQ_TOPIC=vicenza/weather/data
HIVEMQ_USERNAME=your-username
HIVEMQ_PASSWORD=your-password
HIVEMQ_CLIENT_ID=vicenza-client
```

#### Weather API (optional)

```env
WEATHER_API_KEY=your-openweathermap-api-key
```

#### Database

```env
DATABASE_URL="file:./dev.db"
```

## MQTT Bridge Service

The MQTT Bridge Service is an independent Docker service that bridges data from the local MQTT broker to HiveMQ.

### Quick Start

```bash
# Start only the bridge service
docker-compose up mqtt-bridge

# Or start all services
docker-compose up
```

### Configuration

Set environment variables in `.env` file or Docker Compose:

```env
LOCAL_MQTT_HOST=192.168.221.4
LOCAL_MQTT_PORT=1883
LOCAL_MQTT_TOPIC=vicenza/weather/data
HIVEMQ_HOST=your-hivemq-broker.hivemq.cloud
HIVEMQ_PORT=8883
HIVEMQ_TOPIC=vicenza/weather/data
HIVEMQ_USERNAME=your-username
HIVEMQ_PASSWORD=your-password
HIVEMQ_CLIENT_ID=vicenza-bridge
```

### Features

- Subscribes to data from local MQTT broker (192.168.221.4)
- Publishes data to HiveMQ every 5 minutes
- Automatic reconnection on connection loss
- Runs independently with `network_mode: host` to access local MQTT broker

### Manual Docker Build

```bash
cd mqtt-bridge
docker build -t mqtt-bridge .
docker run -d \
  --name mqtt-bridge \
  --network host \
  -e LOCAL_MQTT_HOST=192.168.221.4 \
  -e HIVEMQ_HOST=your-hivemq-broker.hivemq.cloud \
  -e HIVEMQ_USERNAME=your-username \
  -e HIVEMQ_PASSWORD=your-password \
  mqtt-bridge
```

### View Logs

```bash
docker logs -f mqtt-bridge
```

For more details, see [mqtt-bridge/README.md](mqtt-bridge/README.md).

## MQTT Integration

### Topic

```
vicenza/weather/data
```

### Message Format

```json
{
  "temp_room": 26.0,
  "hum_room": 77.0,
  "temp_out": 28.2,
  "lux": 129.6,
  "ldr_raw": 1574,
  "timestamp": 1766479802
}
```

### Backend Behavior

- **Local Development**: MQTT client subscribes from local broker
- **Vercel Production**: MQTT client subscribes from HiveMQ (when `HIVEMQ_HOST` is set)

### API Endpoints

- **`/api/sensor-data`**: Server-Sent Events (SSE) stream for real-time sensor data updates
- **`/api/sensor-history`**: Historical sensor data with filtering options
- **`/api/weather`**: Weather forecast data from OpenWeatherMap API

## Project Structure

```
vicenza-weather-station/
├── app/
│   ├── api/
│   │   ├── weather/
│   │   │   └── route.ts          # Weather API endpoint
│   │   ├── sensor-data/
│   │   │   └── route.ts          # SSE stream for MQTT data
│   │   └── sensor-history/
│   │       └── route.ts          # Historical sensor data API
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page
├── components/
│   ├── CurrentWeather.tsx        # Current weather display
│   ├── Forecast.tsx              # 7-day forecast
│   ├── Header.tsx                # Top header with user info
│   ├── Navigation.tsx            # Navigation icons
│   ├── SunriseSunset.tsx         # Sunrise/Sunset widget
│   ├── WindStatus.tsx            # Wind status widget
│   ├── SensorData.tsx            # Sensor data widget (MQTT)
│   ├── SensorCharts.tsx          # Sensor data charts
│   ├── SensorDataTable.tsx       # Sensor data table
│   └── SensorStatistics.tsx      # Sensor statistics
├── lib/
│   ├── mqttService.ts            # MQTT client singleton (supports local MQTT and HiveMQ)
│   ├── db.ts                     # Database utilities
│   └── timeTheme.ts              # Time-based theme utilities
├── mqtt-bridge/
│   ├── Dockerfile                # Dockerfile for bridge service
│   ├── index.js                  # Bridge service code
│   ├── package.json              # Dependencies for bridge service
│   └── README.md                 # Bridge service documentation
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
├── docker-compose.yml            # Docker Compose configuration
├── Dockerfile                    # Main application Dockerfile
├── env.local.example             # Environment variables example
└── package.json
```

## Technologies

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React](https://reactjs.org/)** - UI library
- **[Prisma](https://www.prisma.io/)** - Database ORM
- **[MQTT](https://mqtt.org/)** - IoT messaging protocol
- **[Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)** - Real-time data streaming
- **[Recharts](https://recharts.org/)** - Chart library for data visualization

## Deployment

### Vercel Deployment

1. **Push your code to GitHub**

2. **Import project to Vercel**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**

   Add the following environment variables in Vercel:

   ```env
   HIVEMQ_HOST=your-hivemq-broker.hivemq.cloud
   HIVEMQ_PORT=8883
   HIVEMQ_TOPIC=vicenza/weather/data
   HIVEMQ_USERNAME=your-username
   HIVEMQ_PASSWORD=your-password
   HIVEMQ_CLIENT_ID=vicenza-client
   WEATHER_API_KEY=your-openweathermap-api-key
   DATABASE_URL=your-database-url
   ```

4. **Deploy**

   Vercel will automatically build and deploy your application.

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t vicenza-weather-station .
docker run -p 3000:3000 vicenza-weather-station
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ for Vicenza Weather Station
