'use client'

import { useMemo, useEffect } from 'react'
import CurrentWeather from '@/components/CurrentWeather'
import WindStatus from '@/components/WindStatus'
import SunriseSunset from '@/components/SunriseSunset'
import Forecast from '@/components/Forecast'
import Header from '@/components/Header'
import SensorData from '@/components/SensorData'
import WeatherBackground from '@/components/WeatherBackground'
import { useApp } from '@/contexts/AppContext'

import SensorCharts from '@/components/SensorCharts'
import AdvancedSensorDashboard from '@/components/AdvancedSensorDashboard'
import SensorDataTable from '@/components/SensorDataTable'
import SensorStatistics from '@/components/SensorStatistics'

interface HistoryDataItem {
  id: string | number
  temp_room: number
  hum_room: number
  temp_out: number
  lux: number
  ldr_raw: number
  timestamp: number
  created_at: string
}

interface WeatherData {
  current: {
    temp: number
    feels_like?: number
    temp_min?: number
    temp_max?: number
    pressure?: number
    condition: string
    weatherMain?: string
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

const emptyWeather: WeatherData = {
  current: {
    temp: 0,
    condition: 'N/A',
    description: 'Đang tải dữ liệu...',
    windSpeed: 0,
    location: 'Trạm VICENZA',
    uvIndex: 0,
  },
  wind: {
    speed: 0,
    direction: 0,
    gusts: [],
    history: [],
  },
  sun: {
    sunrise: '--:--',
    sunset: '--:--',
    currentTime: new Date().toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    }),
  },
  forecast: [],
}

interface HomeClientProps {
  initialHistoryData: HistoryDataItem[]
}

export default function HomeClient({ initialHistoryData }: HomeClientProps) {
  // Use shared context instead of local state
  const { sensorData, weatherData, historyData, isLoadingHistory } = useApp()

  // Save initialHistoryData to cache and use it immediately
  useEffect(() => {
    if (initialHistoryData && initialHistoryData.length > 0) {
      // Save to localStorage cache
      if (typeof window !== 'undefined') {
        try {
          const cache = {
            data: initialHistoryData,
            timestamp: Date.now(),
          }
          localStorage.setItem('vicenza_history_cache', JSON.stringify(cache))
          console.log('[HomeClient] Saved', initialHistoryData.length, 'initial history items to cache')
        } catch (error) {
          console.error('[HomeClient] Error saving to cache:', error)
        }
      }
    }
  }, [initialHistoryData])

  // Merge sensor data with weather data
  const mergedWeatherData = useMemo<WeatherData>(() => {
    const base = weatherData || emptyWeather
    if (!sensorData) return base
    return {
      ...base,
      current: {
        ...base.current,
        temp: sensorData.temp_out,
        humidity: sensorData.hum_room,
        location: 'Trạm VICENZA',
      },
    }
  }, [sensorData, weatherData])

  // Use initialHistoryData if available and context historyData is empty or older
  // Prefer initialHistoryData (from server) over context historyData (from cache/fetch)
  const displayHistoryData = useMemo(() => {
    if (initialHistoryData.length > 0) {
      return initialHistoryData
    }
    return historyData
  }, [initialHistoryData, historyData])

  return (
    <main className="min-h-screen relative overflow-hidden">
      <WeatherBackground condition={mergedWeatherData.current.condition} />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <Header />

        <div className="mt-8">
          {/* Current Weather */}
          <CurrentWeather data={sensorData} weather={mergedWeatherData.current} />

          {/* Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <WindStatus data={mergedWeatherData.wind} />
            <SunriseSunset data={mergedWeatherData.sun} />
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

          {/* Advanced Dashboard with Multiple Charts */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">Dashboard Nâng cao</h2>
            </div>
            <AdvancedSensorDashboard data={sensorData} />
          </div>

          {/* Statistics */}
          <div className="mt-8">
            <SensorStatistics 
              history={
                displayHistoryData.length > 0
                  ? displayHistoryData.map(item => ({
                      temp_room: item.temp_room,
                      hum_room: item.hum_room,
                      temp_out: item.temp_out,
                      lux: item.lux,
                      ldr_raw: item.ldr_raw,
                      timestamp: item.timestamp,
                    }))
                  : sensorData
                    ? [{
                        temp_room: sensorData.temp_room,
                        hum_room: sensorData.hum_room,
                        temp_out: sensorData.temp_out,
                        lux: sensorData.lux,
                        ldr_raw: sensorData.ldr_raw,
                        timestamp: sensorData.timestamp,
                      }]
                    : []
              } 
            />
          </div>

          {/* Data Table */}
          <div className="mt-8">
            <SensorDataTable data={displayHistoryData} isLoading={isLoadingHistory && displayHistoryData.length === 0} />
          </div>

        </div>
      </div>
    </main>
  )
}
