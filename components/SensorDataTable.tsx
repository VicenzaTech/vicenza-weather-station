'use client'

import { useMemo, useState, useEffect } from 'react'

interface SensorReading {
  id: string | number
  temp_room: number
  hum_room: number
  temp_out: number
  lux: number
  ldr_raw: number
  timestamp: number
  created_at: string
}

interface SensorDataTableProps {
  data: SensorReading[]
  isLoading?: boolean
}

export default function SensorDataTable({ data, isLoading: isLoadingProp }: SensorDataTableProps) {
  const [internalData, setInternalData] = useState<SensorReading[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Use provided data if available, otherwise use internal state
  const displayData = (data && data.length > 0) ? data : internalData

  // Debug: Log received data
  useEffect(() => {
    console.log('[SensorDataTable] Received data:', data?.length || 0, 'items')
    if (data && data.length > 0) {
      console.log('[SensorDataTable] First item:', data[0])
    }
  }, [data])

  // Fetch data from API if no data provided (only once on mount)
  useEffect(() => {
    // Only fetch if no data provided
    if (!data || data.length === 0) {
      const fetchData = async () => {
        setIsLoading(true)
        try {
          console.log('[SensorDataTable] Fetching data from API...')
          const response = await fetch('/api/sensor-history?hours=24&limit=50')
          const result = await response.json()
          
          if (result.data && Array.isArray(result.data)) {
            console.log('[SensorDataTable] Fetched', result.data.length, 'items from API')
            // Limit to 50 most recent items (already limited by API, but ensure)
            const limitedData = result.data.slice(0, 50)
            setInternalData(limitedData)
          } else {
            console.warn('[SensorDataTable] Invalid API response:', result)
            setInternalData([])
          }
        } catch (error) {
          console.error('[SensorDataTable] Error fetching data:', error)
          setInternalData([])
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchData()
    }
  }, []) // Only run once on mount - check data prop at mount time

  const [sortField, setSortField] = useState<keyof SensorReading | null>('timestamp')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  const sortedData = useMemo(() => {
    if (!displayData || displayData.length === 0) return []
    if (!sortField) return displayData
    return [...displayData].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [displayData, sortField, sortDirection])

  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    return sortedData.slice(start, start + itemsPerPage)
  }, [sortedData, page])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const handleSort = (field: keyof SensorReading) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const SortIcon = ({ field }: { field: keyof SensorReading }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
        </svg>
      )
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/>
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
      </svg>
    )
  }

  // Use isLoading prop if provided, otherwise use internal loading state
  const isCurrentlyLoading = isLoadingProp !== undefined ? isLoadingProp : isLoading

  if (isCurrentlyLoading) {
    return (
      <div className="glass-strong rounded-2xl p-6 border border-white/15 shadow-lg shadow-slate-900/40 min-h-[400px] flex items-center justify-center">
        <div className="text-white/50 animate-pulse">Đang tải dữ liệu...</div>
      </div>
    )
  }

  if (!displayData || displayData.length === 0) {
    return (
      <div className="glass-strong rounded-2xl p-6 border border-white/15 shadow-lg shadow-slate-900/40">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h18v18H3zM3 9h18M9 3v18"/>
              </svg>
            </div>
            <h3 className="text-white text-lg font-semibold">Bảng dữ liệu cảm biến</h3>
          </div>
        </div>
        <div className="text-center py-12 text-white/50">
          <svg viewBox="0 0 24 24" className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3h18v18H3zM3 9h18M9 3v18"/>
          </svg>
          <p className="text-lg mb-2">Chưa có dữ liệu</p>
          <p className="text-sm">Đang chờ dữ liệu từ cảm biến...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/15 shadow-lg shadow-slate-900/40">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h18v18H3zM3 9h18M9 3v18"/>
            </svg>
          </div>
          <h3 className="text-white text-lg font-semibold">Bảng dữ liệu cảm biến</h3>
        </div>
        <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">
          <span className="text-white/60 text-xs">
            Tổng: {displayData.length} bản ghi
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th
                className="text-left py-3 px-4 text-white/70 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center gap-2">
                  Thời gian
                  <SortIcon field="timestamp" />
                </div>
              </th>
              <th
                className="text-left py-3 px-4 text-white/70 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('temp_room')}
              >
                <div className="flex items-center gap-2">
                  Nhiệt độ phòng (°C)
                  <SortIcon field="temp_room" />
                </div>
              </th>
              <th
                className="text-left py-3 px-4 text-white/70 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('hum_room')}
              >
                <div className="flex items-center gap-2">
                  Độ ẩm phòng (%)
                  <SortIcon field="hum_room" />
                </div>
              </th>
              <th
                className="text-left py-3 px-4 text-white/70 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('temp_out')}
              >
                <div className="flex items-center gap-2">
                  Nhiệt độ ngoài (°C)
                  <SortIcon field="temp_out" />
                </div>
              </th>
              <th
                className="text-left py-3 px-4 text-white/70 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('lux')}
              >
                <div className="flex items-center gap-2">
                  Ánh sáng (lux)
                  <SortIcon field="lux" />
                </div>
              </th>
              <th
                className="text-left py-3 px-4 text-white/70 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('ldr_raw')}
              >
                <div className="flex items-center gap-2">
                  LDR Raw
                  <SortIcon field="ldr_raw" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-white/50">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4 text-white/90 text-sm">
                    {formatTime(row.timestamp)}
                  </td>
                  <td className="py-3 px-4 text-white/90 text-sm font-medium">
                    <span className="text-red-400">{row.temp_room.toFixed(1)}</span>
                  </td>
                  <td className="py-3 px-4 text-white/90 text-sm font-medium">
                    <span className="text-blue-400">{row.hum_room.toFixed(1)}</span>
                  </td>
                  <td className="py-3 px-4 text-white/90 text-sm font-medium">
                    <span className="text-orange-400">{row.temp_out.toFixed(1)}</span>
                  </td>
                  <td className="py-3 px-4 text-white/90 text-sm font-medium">
                    <span className="text-yellow-400">{row.lux.toFixed(1)}</span>
                  </td>
                  <td className="py-3 px-4 text-white/90 text-sm font-medium">
                    <span className="text-purple-400">{row.ldr_raw}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Trước
          </button>
          <div className="text-white/70 text-sm">
            Trang {page} / {totalPages}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  )
}

