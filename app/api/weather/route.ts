import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // In a real application, you would fetch from a weather API like OpenWeatherMap
    // For now, we'll return mock data that matches the design
    
    // Example with OpenWeatherMap API (uncomment and add your API key):
    /*
    const API_KEY = process.env.WEATHER_API_KEY
    const CITY = 'New York'
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`
    )
    const data = await response.json()
    */

    // Mock data for demonstration
    const mockData = {
      current: {
        temp: 22,
        condition: 'Thunderstorms',
        description: 'Heavy rain, strong winds, and occasional lightning expected. Sudden downpours may lead to localized flooding in some areas.',
        windSpeed: 7.90,
        location: 'New York',
        uvIndex: 5
      },
      wind: {
        speed: 7.90,
        gusts: [8, 9, 7, 10, 8, 9, 11],
        history: [6, 7, 8, 7, 9, 8, 7, 8, 9, 7, 8]
      },
      sun: {
        sunrise: '06:30',
        sunset: '19:45',
        currentTime: new Date().toLocaleTimeString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      },
      forecast: [
        { day: 'Monday', temp: 26, icon: 'cloud' },
        { day: 'Tuesday', temp: 28, icon: 'cloud' },
        { day: 'Wednesday', temp: 24, icon: 'storm' },
        { day: 'Thursday', temp: 26, icon: 'cloud' },
        { day: 'Friday', temp: 23, icon: 'cloud' },
        { day: 'Saturday', temp: 26, icon: 'cloud' },
        { day: 'Sunday', temp: 27, icon: 'sun-cloud' }
      ]
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error('Error fetching weather data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}

