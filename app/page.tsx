'use client'

import { useEffect, useMemo, useState } from 'react'
import CurrentWeather from '@/components/CurrentWeather'
import WindStatus from '@/components/WindStatus'
import SunriseSunset from '@/components/SunriseSunset'
import Forecast from '@/components/Forecast'
import Header from '@/components/Header'
import SensorData from '@/components/SensorData'
import WeatherBackground from '@/components/WeatherBackground'
import type { SensorData as SensorPayload } from '@/lib/mqttService'

import SensorCharts from '@/components/SensorCharts'

interface WeatherData {
  current: {
    temp: number
    feels_like?: number
    temp_min?: number
    temp_max?: number
    pressure?: number
    condition: string
    weatherMain?: string // For background logic
    description: string
    windSpeed: number
    windDirection?: number
    clouds?: number
    visibility?: number
    location: string
    uvIndex: number
    humidity?: number
  }
  wind: {
    speed: number
    direction?: number
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

const baseWeather: WeatherData = {
  current: {
    temp: 22,
    feels_like: 24,
    temp_min: 20,
    temp_max: 25,
    pressure: 1012,
    condition: 'Dông bão',
    weatherMain: 'Thunderstorm',
    description:
      'Mưa lớn, gió mạnh và sét thỉnh thoảng. Mưa đột ngột có thể dẫn đến ngập lụt cục bộ ở một số khu vực.',
    windSpeed: 7.9,
    windDirection: 140,
    clouds: 85,
    visibility: 8000,
    location: 'Trạm VICENZA',
    uvIndex: 5,
  },
  wind: {
    speed: 7.9,
    direction: 140,
    gusts: [8, 9, 7, 10, 8, 9, 11],
    history: [6, 7, 8, 7, 9, 8, 7, 8, 9, 7, 8],
  },
  sun: {
    sunrise: '06:30',
    sunset: '19:45',
    currentTime: new Date().toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    }),
  },
  forecast: [
    { day: 'Thứ hai', temp: 26, icon: 'cloud' },
    { day: 'Thứ ba', temp: 28, icon: 'cloud' },
    { day: 'Thứ tư', temp: 24, icon: 'storm' },
    { day: 'Thứ năm', temp: 26, icon: 'cloud' },
    { day: 'Thứ sáu', temp: 23, icon: 'cloud' },
    { day: 'Thứ bảy', temp: 26, icon: 'cloud' },
    { day: 'Chủ nhật', temp: 27, icon: 'sun-cloud' },
  ],
}

export default function Home() {
  const [sensorData, setSensorData] = useState<SensorPayload | null>(null)
  const [weatherData, setWeatherData] = useState<WeatherData>(baseWeather)

  // Fetch weather data from API
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('/api/weather')
        if (response.ok) {
          const data = await response.json()
          setWeatherData(data)
        }
      } catch (error) {
        console.error('Error fetching weather:', error)
      }
    }

    fetchWeather()
    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 600000)
    return () => clearInterval(interval)
  }, [])

  // Fetch sensor data from MQTT
  useEffect(() => {
    const eventSource = new EventSource('/api/sensor-data')

    eventSource.onmessage = (event) => {
      try {
        const data: SensorPayload = JSON.parse(event.data)
        setSensorData(data)
      } catch (error) {
        console.error('SSE parse error:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
    }

    return () => {
      eventSource.close()
    }
  }, [])

  // Merge sensor data with weather data
  const mergedWeatherData = useMemo<WeatherData>(() => {
    if (!sensorData) return weatherData
    return {
      ...weatherData,
      current: {
        ...weatherData.current,
        temp: sensorData.temp_out,
        humidity: sensorData.hum_room,
        location: 'Trạm VICENZA',
      },
    }
  }, [sensorData, weatherData])

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <WeatherBackground condition={mergedWeatherData.current.weatherMain || 'Clear'} />

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <Header />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 mt-8">
            {/* Left Column - Sensor Data Display */}
            <div className="lg:col-span-2 min-h-[400px]">
              <CurrentWeather data={sensorData} weather={mergedWeatherData.current} />
            </div>

            {/* Right Column - Widgets */}
            <div className="space-y-5 md:space-y-6 flex flex-col">
              <div className="flex-1 min-h-[190px]">
                <WindStatus data={mergedWeatherData.wind} />
              </div>
              <div className="flex-1 min-h-[190px]">
                <SunriseSunset data={mergedWeatherData.sun} />
              </div>
            </div>
          </div>

          {/* Forecast */}
          <div className="mt-12">
            <Forecast data={mergedWeatherData.forecast} />
          </div>

          {/* Sensor Data */}
          <div className="mt-8">
            <SensorData data={sensorData} />
          </div>

          {/* Real-time Charts */}
          <div className="mt-8">
            <SensorCharts data={sensorData} />
          </div>


        </div>
      </div>
    </main>
  )
}

