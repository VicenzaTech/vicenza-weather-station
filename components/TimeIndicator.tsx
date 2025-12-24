'use client'

import { useEffect, useState } from 'react'
import { getTimeOfDay, getTimeTheme } from '@/lib/timeTheme'
import { getLunarDate } from '@/lib/lunarDate'

export default function TimeIndicator() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const timeTheme = getTimeTheme(getTimeOfDay(currentTime.getHours()))

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000) // Update every second
    
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', { 
      day: 'numeric', 
      month: 'short' 
    })
  }

  const getTimeIcon = () => {
    switch (timeTheme.period) {
      case 'dawn':
        return (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>
        )
      case 'morning':
      case 'noon':
        return (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
          </svg>
        )
      case 'afternoon':
        return (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )
      case 'evening':
      case 'night':
        return (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3"/>
          </svg>
        )
      default:
        return null
    }
  }

  const getAccentColor = () => {
    switch (timeTheme.accentColor) {
      case 'orange': return 'text-orange-400'
      case 'yellow': return 'text-yellow-400'
      case 'cyan': return 'text-cyan-400'
      case 'purple': return 'text-purple-400'
      case 'indigo': return 'text-indigo-400'
      default: return 'text-blue-400'
    }
  }

  return (
    <div className="glass px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
      {/* Time Icon */}
      <div className={getAccentColor()}>
        {getTimeIcon()}
      </div>
      
      {/* Time Display */}
      <div className="text-white font-bold text-lg">{formatTime(currentTime)}</div>
      
      {/* Divider */}
      <div className="w-px h-4 bg-white/20"></div>
      
      {/* Date and Time Period */}
      <div className="flex flex-col">
        <div className="text-white/80 text-sm font-medium uppercase leading-none">
          {formatDate(currentTime)}
        </div>
        <div className="text-white/60 text-[10px] font-medium mt-0.5">
          {getLunarDate(currentTime)} • {timeTheme.name}
        </div>
      </div>
    </div>
  )
}

