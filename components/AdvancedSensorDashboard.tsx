'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import type { SensorData } from '@/lib/mqttService'

interface AdvancedSensorDashboardProps {
  data: SensorData | null
}

interface ChartDataPoint {
  time: string
  temp_room: number
  temp_out: number
  hum_room: number
  lux: number
  ldr_raw: number
  timestamp: number
}

interface HistoryData {
  data: Array<{
    temp_room: number
    hum_room: number
    temp_out: number
    lux: number
    ldr_raw: number
    timestamp: number
  }>
  count: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong p-3 rounded-xl border border-white/10 shadow-xl">
        <p className="text-white/70 text-xs mb-2 font-medium">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-white/90 font-semibold">
                {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value} {entry.unit || ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export default function AdvancedSensorDashboard({ data }: AdvancedSensorDashboardProps) {
  const [history, setHistory] = useState<ChartDataPoint[]>([])
  const [dbHistory, setDbHistory] = useState<HistoryData | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const maxPoints = 50 // Keep last 50 data points for real-time

  // Real-time history from live data
  useEffect(() => {
    if (!data) return

    setHistory(prev => {
      const now = new Date()
      const newPoint: ChartDataPoint = {
        time: now.toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        }),
        timestamp: now.getTime(),
        temp_room: data.temp_room || 0,
        temp_out: data.temp_out || 0,
        hum_room: data.hum_room || 0,
        lux: data.lux || 0,
        ldr_raw: data.ldr_raw || 0,
      }
      
      const lastPoint = prev[prev.length - 1]
      if (lastPoint && (newPoint.timestamp - lastPoint.timestamp) < 2000) {
        return prev
      }

      const newHistory = [...prev, newPoint]
      if (newHistory.length > maxPoints) {
        return newHistory.slice(newHistory.length - maxPoints)
      }
      return newHistory
    })
  }, [data])

  // Fetch database history
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true)
      try {
        const response = await fetch('/api/sensor-history?hours=24&limit=200')
        if (response.ok) {
          const result = await response.json()
          setDbHistory(result)
        }
      } catch (error) {
        console.error('Error fetching history:', error)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    fetchHistory()
    const interval = setInterval(fetchHistory, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  // Prepare radar chart data
  const radarData = useMemo(() => {
    if (!data) return []
    const maxTemp = 40
    const maxHum = 100
    const maxLux = 2000

    return [
      {
        subject: 'Nhiệt độ phòng',
        value: (data.temp_room / maxTemp) * 100,
        fullMark: 100,
      },
      {
        subject: 'Độ ẩm',
        value: data.hum_room,
        fullMark: 100,
      },
      {
        subject: 'Nhiệt độ ngoài',
        value: (data.temp_out / maxTemp) * 100,
        fullMark: 100,
      },
      {
        subject: 'Ánh sáng',
        value: (data.lux / maxLux) * 100,
        fullMark: 100,
      },
    ]
  }, [data])

  // Prepare chart data from database or real-time
  const chartData = useMemo(() => {
    if (dbHistory && dbHistory.data.length > 0) {
      return dbHistory.data.map(item => ({
        time: new Date(item.timestamp * 1000).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        temp_room: item.temp_room,
        temp_out: item.temp_out,
        hum_room: item.hum_room,
        lux: item.lux,
        ldr_raw: item.ldr_raw,
      })).slice(-30) // Last 30 points
    }
    return history.slice(-30)
  }, [dbHistory, history])

  if (history.length < 2 && !dbHistory) {
    return (
      <div className="glass-strong rounded-2xl p-6 border border-white/15 min-h-[300px] flex items-center justify-center">
        <div className="text-white/50 animate-pulse">Đang thu thập dữ liệu biểu đồ...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Multi-line comparison charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Comparison */}
        <div className="glass-strong rounded-2xl p-6 border border-white/15 shadow-lg shadow-slate-900/40">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
              </svg>
              So sánh nhiệt độ
            </h3>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorTempRoomLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f87171" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="colorTempOutLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#facc15" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#eab308" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.4)" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.4)" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                  unit="°C"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }}/>
                <Line 
                  type="monotone" 
                  dataKey="temp_room" 
                  name="Trong phòng" 
                  stroke="url(#colorTempRoomLine)" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                  unit="°C"
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="temp_out" 
                  name="Ngoài trời" 
                  stroke="url(#colorTempOutLine)" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                  unit="°C"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Humidity Chart */}
        <div className="glass-strong rounded-2xl p-6 border border-white/15 shadow-lg shadow-slate-900/40">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
              Độ ẩm theo thời gian
            </h3>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.4)" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.4)" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }}/>
                <Area 
                  type="monotone" 
                  dataKey="hum_room" 
                  name="Độ ẩm phòng" 
                  stroke="#60a5fa" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorHumGrad)" 
                  unit="%"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Light and LDR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Light (Lux) Chart */}
        <div className="glass-strong rounded-2xl p-6 border border-white/15 shadow-lg shadow-slate-900/40">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
              </svg>
              Cường độ ánh sáng (Lux)
            </h3>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLuxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.4)" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.4)" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'dataMax + 100']}
                  unit=" lux"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }}/>
                <Area 
                  type="monotone" 
                  dataKey="lux" 
                  name="Ánh sáng" 
                  stroke="#facc15" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorLuxGrad)" 
                  unit=" lux"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LDR Raw Chart */}
        <div className="glass-strong rounded-2xl p-6 border border-white/15 shadow-lg shadow-slate-900/40">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              LDR Raw Values
            </h3>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.slice(-20)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.4)" 
                  tick={{ fontSize: 9 }} 
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.4)" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'dataMax + 200']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }}/>
                <Bar 
                  dataKey="ldr_raw" 
                  name="LDR Raw" 
                  fill="#a855f7" 
                  fillOpacity={0.7}
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Composed Chart and Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composed Chart - All Sensors */}
        <div className="glass-strong rounded-2xl p-6 border border-white/15 shadow-lg shadow-slate-900/40">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              Tổng quan tất cả cảm biến
            </h3>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData.slice(-15)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.4)" 
                  tick={{ fontSize: 9 }} 
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  yAxisId="left"
                  stroke="rgba(255,255,255,0.4)" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                  unit="°C"
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="rgba(255,255,255,0.4)" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }}/>
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="temp_room" 
                  name="Nhiệt độ phòng" 
                  stroke="#f87171" 
                  fill="#f87171"
                  fillOpacity={0.2}
                  unit="°C"
                  isAnimationActive={false}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="temp_out" 
                  name="Nhiệt độ ngoài" 
                  stroke="#facc15" 
                  strokeWidth={2}
                  unit="°C"
                  isAnimationActive={false}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="hum_room" 
                  name="Độ ẩm" 
                  stroke="#60a5fa" 
                  strokeWidth={2}
                  unit="%"
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        {data && radarData.length > 0 && (
          <div className="glass-strong rounded-2xl p-6 border border-white/15 shadow-lg shadow-slate-900/40">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
                Radar - Giá trị hiện tại
              </h3>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]}
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }}
                  />
                  <Radar 
                    name="Giá trị"
                    dataKey="value" 
                    stroke="#06b6d4" 
                    fill="#06b6d4" 
                    fillOpacity={0.4}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass-strong p-3 rounded-xl border border-white/10 shadow-xl">
                            <p className="text-white/90 font-semibold text-sm">
                              {payload[0].payload.subject}: {payload[0].value?.toFixed(1)}%
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

