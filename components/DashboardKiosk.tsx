'use client'

import { useState, useEffect, useMemo } from 'react'
import type { SensorData } from '@/lib/mqttService'
import { getLunarDate } from '@/lib/lunarDate'
import { getTimeOfDay, getTimeTheme } from '@/lib/timeTheme'

interface DashboardKioskProps {
  sensorData: SensorData | null
  weatherData: any
}

export default function DashboardKiosk({ sensorData, weatherData }: DashboardKioskProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const timeTheme = useMemo(() => getTimeTheme(getTimeOfDay(currentTime.getHours())), [currentTime])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const formatSeconds = (date: Date) => {
    return date.getSeconds().toString().padStart(2, '0')
  }

  const formatDate = (date: Date) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
    return `${days[date.getDay()]}, ${date.getDate()} tháng ${date.getMonth() + 1}`
  }

  const displayTemp = sensorData ? sensorData.temp_out : weatherData?.current?.temp || 0
  const displayHum = sensorData ? sensorData.hum_room : weatherData?.current?.humidity || 0
  const displayLux = sensorData ? sensorData.lux : null

  const sensorCards = [
    {
      label: 'Nhiệt độ ngoài',
      value: `${displayTemp.toFixed(1)}°C`,
      icon: (
        <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-orange-500/20 to-red-500/20'
    },
    {
      label: 'Độ ẩm phòng',
      value: `${displayHum}%`,
      icon: (
        <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      color: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      label: 'Ánh sáng',
      value: `${displayLux?.toFixed(0) || '0'} lux`,
      icon: (
        <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
        </svg>
      ),
      color: 'from-yellow-500/20 to-orange-500/20'
    },
    {
      label: 'Nhiệt độ phòng',
      value: `${sensorData?.temp_room.toFixed(1) || '0'}°C`,
      icon: (
        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      color: 'from-emerald-500/20 to-teal-500/20'
    }
  ]

  const RenderWeatherIcon = ({ iconType, className }: { iconType: string, className?: string }) => {
    switch (iconType) {
      case 'storm':
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="13 11 9 17 15 17 11 23" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      case 'sun-cloud':
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="1" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="21" x2="12" y2="23" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="1" y1="12" x2="3" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="21" y1="12" x2="23" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      case 'cloud':
      default:
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 animate-in fade-in zoom-in duration-500">
      {/* LEFT: Time and Main Status */}
      <div className="lg:w-1/3 flex flex-col justify-between glass-strong rounded-[2.5rem] p-10 border border-white/10 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-white/10 transition-colors duration-1000"></div>
        
        <div className="z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-xl bg-white/10 ${timeTheme.accentColor ? `text-${timeTheme.accentColor}-400` : 'text-blue-400'}`}>
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span className="text-white/60 font-semibold tracking-widest uppercase text-sm">
              {timeTheme.name}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <h1 className="text-[7rem] font-black text-white leading-none tracking-tighter">
              {formatTime(currentTime)}
            </h1>
            <span className="text-4xl font-bold text-white/30 mb-4">{formatSeconds(currentTime)}</span>
          </div>
          
          <div className="mt-4">
            <p className="text-2xl font-bold text-white/90">{formatDate(currentTime)}</p>
            <p className="text-lg text-white/50 font-medium mt-1">
              Âm lịch: {getLunarDate(currentTime)}
            </p>
          </div>
        </div>

        <div className="z-10 mt-10">
          <div className="h-px bg-white/10 w-full mb-8"></div>
          <div className="flex items-center gap-6">
            <div className="text-6xl font-bold text-white leading-none">{displayTemp.toFixed(0)}°</div>
            <div>
              <div className="text-2xl font-bold text-white/90">{weatherData?.current?.condition || 'N/A'}</div>
              <div className="text-white/50 font-medium">{weatherData?.current?.location || 'Trạm VICENZA'}</div>
            </div>
            <div className="ml-auto">
               <RenderWeatherIcon 
                 iconType={weatherData?.current?.weatherMain === 'Clear' ? 'sun-cloud' : weatherData?.current?.weatherMain === 'Thunderstorm' ? 'storm' : 'cloud'} 
                 className="w-16 h-16 text-white/80 filter drop-shadow-xl"
               />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Grid of sensor cards */}
      <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
        {sensorCards.map((card, idx) => (
          <div 
            key={idx} 
            className={`glass-strong rounded-[2.5rem] p-8 border border-white/10 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br ${card.color}`}
          >
            <div className="flex justify-between items-start">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md">
                {card.icon}
              </div>
              <div className="text-right">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Live Now</span>
                <div className="flex items-center gap-1.5 justify-end mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-emerald-500 text-[9px] font-bold uppercase tracking-tight">Connected</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-white/60 text-lg font-medium mb-1">{card.label}</div>
              <div className="text-5xl font-black text-white tracking-tight italic">
                {card.value}
              </div>
            </div>
          </div>
        ))}

        {/* Forecast Mini Area (Replacing one card slot or adding horizontally) */}
        <div className="md:col-span-2 glass-strong rounded-[2.5rem] p-8 border border-white/10 flex items-center justify-between overflow-x-auto no-scrollbar gap-8">
           {weatherData?.forecast?.slice(0, 5).map((item: any, idx: number) => (
             <div key={idx} className="flex flex-col items-center min-w-[100px] group transition-transform hover:scale-110">
               <span className="text-white/40 text-xs font-bold uppercase mb-4 tracking-wider">{item.day}</span>
               <RenderWeatherIcon 
                 iconType={item.icon} 
                 className={`w-14 h-14 mb-4 filter drop-shadow-lg ${item.icon === 'storm' ? 'text-yellow-400' : item.icon === 'sun-cloud' ? 'text-yellow-300' : 'text-white/70'}`} 
               />
               <span className="text-3xl font-black text-white italic">{item.temp.toFixed(0)}°</span>
             </div>
           ))}
           {(!weatherData?.forecast || weatherData.forecast.length === 0) && (
             <div className="w-full text-center text-white/30 font-medium py-10">Đang tải dự báo thời tiết...</div>
           )}
        </div>
      </div>
    </div>
  )
}
