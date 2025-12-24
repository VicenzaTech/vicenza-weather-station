/**
 * Utility functions for time-based theming
 */

export type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night'

export interface TimeTheme {
  period: TimeOfDay
  name: string
  gradient: string
  accentColor: string
  sunMoonPosition: { top: string; right: string; opacity: number; blur: string }
  stars: boolean
  clouds: boolean
}

/**
 * Get current time of day based on hour
 */
export function getTimeOfDay(hour: number = new Date().getHours()): TimeOfDay {
  if (hour >= 5 && hour < 7) return 'dawn'      // 5-7h: Bình minh
  if (hour >= 7 && hour < 11) return 'morning'  // 7-11h: Sáng
  if (hour >= 11 && hour < 14) return 'noon'    // 11-14h: Trưa
  if (hour >= 14 && hour < 18) return 'afternoon' // 14-18h: Chiều
  if (hour >= 18 && hour < 21) return 'evening'   // 18-21h: Tối
  return 'night' // 21-5h: Đêm
}

/**
 * Get theme configuration based on time of day
 */
export function getTimeTheme(timeOfDay?: TimeOfDay): TimeTheme {
  const period = timeOfDay || getTimeOfDay()
  
  switch (period) {
    case 'dawn': // 5-7h: Bình minh - Cam, hồng, vàng nhạt
      return {
        period: 'dawn',
        name: 'Bình minh',
        gradient: 'from-orange-500 via-pink-400 to-yellow-300',
        accentColor: 'orange',
        sunMoonPosition: { 
          top: '10%', 
          right: '15%', 
          opacity: 0.7, 
          blur: 'blur-3xl' 
        },
        stars: false,
        clouds: true,
      }
    
    case 'morning': // 7-11h: Sáng - Vàng, xanh nhạt
      return {
        period: 'morning',
        name: 'Buổi sáng',
        gradient: 'from-yellow-300 via-blue-300 to-sky-400',
        accentColor: 'yellow',
        sunMoonPosition: { 
          top: '5%', 
          right: '10%', 
          opacity: 0.8, 
          blur: 'blur-3xl' 
        },
        stars: false,
        clouds: true,
      }
    
    case 'noon': // 11-14h: Trưa - Xanh dương sáng, vàng rực
      return {
        period: 'noon',
        name: 'Buổi trưa',
        gradient: 'from-cyan-400 via-sky-400 to-blue-500',
        accentColor: 'cyan',
        sunMoonPosition: { 
          top: '-5%', 
          right: '5%', 
          opacity: 0.9, 
          blur: 'blur-2xl' 
        },
        stars: false,
        clouds: true,
      }
    
    case 'afternoon': // 14-18h: Chiều - Cam, đỏ cam
      return {
        period: 'afternoon',
        name: 'Buổi chiều',
        gradient: 'from-orange-400 via-red-400 to-pink-500',
        accentColor: 'orange',
        sunMoonPosition: { 
          top: '15%', 
          right: '20%', 
          opacity: 0.75, 
          blur: 'blur-3xl' 
        },
        stars: false,
        clouds: true,
      }
    
    case 'evening': // 18-21h: Tối - Tím, xanh đậm
      return {
        period: 'evening',
        name: 'Buổi tối',
        gradient: 'from-indigo-900 via-purple-900 to-slate-900',
        accentColor: 'purple',
        sunMoonPosition: { 
          top: '25%', 
          right: '25%', 
          opacity: 0.5, 
          blur: 'blur-2xl' 
        },
        stars: true,
        clouds: true,
      }
    
    case 'night': // 21-5h: Đêm - Đen, xanh đậm, tím đậm
    default:
      return {
        period: 'night',
        name: 'Đêm',
        gradient: 'from-slate-950 via-indigo-950 to-black',
        accentColor: 'indigo',
        sunMoonPosition: { 
          top: '10%', 
          right: '15%', 
          opacity: 0.4, 
          blur: 'blur-3xl' 
        },
        stars: true,
        clouds: false,
      }
  }
}

/**
 * Get time-based background gradient that combines weather and time
 */
export function getCombinedBackground(weatherType: string, timeTheme: TimeTheme): string {
  // For night time, override with darker theme regardless of weather
  if (timeTheme.period === 'night') {
    return 'from-slate-950 via-indigo-950 to-black'
  }
  
  if (timeTheme.period === 'evening') {
    // Evening: darker tones but keep weather hints
    if (['rain', 'thunderstorm', 'drizzle'].includes(weatherType)) {
      return 'from-indigo-900 via-purple-800 to-slate-900'
    }
    return 'from-indigo-900 via-purple-900 to-slate-900'
  }
  
  // For other times, blend weather with time theme
  // This creates a more natural look
  const weatherBase = {
    rain: 'from-slate-700 via-slate-600 to-blue-800',
    thunderstorm: 'from-slate-800 via-indigo-900 to-slate-900',
    clear: timeTheme.gradient,
    clouds: 'from-sky-500 via-blue-500 to-blue-600',
    snow: 'from-slate-300 via-blue-200 to-slate-400',
  }[weatherType] || timeTheme.gradient
  
  return weatherBase
}

