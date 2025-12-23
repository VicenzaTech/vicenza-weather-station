'use client'

export default function Header() {
  const currentDate = new Date()
  const dateStr = currentDate.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short' 
  })
  const timeStr = currentDate.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div className="mb-4 md:mb-0">
        <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
          <span>☁️</span>
          <span>forecast now</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-white text-sm md:text-base">
          {dateStr} | {timeStr}
        </div>
        <div className="glass rounded-full px-4 py-2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
            SR
          </div>
          <div className="hidden md:block">
            <div className="text-white text-sm font-medium">Sam Raw</div>
            <div className="text-white/60 text-xs">Admin</div>
          </div>
          <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

