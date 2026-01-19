import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.OPENWEATHER_API_KEY
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

export async function POST(request: NextRequest) {
  // Validate API Key
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'API Key is not configured on the server. Please check environment variables.' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { city, lat, lon } = body

    // Validate input
    if (!city && (!lat || !lon)) {
      return NextResponse.json(
        { error: 'Please provide either a city name or coordinates' },
        { status: 400 }
      )
    }

    let url: string

    if (city) {
      // Search by city name
      url = `${API_BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=en`
    } else {
      // Search by coordinates
      url = `${API_BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=en`
    }

    // Fetch from OpenWeather API
    const response = await fetch(url)

    // Handle API errors
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'City not found. Please try another search.' },
          { status: 404 }
        )
      }
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'API Key invalid. Please check your API key.' },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { error: `API Error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch weather data',
      },
      { status: 500 }
    )
  }
}
