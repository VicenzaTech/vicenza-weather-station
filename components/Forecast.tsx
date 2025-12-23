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
      return '⛈️'
    case 'sun-cloud':
      return '⛅'
    case 'cloud':
    default:
      return '☁️'
  }
}

export default function Forecast({ data }: ForecastProps) {
  return (
    <div className="glass-strong rounded-2xl p-6 md:p-8">
      <div className="relative">
        {/* Wave line connecting the days */}
        <svg className="absolute top-0 left-0 w-full h-20 pointer-events-none" style={{ top: '-10px' }}>
          <path
            d={`M 0 40 ${data.map((_, i) => {
              const x = (i / (data.length - 1)) * 100
              const y = 40 + Math.sin(i * 0.5) * 10
              return `L ${x}% ${y}`
            }).join(' ')}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="2"
          />
        </svg>

        {/* Forecast items */}
        <div className="flex justify-between items-start relative z-10">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div className="text-white/70 text-xs md:text-sm mb-1">
                {item.day.slice(0, 3)}
              </div>
              <div className="text-white text-lg md:text-xl font-semibold mb-2">
                {item.temp}°
              </div>
              <div className="text-3xl md:text-4xl">
                {getIcon(item.icon)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

