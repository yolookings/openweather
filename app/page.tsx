'use client'

import { useState, useEffect } from 'react'

interface WeatherData {
  name: string
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
  dt: number
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    humidity: number
    pressure: number
  }
  wind: {
    speed: number
    gust?: number
    deg: number
  }
  visibility: number
  rain?: {
    '1h': number
  }
  snow?: {
    '1h': number
  }
}

export default function Home() {
  const [searchInput, setSearchInput] = useState('')
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCelsius, setIsCelsius] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState('')

  // Load dark mode preference on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setIsDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Fetch city image from Unsplash
  const fetchCityImage = async (cityName: string) => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(cityName + ' city landscape')}&per_page=1&order_by=relevant&client_id=D8P4OQQJ_kzOBLfVhMi_MXuIHD_GzEhNLMVy1CMfHGg`
      )
      if (response.ok) {
        const data = await response.json()
        if (data.results && data.results[0]) {
          setBackgroundImage(data.results[0].urls.regular)
        }
      }
    } catch (err) {
      console.log('[v0] Could not fetch city image:', err)
    }
  }

  // Update weather background based on conditions
  const updateWeatherBackground = (weatherMain: string) => {
    const weatherLower = weatherMain.toLowerCase()
    document.body.className = isDarkMode ? 'dark' : ''

    if (weatherLower.includes('clear') || weatherLower.includes('sunny')) {
      document.body.className += ' weather-sunny'
    } else if (weatherLower.includes('cloud')) {
      document.body.className += ' weather-cloudy'
    } else if (weatherLower.includes('rain')) {
      document.body.className += ' weather-rainy'
    } else if (weatherLower.includes('snow')) {
      document.body.className += ' weather-snowy'
    }
  }

  // Fetch weather data from API route
  const fetchWeather = async (query: string | { lat: number; lon: number }) => {
    setLoading(true)
    setError('')

    try {
      // Validate input
      if (typeof query === 'string' && query.trim() === '') {
        setError('Please enter a city name')
        setLoading(false)
        return
      }

      // Call Next.js API route
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(typeof query === 'string' ? { city: query } : { ...query }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch weather data')
        setLoading(false)
        return
      }

      const data: WeatherData = await response.json()
      setWeatherData(data)
      fetchCityImage(data.name)
      updateWeatherBackground(data.weather[0].main)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = () => {
    if (searchInput.trim()) {
      fetchWeather(searchInput.trim())
      setSearchInput('')
    }
  }

  // Handle geolocation
  const handleGeolocation = () => {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        (error) => {
          setError(`Geolocation error: ${error.message}`)
          setLoading(false)
        }
      )
    } else {
      setError('Geolocation is not supported by your browser')
    }
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    if (weatherData) {
      updateWeatherBackground(weatherData.weather[0].main)
    }
  }

  // Utility functions
  const formatTime = (unixTime: number) => {
    const date = new Date(unixTime * 1000)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDateTime = (unixTime: number) => {
    const date = new Date(unixTime * 1000)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const celsiusToFahrenheit = (celsius: number) => Math.round((celsius * 9) / 5 + 32)

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    const index = Math.round((degrees % 360) / 22.5) % 16
    return directions[index]
  }

  const getTemperature = (temp: number) => (isCelsius ? Math.round(temp) : celsiusToFahrenheit(temp))
  const unitSymbol = isCelsius ? '°C' : '°F'

  return (
    <div 
      className="min-h-screen transition-all duration-500"
      style={{
        backgroundImage: backgroundImage ? `linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.3) 100%), url('${backgroundImage}')` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: backgroundImage ? 'transparent' : '#667eea',
      }}
    >
      <style>{`
        ${!backgroundImage ? `
          body.weather-sunny {
            background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
          }
          body.weather-rainy {
            background: linear-gradient(135deg, #64748b 0%, #475569 100%);
          }
          body.weather-cloudy {
            background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
          }
          body.weather-snowy {
            background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
          }
          body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            background-attachment: fixed;
          }
        ` : ''}
      `}</style>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <header className="text-center mb-12 text-white drop-shadow-lg">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Weather Tracker</h1>
          <p className="text-lg md:text-xl opacity-95">Get weather information for any location</p>
        </header>

        {/* Search Section */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3 flex-1 min-w-[250px]">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter city name..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all hover:-translate-y-0.5 shadow-md"
            >
              Search
            </button>
            <button
              onClick={handleGeolocation}
              className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all"
              title="Use current location"
            >
              📍
            </button>
          </div>

          {/* Temperature Units Toggle */}
          <div className="flex gap-2 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
            <button
              onClick={() => setIsCelsius(true)}
              className={`px-4 py-2 rounded-md font-semibold transition-all ${
                isCelsius ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setIsCelsius(false)}
              className={`px-4 py-2 rounded-md font-semibold transition-all ${
                !isCelsius ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              °F
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="px-4 py-3 bg-gray-100 dark:bg-slate-700 rounded-lg hover:scale-110 transition-transform text-xl"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </section>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6 border-l-4 border-red-500 animate-slideIn">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-16 animate-slideIn">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-white text-lg font-semibold">Loading weather data...</p>
            </div>
          </div>
        )}

        {/* Weather Container */}
        {weatherData && !loading && (
          <div className="animate-slideIn">
            {/* Location Header */}
            <div className="text-center mb-8 text-white drop-shadow-lg">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                {weatherData.name}, {weatherData.sys.country}
              </h2>
              <p className="text-sm md:text-base opacity-90">Updated: {formatDateTime(weatherData.dt)}</p>
            </div>

            {/* Main Weather Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl flex flex-wrap gap-8 items-center justify-center">
              <div className="flex items-center gap-6">
                <img
                  src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`}
                  alt={weatherData.weather[0].description}
                  className="w-24 md:w-32 h-24 md:h-32 drop-shadow-lg animate-float"
                />
                <div className="flex items-start">
                  <span className="text-6xl md:text-7xl font-bold text-blue-500">{getTemperature(weatherData.main.temp)}</span>
                  <span className="text-3xl text-gray-500 dark:text-gray-400 ml-2 mt-2">{unitSymbol}</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white capitalize mb-2">
                  {weatherData.weather[0].description}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Feels like {getTemperature(weatherData.main.feels_like)}{unitSymbol}
                </p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Temperature Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 md:p-6 shadow-lg hover:-translate-y-1 transition-all">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-3 border-b-2 border-blue-500 pb-2">
                  🌡️ Temperature
                </h3>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p>
                    <span className="font-semibold text-gray-900 dark:text-white">High:</span> {getTemperature(weatherData.main.temp_max)}°
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900 dark:text-white">Low:</span> {getTemperature(weatherData.main.temp_min)}°
                  </p>
                </div>
              </div>

              {/* Wind Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 md:p-6 shadow-lg hover:-translate-y-1 transition-all">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-3 border-b-2 border-blue-500 pb-2">
                  💨 Wind
                </h3>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p>
                    <span className="font-semibold text-gray-900 dark:text-white">Speed:</span> {(weatherData.wind.speed * 3.6).toFixed(1)} km/h
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900 dark:text-white">Gusts:</span> {weatherData.wind.gust ? (weatherData.wind.gust * 3.6).toFixed(1) : 'N/A'} km/h
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900 dark:text-white">Direction:</span> {weatherData.wind.deg}° ({getWindDirection(weatherData.wind.deg)})
                  </p>
                </div>
              </div>

              {/* Humidity Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 md:p-6 shadow-lg hover:-translate-y-1 transition-all">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-3 border-b-2 border-blue-500 pb-2">
                  💧 Humidity
                </h3>
                <p className="text-4xl font-bold text-blue-500 mb-3">{weatherData.main.humidity}%</p>
                <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                    style={{ width: `${weatherData.main.humidity}%` }}
                  ></div>
                </div>
              </div>

              {/* Pressure Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 md:p-6 shadow-lg hover:-translate-y-1 transition-all">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-3 border-b-2 border-blue-500 pb-2">
                  🔽 Pressure
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{weatherData.main.pressure} hPa</p>
              </div>

              {/* Visibility Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 md:p-6 shadow-lg hover:-translate-y-1 transition-all">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-3 border-b-2 border-blue-500 pb-2">
                  👁️ Visibility
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{(weatherData.visibility / 1000).toFixed(1)} km</p>
              </div>

              {/* Precipitation Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 md:p-6 shadow-lg hover:-translate-y-1 transition-all">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-3 border-b-2 border-blue-500 pb-2">
                  🌧️ Precipitation
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {weatherData.rain && weatherData.rain['1h'] ? `Rain: ${weatherData.rain['1h']} mm` : ''}
                  {weatherData.snow && weatherData.snow['1h'] ? `${weatherData.rain ? ' | ' : ''}Snow: ${weatherData.snow['1h']} mm` : ''}
                  {!weatherData.rain && !weatherData.snow ? 'No precipitation' : ''}
                </p>
              </div>

              {/* Sunrise Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 md:p-6 shadow-lg hover:-translate-y-1 transition-all">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-3 border-b-2 border-blue-500 pb-2">
                  🌅 Sunrise
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(weatherData.sys.sunrise)}</p>
              </div>

              {/* Sunset Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 md:p-6 shadow-lg hover:-translate-y-1 transition-all">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-3 border-b-2 border-blue-500 pb-2">
                  🌇 Sunset
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(weatherData.sys.sunset)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!weatherData && !loading && !error && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-2xl">
            <p className="text-xl text-gray-600 dark:text-gray-400">Search for a city to see the weather</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
