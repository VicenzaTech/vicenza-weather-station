'use client'

interface ForecastProps {
  data: Array<{
    day: string
    temp: number
    icon: string
  }>
}

const getIcon = (iconType: string) => {
  switch (iconType) {
    case 'storm':
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full text-yellow-300" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/>
          <polyline points="13 11 9 17 15 17 11 23"/>
        </svg>
      )
    case 'sun-cloud':
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full text-yellow-300" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>
        </svg>
      )
    case 'cloud':
    default:
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full text-white/70" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
        </svg>
      )
  }
}

export default function Forecast({ data }: ForecastProps) {
  // Tạo đường cong mượt hơn
  const wavePoints = data.map((_, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 50 + Math.sin(i * 0.8) * 15
    return `${x}% ${y}`
  }).join(' L ')

  return (
    <div className="glass-strong rounded-2xl p-5 md:p-6 border border-white/15 shadow-lg shadow-slate-900/40">
      <div className="relative">
        {/* Wave line connecting the days với gradient */}
        <svg className="absolute top-0 left-0 w-full h-20 pointer-events-none" style={{ top: '-12px' }}>
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
              <stop offset="50%" stopColor="rgba(147, 197, 253, 0.4)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.4)" />
            </linearGradient>
          </defs>
          <path
            d={`M 0 50 L ${wavePoints} L 100% 50`}
            fill="none"
            stroke="url(#waveGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>

        {/* Forecast items */}
        <div className="flex justify-between items-start relative z-10 pt-3">
          {data.map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center gap-2 flex-1 group cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              <div className="text-white/60 text-xs font-medium mb-0.5">
                {item.day}
              </div>
              <div className="text-white text-lg md:text-xl font-bold mb-1.5 bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
                {Math.round(item.temp)}°
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-200">
                <div className="w-6 h-6">
                  {getIcon(item.icon)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

