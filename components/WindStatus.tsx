'use client'

interface WindStatusProps {
  data: {
    speed: number
    gusts: number[]
    history: number[]
  }
}

export default function WindStatus({ data }: WindStatusProps) {
  const maxHistory = Math.max(...data.history, 1)
  const maxGusts = Math.max(...data.gusts, 1)

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💨</span>
        <h3 className="text-white text-lg font-semibold">Wind status</h3>
      </div>
      
      <div className="mb-6">
        <div className="text-3xl font-bold text-white mb-1">
          {data.speed.toFixed(2)} km/h
        </div>
      </div>

      {/* Line Graph */}
      <div className="mb-6">
        <div className="h-20 relative">
          <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
            <polyline
              points={data.history.map((value, index) => 
                `${(index / (data.history.length - 1)) * 200},${80 - (value / maxHistory) * 60}`
              ).join(' ')}
              fill="none"
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end gap-1 h-16">
        {data.gusts.map((value, index) => (
          <div
            key={index}
            className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
            style={{ height: `${(value / maxGusts) * 100}%` }}
          ></div>
        ))}
      </div>
    </div>
  )
}

