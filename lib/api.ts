// Mock API functions for air quality data
export interface AQIData {
  city: string
  pm25: number
  pm10: number
  aqi: number
  category: "Good" | "Moderate" | "Unhealthy for Sensitive Groups" | "Unhealthy" | "Very Unhealthy" | "Hazardous"
  healthAdvice: string
  coordinates: [number, number]
}

export interface ForecastData {
  date: string
  aqi: number
}

export async function fetchAQIData(city: string): Promise<AQIData> {
  // Mock API call - replace with actual API endpoint
  const mockResponse = await fetch(`/api/aqi?city=${city}`).catch(() => null)

  // Mock data for demonstration
  const mockData: Record<string, AQIData> = {
    Delhi: {
      city: "Delhi",
      pm25: 89,
      pm10: 156,
      aqi: 167,
      category: "Unhealthy",
      healthAdvice: "Wear a mask when outdoors. Limit outdoor activities.",
      coordinates: [28.6139, 77.209],
    },
    Mumbai: {
      city: "Mumbai",
      pm25: 45,
      pm10: 78,
      aqi: 89,
      category: "Moderate",
      healthAdvice: "Air quality is acceptable for most people.",
      coordinates: [19.076, 72.8777],
    },
    Bangalore: {
      city: "Bangalore",
      pm25: 32,
      pm10: 58,
      aqi: 65,
      category: "Moderate",
      healthAdvice: "Air quality is acceptable for most people.",
      coordinates: [12.9716, 77.5946],
    },
  }

  return (
    mockData[city] || {
      city,
      pm25: 25,
      pm10: 45,
      aqi: 55,
      category: "Good",
      healthAdvice: "Air quality is good. Perfect for outdoor activities.",
      coordinates: [20.5937, 78.9629],
    }
  )
}

export async function fetchForecastData(city: string): Promise<ForecastData[]> {
  // Mock API call - replace with actual API endpoint
  const mockResponse = await fetch(`/api/forecast?city=${city}`).catch(() => null)

  // Generate mock forecast data for the last 7 days and next 3 days
  const data: ForecastData[] = []
  const today = new Date()

  // Historical data (last 7 days)
  for (let i = 7; i >= 1; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split("T")[0],
      aqi: Math.floor(Math.random() * 100) + 50,
    })
  }

  // Today
  data.push({
    date: today.toISOString().split("T")[0],
    aqi: Math.floor(Math.random() * 100) + 50,
  })

  // Forecast (next 3 days)
  for (let i = 1; i <= 3; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    data.push({
      date: date.toISOString().split("T")[0],
      aqi: Math.floor(Math.random() * 100) + 50,
    })
  }

  return data
}
