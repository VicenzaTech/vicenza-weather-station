import { getSensorReadings } from '@/lib/db'
import HomeClient from '@/components/HomeClient'

interface HistoryDataItem {
  id: string | number
  temp_room: number
  hum_room: number
  temp_out: number
  lux: number
  ldr_raw: number
  timestamp: number
  created_at: string
}

export default async function Home() {
  // Fetch initial history data from MongoDB on server
  let initialHistoryData: HistoryDataItem[] = []
  
  try {
    const to = new Date()
    const from = new Date(to.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours
    const limit = 200
    
    const readings = await getSensorReadings(from, to, limit)
    
    // Transform to the format expected by the client
    initialHistoryData = readings.map((r) => ({
      id: r.id,
      temp_room: r.tempRoom,
      hum_room: r.humRoom,
      temp_out: r.tempOut,
      lux: r.lux,
      ldr_raw: r.ldrRaw,
      timestamp: r.timestamp instanceof Date 
        ? Math.floor(r.timestamp.getTime() / 1000)
        : typeof r.timestamp === 'number' 
          ? Math.floor(r.timestamp / 1000)
          : 0,
      created_at: r.createdAt instanceof Date 
        ? r.createdAt.toISOString()
        : new Date(r.createdAt).toISOString(),
    }))
    
    console.log(`[Server] Loaded ${initialHistoryData.length} history items from MongoDB`)
  } catch (error) {
    console.error('[Server] Error loading initial history data:', error)
    // Continue with empty array if there's an error
  }

  return <HomeClient initialHistoryData={initialHistoryData} />
}

