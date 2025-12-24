import { NextResponse } from 'next/server'

// Hàm dịch điều kiện thời tiết sang tiếng Việt
function translateWeatherCondition(condition: string, description: string): { condition: string; description: string } {
  const conditionMap: { [key: string]: string } = {
    'Thunderstorm': 'Dông bão',
    'Drizzle': 'Mưa phùn',
    'Rain': 'Mưa',
    'Snow': 'Tuyết',
    'Mist': 'Sương mù',
    'Smoke': 'Khói',
    'Haze': 'Sương mù nhẹ',
    'Dust': 'Bụi',
    'Fog': 'Sương mù',
    'Sand': 'Cát',
    'Ash': 'Tro',
    'Squall': 'Giông tố',
    'Tornado': 'Lốc xoáy',
    'Clear': 'Trời quang',
    'Clouds': 'Có mây'
  }

  const descriptionMap: { [key: string]: string } = {
    'thunderstorm with light rain': 'Dông bão kèm mưa nhẹ. Có thể có sét và gió mạnh.',
    'thunderstorm with rain': 'Dông bão kèm mưa. Sét và gió mạnh có thể xảy ra.',
    'thunderstorm with heavy rain': 'Dông bão kèm mưa lớn. Mưa đột ngột có thể gây ngập lụt cục bộ ở một số khu vực.',
    'light thunderstorm': 'Dông bão nhẹ. Có thể có sét và gió mạnh.',
    'thunderstorm': 'Dông bão. Mưa lớn, gió mạnh và sét thỉnh thoảng. Mưa đột ngột có thể dẫn đến ngập lụt cục bộ ở một số khu vực.',
    'heavy thunderstorm': 'Dông bão dữ dội. Mưa rất lớn, gió rất mạnh và sét thường xuyên. Cảnh báo ngập lụt.',
    'ragged thunderstorm': 'Dông bão không đều. Mưa và sét có thể xảy ra rải rác.',
    'thunderstorm with drizzle': 'Dông bão kèm mưa phùn.',
    'thunderstorm with heavy drizzle': 'Dông bão kèm mưa phùn lớn.',
    'light intensity drizzle': 'Mưa phùn nhẹ.',
    'drizzle': 'Mưa phùn. Mưa nhẹ và liên tục.',
    'heavy intensity drizzle': 'Mưa phùn lớn.',
    'light intensity drizzle rain': 'Mưa phùn nhẹ.',
    'drizzle rain': 'Mưa phùn.',
    'heavy intensity drizzle rain': 'Mưa phùn lớn.',
    'shower rain and drizzle': 'Mưa rào và mưa phùn.',
    'heavy shower rain and drizzle': 'Mưa rào lớn và mưa phùn.',
    'shower drizzle': 'Mưa phùn rào.',
    'light rain': 'Mưa nhẹ.',
    'moderate rain': 'Mưa vừa. Mưa ổn định và liên tục.',
    'heavy intensity rain': 'Mưa lớn. Có thể gây ngập lụt ở một số khu vực.',
    'very heavy rain': 'Mưa rất lớn. Cảnh báo ngập lụt và lũ quét.',
    'extreme rain': 'Mưa cực lớn. Cảnh báo nguy hiểm.',
    'freezing rain': 'Mưa đóng băng. Cẩn thận khi đi lại.',
    'light intensity shower rain': 'Mưa rào nhẹ.',
    'shower rain': 'Mưa rào. Mưa ngắn và có thể mạnh.',
    'heavy intensity shower rain': 'Mưa rào lớn.',
    'ragged shower rain': 'Mưa rào không đều.',
    'light snow': 'Tuyết nhẹ.',
    'snow': 'Tuyết. Tuyết rơi ổn định.',
    'heavy snow': 'Tuyết lớn. Tuyết rơi dày đặc.',
    'sleet': 'Mưa tuyết. Mưa và tuyết kết hợp.',
    'light shower sleet': 'Mưa tuyết rào nhẹ.',
    'shower sleet': 'Mưa tuyết rào.',
    'light rain and snow': 'Mưa và tuyết nhẹ.',
    'rain and snow': 'Mưa và tuyết.',
    'light shower snow': 'Tuyết rào nhẹ.',
    'shower snow': 'Tuyết rào.',
    'heavy shower snow': 'Tuyết rào lớn.',
    'mist': 'Sương mù. Tầm nhìn có thể bị hạn chế.',
    'smoke': 'Khói. Chất lượng không khí kém.',
    'haze': 'Sương mù nhẹ. Tầm nhìn hơi bị hạn chế.',
    'sand/ dust whirls': 'Lốc cát/bụi.',
    'fog': 'Sương mù dày. Tầm nhìn rất hạn chế.',
    'sand': 'Bão cát.',
    'dust': 'Bụi. Chất lượng không khí kém.',
    'volcanic ash': 'Tro núi lửa.',
    'squalls': 'Giông tố. Gió mạnh đột ngột.',
    'tornado': 'Lốc xoáy. Cảnh báo nguy hiểm.',
    'clear sky': 'Trời quang đãng. Nắng đẹp.',
    'few clouds': 'Ít mây. Trời chủ yếu quang.',
    'scattered clouds': 'Mây rải rác. Trời có mây một phần.',
    'broken clouds': 'Mây thưa. Trời có mây nhiều.',
    'overcast clouds': 'Mây đen. Trời nhiều mây.'
  }

  const translatedCondition = conditionMap[condition] || condition
  const translatedDescription = descriptionMap[description.toLowerCase()] || 
    'Điều kiện thời tiết bình thường. Hãy theo dõi cập nhật thường xuyên.'

  return { condition: translatedCondition, description: translatedDescription }
}

// Hàm chuyển đổi mã thời tiết thành icon
function getWeatherIcon(weatherId: number): string {
  if (weatherId >= 200 && weatherId < 300) return 'storm' // Thunderstorm
  if (weatherId >= 300 && weatherId < 400) return 'cloud' // Drizzle
  if (weatherId >= 500 && weatherId < 600) return 'cloud' // Rain
  if (weatherId >= 600 && weatherId < 700) return 'cloud' // Snow
  if (weatherId >= 700 && weatherId < 800) return 'cloud' // Atmosphere
  if (weatherId === 800) return 'sun-cloud' // Clear
  if (weatherId > 800) return 'cloud' // Clouds
  return 'cloud'
}

// Hàm chuyển đổi tên ngày sang tiếng Việt
function getVietnameseDayName(dayIndex: number): string {
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
  return days[dayIndex]
}

export async function GET() {
  try {
    const API_KEY = process.env.WEATHER_API_KEY
    const CITY = 'Thanh Hoa,VN' // Thanh Hoa, Vietnam
    const LAT = 19.8067 // Latitude của Thanh Hoa
    const LON = 105.7852 // Longitude của Thanh Hoa

    // Nếu có API key, lấy dữ liệu thực tế
    if (API_KEY) {
      // Lấy dữ liệu thời tiết hiện tại
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=vi`
      )
      
      if (!currentResponse.ok) {
        throw new Error('Failed to fetch current weather')
      }
      
      const currentData = await currentResponse.json()

      // Lấy dữ liệu dự báo 7 ngày
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=vi`
      )
      
      if (!forecastResponse.ok) {
        throw new Error('Failed to fetch forecast')
      }
      
      const forecastData = await forecastResponse.json()

      // Chuyển đổi thời gian sunrise/sunset
      const sunrise = new Date(currentData.sys.sunrise * 1000)
      const sunset = new Date(currentData.sys.sunset * 1000)
      
      const sunriseStr = sunrise.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      })
      const sunsetStr = sunset.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      })

      // Dịch điều kiện thời tiết
      const weatherMain = currentData.weather[0].main
      const weatherDescription = currentData.weather[0].description
      const translated = translateWeatherCondition(weatherMain, weatherDescription)

      // Tạo dữ liệu gió (sử dụng dữ liệu thực tế và tạo dữ liệu mẫu cho biểu đồ)
      const windSpeed = currentData.wind?.speed ? currentData.wind.speed * 3.6 : 0 // m/s to km/h
      const gusts = Array.from({ length: 7 }, () => windSpeed + (Math.random() * 2 - 1))
      const history = Array.from({ length: 11 }, () => windSpeed + (Math.random() * 2 - 1))

      // Tạo dự báo 7 ngày từ dữ liệu API
      const forecastList = forecastData.list || []
      const dailyForecast: Array<{ day: string; temp: number; icon: string }> = []
      
      // Lấy dữ liệu cho mỗi ngày (mỗi 24 giờ)
      for (let i = 0; i < 7 && i * 8 < forecastList.length; i++) {
        const dayData = forecastList[i * 8] || forecastList[forecastList.length - 1]
        const date = new Date(dayData.dt * 1000)
        const dayName = getVietnameseDayName(date.getDay())
        const icon = getWeatherIcon(dayData.weather[0].id)
        
        dailyForecast.push({
          day: dayName,
          temp: Math.round(dayData.main.temp),
          icon: icon
        })
      }

      // Nếu không đủ 7 ngày, lặp lại dữ liệu
      while (dailyForecast.length < 7) {
        const lastDay = dailyForecast[dailyForecast.length - 1]
        const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
        const lastDayIndex = days.indexOf(lastDay.day)
        const nextDayIndex = (lastDayIndex + 1) % 7
        dailyForecast.push({
          day: days[nextDayIndex],
          temp: Math.round(lastDay.temp + (Math.random() * 4 - 2)),
          icon: lastDay.icon
        })
      }

      const weatherData = {
        current: {
          temp: Math.round(currentData.main.temp),
          feels_like: Math.round(currentData.main.feels_like),
          temp_min: Math.round(currentData.main.temp_min),
          temp_max: Math.round(currentData.main.temp_max),
          pressure: currentData.main.pressure,
          condition: translated.condition,
          weatherMain: weatherMain,
          description: translated.description,
          windSpeed: Math.round(windSpeed * 100) / 100,
          windDirection: currentData.wind.deg,
          clouds: currentData.clouds.all,
          visibility: currentData.visibility,
          location: 'Trạm VICENZA',
          uvIndex: Math.round((currentData.uvi || 5) * 10) / 10,
          humidity: currentData.main.humidity
        },
        wind: {
          speed: Math.round(windSpeed * 100) / 100,
          direction: currentData.wind.deg,
          gusts: gusts.map(g => Math.round(g * 100) / 100),
          history: history.map(h => Math.round(h * 100) / 100)
        },
        sun: {
          sunrise: sunriseStr,
          sunset: sunsetStr,
          currentTime: new Date().toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
          })
        },
        forecast: dailyForecast
      }

      return NextResponse.json(weatherData)
    }

    // Fallback: Dữ liệu mẫu với tiếng Việt nếu không có API key
    const fallbackData = {
      current: {
        temp: 22,
        feels_like: 24,
        temp_min: 20,
        temp_max: 25,
        pressure: 1012,
        condition: 'Dông bão',
        weatherMain: 'Thunderstorm',
        description: 'Mưa lớn, gió mạnh và sét thỉnh thoảng. Mưa đột ngột có thể dẫn đến ngập lụt cục bộ ở một số khu vực.',
        windSpeed: 7.90,
        windDirection: 140,
        clouds: 85,
        visibility: 8000,
        location: 'Trạm VICENZA',
        uvIndex: 5,
        humidity: 75
      },
      wind: {
        speed: 7.90,
        direction: 140,
        gusts: [8, 9, 7, 10, 8, 9, 11],
        history: [6, 7, 8, 7, 9, 8, 7, 8, 9, 7, 8]
      },
      sun: {
        sunrise: '06:30',
        sunset: '19:45',
        currentTime: new Date().toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        })
      },
      forecast: [
        { day: 'Thứ hai', temp: 26, icon: 'cloud' },
        { day: 'Thứ ba', temp: 28, icon: 'cloud' },
        { day: 'Thứ tư', temp: 24, icon: 'storm' },
        { day: 'Thứ năm', temp: 26, icon: 'cloud' },
        { day: 'Thứ sáu', temp: 23, icon: 'cloud' },
        { day: 'Thứ bảy', temp: 26, icon: 'cloud' },
        { day: 'Chủ nhật', temp: 27, icon: 'sun-cloud' }
      ]
    }

    return NextResponse.json(fallbackData)
  } catch (error) {
    console.error('Error fetching weather data:', error)
    // Trả về dữ liệu mẫu nếu có lỗi
    const errorFallback = {
      current: {
        temp: 22,
        feels_like: 24,
        temp_min: 20,
        temp_max: 25,
        pressure: 1012,
        condition: 'Dông bão',
        weatherMain: 'Thunderstorm',
        description: 'Mưa lớn, gió mạnh và sét thỉnh thoảng. Mưa đột ngột có thể dẫn đến ngập lụt cục bộ ở một số khu vực.',
        windSpeed: 7.90,
        windDirection: 140,
        clouds: 85,
        visibility: 8000,
        location: 'Trạm VICENZA',
        uvIndex: 5,
        humidity: 75
      },
      wind: {
        speed: 7.90,
        direction: 140,
        gusts: [8, 9, 7, 10, 8, 9, 11],
        history: [6, 7, 8, 7, 9, 8, 7, 8, 9, 7, 8]
      },
      sun: {
        sunrise: '06:30',
        sunset: '19:45',
        currentTime: new Date().toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        })
      },
      forecast: [
        { day: 'Thứ hai', temp: 26, icon: 'cloud' },
        { day: 'Thứ ba', temp: 28, icon: 'cloud' },
        { day: 'Thứ tư', temp: 24, icon: 'storm' },
        { day: 'Thứ năm', temp: 26, icon: 'cloud' },
        { day: 'Thứ sáu', temp: 23, icon: 'cloud' },
        { day: 'Thứ bảy', temp: 26, icon: 'cloud' },
        { day: 'Chủ nhật', temp: 27, icon: 'sun-cloud' }
      ]
    }
    return NextResponse.json(errorFallback)
  }
}

