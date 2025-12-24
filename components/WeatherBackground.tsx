'use client'

import { useEffect, useState, memo } from 'react'

interface WeatherBackgroundProps {
  condition: string
  isDay?: boolean // Future support for day/night
}

function WeatherBackground({ condition }: WeatherBackgroundProps) {
  const [weatherType, setWeatherType] = useState('clear')

  // List of conditions to map
  // 'Thunderstorm': 'Dông bão'
  // 'Drizzle': 'Mưa phùn'
  // 'Rain': 'Mưa'
  // 'Snow': 'Tuyết'
  // 'Mist': 'Sương mù'
  // 'Smoke': 'Khói'
  // 'Haze': 'Sương mù nhẹ'
  // 'Dust': 'Bụi'
  // 'Fog': 'Sương mù'
  // 'Sand': 'Cát'
  // 'Ash': 'Tro'
  // 'Squall': 'Giông tố'
  // 'Tornado': 'Lốc xoáy'
  // 'Clear': 'Trời quang'
  // 'Clouds': 'Có mây'

  useEffect(() => {
    if (!condition) return
    const c = condition.toLowerCase()
    
    // Exact mapping for the requested list
    if (c.includes('thunder') || c.includes('storm')) setWeatherType('thunderstorm')
    else if (c.includes('drizzle')) setWeatherType('drizzle')
    else if (c.includes('rain')) setWeatherType('rain')
    else if (c.includes('snow')) setWeatherType('snow')
    else if (c.includes('mist')) setWeatherType('mist')
    else if (c.includes('smoke')) setWeatherType('smoke')
    else if (c.includes('haze')) setWeatherType('haze')
    else if (c.includes('dust')) setWeatherType('dust')
    else if (c.includes('fog')) setWeatherType('fog')
    else if (c.includes('sand')) setWeatherType('sand')
    else if (c.includes('ash')) setWeatherType('ash')
    else if (c.includes('squall')) setWeatherType('squall')
    else if (c.includes('tornado')) setWeatherType('tornado')
    else if (c.includes('clouds')) setWeatherType('clouds')
    else setWeatherType('clear') // Default to clear
  }, [condition])

  // Helper to determine active background classes
  const getGradient = () => {
    switch (weatherType) {
      case 'thunderstorm':
      case 'squall':
      case 'tornado':
        return 'from-slate-900 via-indigo-950 to-slate-900'
      case 'rain':
      case 'drizzle':
        return 'from-slate-800 via-slate-700 to-blue-900'
      case 'snow':
        return 'from-slate-200 via-blue-100 to-slate-300'
      case 'mist':
      case 'fog':
      case 'haze':
      case 'smoke':
        return 'from-stone-400 via-stone-300 to-stone-500' // Grayish
      case 'dust':
      case 'sand':
        return 'from-orange-200 via-amber-200 to-orange-300' // Dusty yellow
      case 'ash':
        return 'from-gray-500 via-gray-600 to-gray-700'
      case 'clouds':
        return 'from-sky-400 via-blue-400 to-blue-500' // Pretty cloudy sky
      case 'clear':
      default:
        return 'from-cyan-400 via-sky-400 to-blue-500' // Vivid Clear Sky
    }
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* 1. Base Gradient Layer */}
      <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-1000 ${getGradient()}`} />

      {/* 2. Visual Effects Layer */}
      
      {/* --- RAIN / THUNDERSTORM / DRIZZLE / SQUALL --- */}
      {(['rain', 'thunderstorm', 'drizzle', 'squall', 'tornado'].includes(weatherType)) && (
        <>
          {/* Dark Clouds Layer */}
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-40 animate-drift-slow">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-transparent to-transparent"></div>
          </div>
          
          {/* Rain Drops */}
          <div className="absolute inset-0 opacity-40 rain-container">
             {[...Array(weatherType === 'drizzle' ? 30 : 80)].map((_, i) => (
               <div 
                 key={i} 
                 className={`absolute bg-white/40 animate-rain ${weatherType === 'drizzle' ? 'w-[1px] h-4' : 'w-[2px] h-8'}`}
                 style={{
                   left: `${Math.random() * 100}%`,
                   animationDuration: `${(weatherType === 'drizzle' ? 1 : 0.5) + Math.random() * 0.5}s`,
                   animationDelay: `${Math.random() * 2}s`
                 }} 
               />
             ))}
          </div>

          {/* Lightning (Thunderstorm only) */}
          {(weatherType === 'thunderstorm' || weatherType === 'squall') && (
            <div className="absolute inset-0 bg-white opacity-0 animate-lightning z-10"></div>
          )}
        </>
      )}

      {/* --- SNOW --- */}
      {weatherType === 'snow' && (
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full opacity-80 animate-snow"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${3 + Math.random() * 5}s`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      )}

      {/* --- CLOUDS / CLEAR --- */}
      {(weatherType === 'clear' || weatherType === 'clouds') && (
        <>
          {/* Sun / Light Source */}
          <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] bg-gradient-radial from-yellow-200/40 to-transparent blur-3xl opacity-80 animate-pulse-slow"></div>
          
          {/* Beautiful Fluffy Clouds (CSS Shapes) */}
          {[...Array(weatherType === 'clouds' ? 8 : 3)].map((_, i) => (
             <div 
               key={i}
               className="absolute bg-white/20 blur-xl rounded-full animate-drift-cloud"
               style={{
                 width: `${200 + Math.random() * 300}px`,
                 height: `${100 + Math.random() * 100}px`,
                 top: `${Math.random() * 60}%`,
                 left: `${-20}%`, // Start off-screen
                 animationDuration: `${20 + Math.random() * 40}s`,
                 animationDelay: `${i * 5}s`
               }}
             />
          ))}
        </>
      )}

      {/* --- FOG / MIST / HAZE / SMOKE / DUST / SAND / ASH --- */}
      {['fog', 'mist', 'haze', 'smoke', 'dust', 'sand', 'ash'].includes(weatherType) && (
        <div className="absolute inset-0 overflow-hidden">
           {/* Drifting Fog Layers */}
           <div className={`absolute inset-0 bg-gradient-to-r ${weatherType === 'dust' || weatherType === 'sand' ? 'from-orange-300/20 to-yellow-300/20' : 'from-white/10 to-transparent'} animate-mist-1`}></div>
           <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent animate-mist-2 mix-blend-overlay"></div>
        </div>
      )}

      <style jsx>{`
        /* Animations */
        @keyframes rain {
          from { transform: translateY(-100px); }
          to { transform: translateY(110vh); }
        }
        .animate-rain { animation: rain linear infinite; }

        @keyframes snow {
          from { transform: translateY(-20px) translateX(-10px); }
          to { transform: translateY(110vh) translateX(20px); }
        }
        .animate-snow { animation: snow linear infinite; }

        @keyframes lightning {
            0%, 90%, 100% { opacity: 0; }
            92% { opacity: 0.3; }
            93% { opacity: 0; }
            94% { opacity: 0.5; }
            96% { opacity: 0; }
        }
        .animate-lightning { animation: lightning 6s infinite; }

        @keyframes drift-cloud {
            from { transform: translateX(-50vw); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            to { transform: translateX(120vw); opacity: 0; }
        }
        .animate-drift-cloud { animation-timing-function: linear; animation-iteration-count: infinite; }

        @keyframes pulse-slow {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        
        @keyframes mist-1 {
            0% { transform: translateX(0); opacity: 0.3; }
            50% { transform: translateX(20px); opacity: 0.5; }
            100% { transform: translateX(0); opacity: 0.3; }
        }
        .animate-mist-1 { animation: mist-1 10s ease-in-out infinite; }

        @keyframes mist-2 {
            0% { transform: translateX(0); opacity: 0.2; }
            50% { transform: translateX(-30px); opacity: 0.4; }
            100% { transform: translateX(0); opacity: 0.2; }
        }
        .animate-mist-2 { animation: mist-2 15s ease-in-out infinite alternate; }
      `}</style>
    </div>
  )
}

export default memo(WeatherBackground)
