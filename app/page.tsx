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
    const limit = 50 // Load 50 most recent items
    
    console.log(`[Server] Fetching sensor readings from ${from.toISOString()} to ${to.toISOString()}, limit: ${limit}`)
    
    const readings = await getSensorReadings(from, to, limit)
    
    console.log(`[Server] Raw readings from database:`, readings.length, 'items')
    if (readings.length > 0) {
      console.log(`[Server] First reading sample:`, JSON.stringify(readings[0], null, 2))
    }
    
    // Transform to the format expected by the client
    initialHistoryData = readings.map((r) => {
      const item = {
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
      }
      return item
    })
    
    console.log(`[Server] Transformed ${initialHistoryData.length} history items from MongoDB`)
    if (initialHistoryData.length > 0) {
      console.log(`[Server] First transformed item:`, JSON.stringify(initialHistoryData[0], null, 2))
    }
  } catch (error) {
    console.error('[Server] Error loading initial history data:', error)
    if (error instanceof Error) {
      console.error('[Server] Error stack:', error.stack)
    }
    // Continue with empty array if there's an error
  }

  return <HomeClient initialHistoryData={initialHistoryData} />
}

