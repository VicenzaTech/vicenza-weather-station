'use client'

import { useEffect, useState, useCallback } from 'react'
import Header from '@/components/Header'
import WeatherBackground from '@/components/WeatherBackground'

interface NewsItem {
  title: string
  link: string
  pubDate: string
  snippet: string
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/news')
      const data = await response.json()
      if (data.news) {
        setNews(data.news)
        setLastUpdated(new Date())
      } else {
        setError('Không thể tải tin tức')
      }
    } catch (err) {
      setError('Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  const formatLastUpdated = () => {
    if (!lastUpdated) return ''
    return lastUpdated.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <WeatherBackground condition="Clouds" />

      <div className="relative z-10 p-6 md:p-8 lg:p-12 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Header />

          {/* Page Title */}
          <div className="mt-8 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                <svg viewBox="0 0 24 24" className="w-8 h-8" stroke="currentColor" strokeWidth="1.8" fill="none">
                  <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Tin tức Thanh Hóa
              </h1>
              <p className="text-white/60 mt-2">
                Cập nhật thông tin mới nhất từ Truyền hình Thanh Hóa
              </p>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={fetchNews}
              disabled={loading}
              className="self-start md:self-auto glass px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg 
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm">Làm mới</span>
            </button>
          </div>
          
          {/* Last Updated */}
          {lastUpdated && !loading && (
            <div className="mb-4 text-white/40 text-xs">
              Cập nhật lần cuối: {formatLastUpdated()}
            </div>
          )}

          {/* News Content */}
          <div className="glass-strong rounded-3xl p-6 border border-white/20 shadow-2xl shadow-black/20">
            {loading && (
              <div className="py-12 text-center">
                <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <p className="text-white/50 mt-4">Đang tải tin tức...</p>
              </div>
            )}

            {error && (
              <div className="py-12 text-center">
                <p className="text-red-400">{error}</p>
                <button
                  onClick={fetchNews}
                  className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            )}

            {!loading && !error && news.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-white/50">Không có tin tức mới</p>
              </div>
            )}

            {!loading && !error && news.length > 0 && (
              <div className="space-y-4">
                {news.map((item, index) => (
                  <a
                    key={index}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
                  >
                    <h2 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {item.title}
                    </h2>
                    {item.snippet && (
                      <p className="text-white/60 text-sm mt-2 line-clamp-2">
                        {item.snippet.replace(/<[^>]*>/g, '').substring(0, 200)}...
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3 text-white/40 text-xs">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatDate(item.pubDate)}</span>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Footer Link */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <a 
                href="https://truyenhinhthanhhoa.vn" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>Xem thêm tại Truyền hình Thanh Hóa</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
