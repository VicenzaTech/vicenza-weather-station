'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getLunarDate } from '@/lib/lunarDate'

export default function Header() {
  const pathname = usePathname()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const dateStr = currentTime.toLocaleDateString('vi-VN', { 
    day: 'numeric', 
    month: 'short' 
  })
  const timeStr = currentTime.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  })
  const lunarDateStr = getLunarDate(currentTime)

  const navIcons = [
    {
      name: 'home',
      href: '/',
      title: 'Trang chủ',
      render: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8" fill="none">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      name: 'map',
      href: '/ban-do',
      title: 'Bản đồ',
      render: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8" fill="none">
          <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6" />
          <line x1="9" y1="4" x2="9" y2="20" />
          <line x1="15" y1="6" x2="15" y2="22" />
        </svg>
      ),
    },
    {
      name: 'news',
      href: '/tin-tuc', 
      title: 'Tin tức',
      render: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8" fill="none">
          <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      name: 'settings',
      href: '#',
      title: 'Cài đặt',
      render: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8" fill="none">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c0 .66.39 1.26 1 1.51.17.07.36.11.55.12H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      ),
    },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
      {/* LEFT: Time and Date */}
      <div className="flex items-center gap-3">
        <div className="glass px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
             <div className="text-white font-bold text-lg">{timeStr}</div>
             <div className="w-px h-4 bg-white/20"></div>
             <div className="flex flex-col">
               <div className="text-white/80 text-sm font-medium uppercase leading-none">{dateStr}</div>
               <div className="text-white/60 text-[10px] font-medium mt-0.5">{lunarDateStr}</div>
             </div>
        </div>
      </div>

      {/* CENTER: Navigation (Slide Menu) */}
      <div className="glass-strong rounded-full px-4 py-2 flex items-center gap-2 border border-white/10 shadow-lg shadow-black/10">
        {navIcons.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              isActive(item.href)
                ? 'bg-white/20 text-white'
                : 'bg-transparent text-white/60 hover:bg-white/10 hover:text-white'
            }`}
            aria-label={item.title}
            title={item.title}
          >
            {item.render}
          </Link>
        ))}
      </div>
      
      {/* RIGHT: Login / Profile */}
      <div className="flex items-center gap-4">
        <div className="glass rounded-full px-3 py-1.5 pr-5 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
            V
          </div>
          <div className="hidden md:block">
            <div className="text-white text-sm font-semibold">VICENZA</div>
            <div className="text-white/50 text-[10px] font-medium tracking-wider uppercase">Admin</div>
          </div>
          <svg className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
