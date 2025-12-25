'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { SensorData } from '@/lib/mqttService'

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

interface AppContextType {
  sensorData: SensorData | null
  weatherData: WeatherData | null
  historyData: HistoryDataItem[]
  isLoadingHistory: boolean
  lastWeatherUpdate: Date | null
  lastHistoryUpdate: Date | null
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const CACHE_KEYS = {
  WEATHER: 'vicenza_weather_cache',
  HISTORY: 'vicenza_history_cache',
  SENSOR: 'vicenza_sensor_cache',
}

const CACHE_DURATION = {
  WEATHER: 10 * 60 * 1000, // 10 minutes
  HISTORY: 1 * 60 * 1000, // 1 minute
  SENSOR: 30 * 1000, // 30 seconds
}

function getCachedData<T>(key: string): { data: T; timestamp: number } | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    const parsed = JSON.parse(cached)
    return parsed
  } catch {
    return null
  }
}

function setCachedData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  try {
    const cache = {
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(key, JSON.stringify(cache))
  } catch {
    // Ignore storage errors
  }
}

function isCacheValid(timestamp: number, duration: number): boolean {
  return Date.now() - timestamp < duration
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Initialize state with cache immediately (synchronous) - no useEffect needed
  const historyCache = typeof window !== 'undefined' ? getCachedData<HistoryDataItem[]>(CACHE_KEYS.HISTORY) : null
  const weatherCache = typeof window !== 'undefined' ? getCachedData<WeatherData>(CACHE_KEYS.WEATHER) : null
  const sensorCache = typeof window !== 'undefined' ? getCachedData<SensorData>(CACHE_KEYS.SENSOR) : null

  const [sensorData, setSensorData] = useState<SensorData | null>(
    sensorCache && isCacheValid(sensorCache.timestamp, CACHE_DURATION.SENSOR) ? sensorCache.data : null
  )
  const [weatherData, setWeatherData] = useState<WeatherData | null>(
    weatherCache && isCacheValid(weatherCache.timestamp, CACHE_DURATION.WEATHER) ? weatherCache.data : null
  )
  const [historyData, setHistoryData] = useState<HistoryDataItem[]>(
    historyCache && isCacheValid(historyCache.timestamp, CACHE_DURATION.HISTORY) ? historyCache.data : []
  )
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [lastWeatherUpdate, setLastWeatherUpdate] = useState<Date | null>(
    weatherCache ? new Date(weatherCache.timestamp) : null
  )
  const [lastHistoryUpdate, setLastHistoryUpdate] = useState<Date | null>(
    historyCache ? new Date(historyCache.timestamp) : null
  )

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('/api/weather')
        if (response.ok) {
          const data = await response.json()
          setWeatherData(data)
          setLastWeatherUpdate(new Date())
          setCachedData(CACHE_KEYS.WEATHER, data)
        }
      } catch (error) {
        console.error('Error fetching weather:', error)
      }
    }

    // Only fetch if cache is invalid or doesn't exist
    const weatherCache = getCachedData<WeatherData>(CACHE_KEYS.WEATHER)
    if (!weatherCache || !isCacheValid(weatherCache.timestamp, CACHE_DURATION.WEATHER)) {
      fetchWeather()
    }

    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 600000)
    return () => clearInterval(interval)
  }, [])

  // Fetch sensor data from MQTT (SSE)
  useEffect(() => {
    const eventSource = new EventSource('/api/sensor-data')

    eventSource.onmessage = (event) => {
      try {
        const data: SensorData = JSON.parse(event.data)
        setSensorData(data)
        setCachedData(CACHE_KEYS.SENSOR, data)
      } catch (error) {
        console.error('SSE parse error:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
      // Try to reconnect after a delay
      setTimeout(() => {
        eventSource.close()
      }, 5000)
    }

    return () => {
      eventSource.close()
    }
  }, [])

  // Fetch sensor history
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true)
      try {
        const response = await fetch('/api/sensor-history?hours=24&limit=200')
        const result = await response.json()
        
        // Process result whether response is ok or not (API returns 200 even on errors)
        if (result.data && Array.isArray(result.data)) {
          console.log('[History] Fetched data:', result.data.length, 'items')
          if (result.error) {
            console.warn('[History] API warning:', result.error, result.message)
          }
          setHistoryData(result.data)
          setLastHistoryUpdate(new Date())
          setCachedData(CACHE_KEYS.HISTORY, result.data)
        } else {
          console.warn('[History] Invalid response format:', result)
          setHistoryData([])
        }
      } catch (error) {
        console.error('[History] Fetch error:', error)
        setHistoryData([])
      } finally {
        setIsLoadingHistory(false)
      }
    }

    // Only fetch if cache is invalid or doesn't exist
    const historyCache = getCachedData<HistoryDataItem[]>(CACHE_KEYS.HISTORY)
    if (!historyCache || !isCacheValid(historyCache.timestamp, CACHE_DURATION.HISTORY)) {
      fetchHistory()
    }

    // Refresh every minute
    const interval = setInterval(fetchHistory, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AppContext.Provider
      value={{
        sensorData,
        weatherData,
        historyData,
        isLoadingHistory,
        lastWeatherUpdate,
        lastHistoryUpdate,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

