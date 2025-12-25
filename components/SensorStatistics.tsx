'use client'

import { useMemo } from 'react'
import type { SensorData } from '@/lib/mqttService'

interface SensorStatisticsProps {
  history: Array<{
    temp_room: number
    hum_room: number
    temp_out: number
    lux: number
    ldr_raw: number
    timestamp: number
  }>
}

export default function SensorStatistics({ history }: SensorStatisticsProps) {
  const stats = useMemo(() => {
    if (!history || history.length === 0) {
      return {
        temp_room: { min: 0, max: 0, avg: 0 },
        hum_room: { min: 0, max: 0, avg: 0 },
        temp_out: { min: 0, max: 0, avg: 0 },
        lux: { min: 0, max: 0, avg: 0 },
        ldr_raw: { min: 0, max: 0, avg: 0 },
      }
    }

    const calculate = (key: keyof typeof history[0]) => {
      const values = history.map((h) => h[key] as number).filter((v) => !isNaN(v))
      if (values.length === 0) return { min: 0, max: 0, avg: 0 }
      return {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
      }
    }

    return {
      temp_room: calculate('temp_room'),
      hum_room: calculate('hum_room'),
      temp_out: calculate('temp_out'),
      lux: calculate('lux'),
      ldr_raw: calculate('ldr_raw'),
    }
  }, [history])

  const statCards = [
    {
      title: 'Nhiệt độ phòng',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
        </svg>
      ),
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      borderColor: 'border-red-400/20',
      unit: '°C',
      stats: stats.temp_room,
    },
    {
      title: 'Độ ẩm phòng',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
      ),
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20',
      unit: '%',
      stats: stats.hum_room,
    },
    {
      title: 'Nhiệt độ ngoài',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
        </svg>
      ),
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
      borderColor: 'border-orange-400/20',
      unit: '°C',
      stats: stats.temp_out,
    },
    {
      title: 'Ánh sáng',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ),
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/20',
      unit: 'lux',
      stats: stats.lux,
    },
  ]

  if (!history || history.length === 0) {
    return (
      <div className="glass-strong rounded-2xl p-6 border border-white/15 shadow-lg shadow-slate-900/40">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/>
            </svg>
          </div>
          <h3 className="text-white text-lg font-semibold">Thống kê dữ liệu</h3>
        </div>
        <div className="text-center py-8 text-white/50">
          <p>Chưa có dữ liệu để thống kê</p>
          <p className="text-sm mt-2">Đang chờ dữ liệu từ cảm biến...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/15 shadow-lg shadow-slate-900/40">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/>
          </svg>
        </div>
        <h3 className="text-white text-lg font-semibold">Thống kê dữ liệu</h3>
        <div className="ml-auto px-3 py-1 rounded-lg bg-white/5 border border-white/10">
          <span className="text-white/60 text-xs">
            {history.length} mẫu
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`rounded-xl border ${card.borderColor} ${card.bgColor} p-4 hover:bg-white/5 transition-all duration-200`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={card.color}>{card.icon}</div>
              <span className="text-white/70 text-sm font-medium">{card.title}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">Tối thiểu</span>
                <span className="text-white font-semibold text-sm">
                  {card.stats.min.toFixed(1)}{card.unit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">Trung bình</span>
                <span className="text-white font-bold text-base">
                  {card.stats.avg.toFixed(1)}{card.unit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">Tối đa</span>
                <span className="text-white font-semibold text-sm">
                  {card.stats.max.toFixed(1)}{card.unit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

