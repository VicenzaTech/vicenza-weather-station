'use client'

import { useEffect, useState } from 'react'
import CurrentWeather from '@/components/CurrentWeather'
import WindStatus from '@/components/WindStatus'
import SunriseSunset from '@/components/SunriseSunset'
import Forecast from '@/components/Forecast'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'

interface WeatherData {
  current: {
    temp: number
    condition: string
    description: string
    windSpeed: number
    location: string
    uvIndex: number
  }
  wind: {
    speed: number
    gusts: number[]
    history: number[]
  }
  sun: {
    sunrise: string
    sunset: string
    currentTime: string
  }
  forecast: Array<{
    day: string
    temp: number
    icon: string
  }>
}

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeatherData()
  }, [])

  const fetchWeatherData = async () => {
    try {
      const response = await fetch('/api/weather')
      const data = await response.json()
      setWeatherData(data)
    } catch (error) {
      console.error('Error fetching weather data:', error)
      // Fallback data for demo
      setWeatherData({
        current: {
          temp: 22,
          condition: 'Thunderstorms',
          description: 'Heavy rain, strong winds, and occasional lightning expected. Sudden downpours may lead to localized flooding in some areas.',
          windSpeed: 7.90,
          location: 'New York',
          uvIndex: 5
        },
        wind: {
          speed: 7.90,
          gusts: [8, 9, 7, 10, 8, 9, 11],
          history: [6, 7, 8, 7, 9, 8, 7, 8, 9, 7, 8]
        },
        sun: {
          sunrise: '06:30',
          sunset: '19:45',
          currentTime: '11:52'
        },
        forecast: [
          { day: 'Monday', temp: 26, icon: 'cloud' },
          { day: 'Tuesday', temp: 28, icon: 'cloud' },
          { day: 'Wednesday', temp: 24, icon: 'storm' },
          { day: 'Thursday', temp: 26, icon: 'cloud' },
          { day: 'Friday', temp: 23, icon: 'cloud' },
          { day: 'Saturday', temp: 26, icon: 'cloud' },
          { day: 'Sunday', temp: 27, icon: 'sun-cloud' }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !weatherData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background with storm effect */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-slate-800 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-slate-700 rounded-full blur-3xl opacity-40"></div>
        </div>
        {/* Rain effect */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-20 bg-white animate-rain"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <Header />

          {/* Navigation */}
          <Navigation />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Left Column - Current Weather */}
            <div className="lg:col-span-2">
              <CurrentWeather data={weatherData.current} />
            </div>

            {/* Right Column - Widgets */}
            <div className="space-y-6">
              <WindStatus data={weatherData.wind} />
              <SunriseSunset data={weatherData.sun} />
            </div>
          </div>

          {/* Forecast */}
          <div className="mt-12">
            <Forecast data={weatherData.forecast} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes rain {
          0% {
            transform: translateY(-100vh);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        .animate-rain {
          animation: rain linear infinite;
        }
      `}</style>
    </main>
  )
}

