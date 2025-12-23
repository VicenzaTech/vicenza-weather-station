# Vicenza Weather Station

A modern, beautiful weather forecast application built with Next.js, featuring a glassmorphism design and dark theme.

## Features

- 🌤️ Current weather display with detailed conditions
- 💨 Wind status with interactive graphs
- 🌅 Sunrise/Sunset widget with visual gauge
- 📅 7-day weather forecast
- 🎨 Modern glassmorphism UI design
- 🌧️ Animated storm background effects
- 📱 Responsive design for all devices

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

To use real weather data, create a `.env.local` file and add your weather API key:

```
WEATHER_API_KEY=your_api_key_here
```

You can get a free API key from [OpenWeatherMap](https://openweathermap.org/api).

## Project Structure

```
vicenza-weather-station/
├── app/
│   ├── api/
│   │   └── weather/
│   │       └── route.ts      # Weather API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page
├── components/
│   ├── CurrentWeather.tsx    # Current weather display
│   ├── Forecast.tsx          # 7-day forecast
│   ├── Header.tsx            # Top header with user info
│   ├── Navigation.tsx        # Navigation icons
│   ├── SunriseSunset.tsx     # Sunrise/Sunset widget
│   └── WindStatus.tsx        # Wind status widget
└── package.json
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React** - UI library

## Customization

You can customize the weather data by modifying the API route in `app/api/weather/route.ts`. Currently, it returns mock data, but you can integrate with any weather API service.

## License

MIT

