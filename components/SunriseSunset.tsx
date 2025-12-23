'use client'

interface SunriseSunsetProps {
  data: {
    sunrise: string
    sunset: string
    currentTime: string
  }
}

export default function SunriseSunset({ data }: SunriseSunsetProps) {
  // Convert time strings to minutes for calculation
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const sunriseMinutes = timeToMinutes(data.sunrise)
  const sunsetMinutes = timeToMinutes(data.sunset)
  const currentMinutes = timeToMinutes(data.currentTime)
  const totalDaylight = sunsetMinutes - sunriseMinutes
  const elapsed = currentMinutes - sunriseMinutes
  const progress = Math.max(0, Math.min(1, elapsed / totalDaylight))
  const angle = progress * 180 // 0 to 180 degrees for semicircle

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌅</span>
          <span className="text-white text-sm">Sunrise</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌇</span>
          <span className="text-white text-sm">Sunset</span>
        </div>
      </div>

      {/* Semicircular Gauge */}
      <div className="relative h-32 flex items-center justify-center">
        <svg width="200" height="120" className="absolute" viewBox="0 0 200 120">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="3"
          />
          
          {/* Progress arc */}
          {angle > 0 && (
            <path
              d={`M 20 100 A 80 80 0 ${angle > 90 ? 1 : 0} 1 ${
                20 + 160 * Math.sin((angle * Math.PI) / 180)
              } ${
                100 - 80 * (1 - Math.cos((angle * Math.PI) / 180))
              }`}
              fill="none"
              stroke="rgba(255, 165, 0, 0.6)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}
          
          {/* Sunrise marker */}
          <circle cx="20" cy="100" r="4" fill="orange" />
          
          {/* Sunset marker */}
          <circle cx="180" cy="100" r="4" fill="blue" />
          
          {/* Current position */}
          {angle > 0 && (
            <circle
              cx={20 + 160 * Math.sin((angle * Math.PI) / 180)}
              cy={100 - 80 * (1 - Math.cos((angle * Math.PI) / 180))}
              r="5"
              fill="white"
            />
          )}
          
          {/* Sun icon at base */}
          <text x="100" y="105" textAnchor="middle" fontSize="20">☀️</text>
        </svg>
      </div>

      <div className="flex justify-between mt-4 text-white/70 text-xs">
        <span>{data.sunrise}</span>
        <span>{data.sunset}</span>
      </div>
    </div>
  )
}

