'use client'

interface CurrentWeatherProps {
  data: {
    temp: number
    condition: string
    description: string
    location: string
    uvIndex: number
  }
}

export default function CurrentWeather({ data }: CurrentWeatherProps) {
  return (
    <div className="glass-strong rounded-3xl p-8 md:p-12">
      <div className="mb-6">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-2">
          {data.condition}
        </h1>
        <p className="text-white/70 text-sm md:text-base mb-4">
          intense weather conditions
        </p>
        <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-2xl">
          {data.description}
        </p>
      </div>
      
      <div className="flex items-end gap-8 mt-8">
        <div>
          <div className="text-8xl md:text-9xl font-bold text-white leading-none">
            {data.temp}°
          </div>
        </div>
        <div className="mb-4">
          <div className="text-white text-xl md:text-2xl font-medium mb-2">
            {data.location}
          </div>
          <div className="text-white/60 text-sm">
            UV Index: {data.uvIndex}
          </div>
        </div>
      </div>
    </div>
  )
}

