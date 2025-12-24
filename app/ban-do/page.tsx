'use client'

import Header from '@/components/Header'
import WeatherBackground from '@/components/WeatherBackground'
import dynamic from 'next/dynamic'

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-2xl animate-pulse">
      <p className="text-white/50">Đang tải bản đồ...</p>
    </div>
  ),
})

export default function MapPage() {
  const condition = 'Clouds' 

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <WeatherBackground condition={condition} />

      <div className="relative z-10 p-6 md:p-8 lg:p-12 h-screen flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          <Header />
          
          {/* Page Title */}
          <div className="mt-4 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <svg viewBox="0 0 24 24" className="w-7 h-7" stroke="currentColor" strokeWidth="1.8" fill="none">
                <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6" />
                <line x1="9" y1="4" x2="9" y2="20" />
                <line x1="15" y1="6" x2="15" y2="22" />
              </svg>
              Bản đồ thời tiết
            </h1>
            <p className="text-white/60 mt-1 text-sm">
              Dữ liệu gió và thời tiết trực tiếp từ Windy.com
            </p>
          </div>
          
          <div className="flex-1 glass-strong rounded-3xl p-1 overflow-hidden border border-white/20 shadow-2xl shadow-black/20">
             <div className="w-full h-full rounded-[20px] overflow-hidden relative">
                <Map />
             </div>
          </div>
        </div>
      </div>
    </main>
  )
}
