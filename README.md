# Weather Tracker - Next.js Edition

A modern, responsive weather tracking website built with **Next.js 16** and **React 19**. Get real-time weather information for any location worldwide with a beautiful, intuitive interface.

## Features

- **Search by City** - Find weather for any city in the world
- **Geolocation** - Auto-detect your location with the 📍 button
- **Real-time Weather Data** - Temperature, feels like, min/max, wind, humidity, pressure, visibility, precipitation, sunrise/sunset
- **Temperature Units** - Toggle between Celsius and Fahrenheit
- **Dark Mode** - Switch between light and dark themes (persisted in browser)
- **City Background Images** - Beautiful, high-quality images of each city you search (powered by Unsplash)
- **Dynamic Backgrounds** - City images with elegant overlays that enhance the visual experience
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Secure API Key** - API key is kept on the server-side, never exposed to the client
- **Error Handling** - Comprehensive error handling for all scenarios
- **Smooth Animations** - Loading spinners, floating icons, and smooth transitions

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **API**: OpenWeather API (server-side proxy)
- **Language**: TypeScript

## Project Structure

```
weather-tracker/
├── app/
│   ├── api/
│   │   └── weather/
│   │       └── route.ts          # Server-side API route (handles OpenWeather API)
│   ├── page.tsx                  # Main weather app component
│   ├── layout.tsx                # Root layout with metadata
│   └── globals.css               # Global styles
├── public/                        # Static assets
├── .env.example                   # Environment variable template
├── .env.local                     # Your API keys (DO NOT commit this!)
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── next.config.mjs               # Next.js config
└── README.md                      # This file
```

## Prerequisites

Before you begin, make sure you have:

- **Node.js** 18+ installed ([Download Node.js](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** (for version control and GitHub)
- A free **OpenWeather API key** (see setup instructions below)

## Setup Instructions

### Step 1: Get Your OpenWeather API Key

1. Go to [OpenWeather API](https://openweathermap.org/api)
2. Click **Sign Up** and create a free account
3. Verify your email address
4. Navigate to **API Keys** in your account dashboard
5. Copy your **Default API Key** (it should be a long string of characters)
6. You now have a free tier that allows **1,000 API calls per day** - perfect for development!

### Step 2: Clone or Download This Project

If you're using GitHub:

```sh
git clone https://github.com/YOUR_USERNAME/weather-tracker.git
cd weather-tracker
```

Or download the ZIP file and extract it.

### Step 3: Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 4: Create Environment Variables

1. Create a `.env.local` file in the project root (same level as `package.json`):

```bash
cp .env.example .env.local
```

2. Open `.env.local` and add your OpenWeather API key:

```
OPENWEATHER_API_KEY=your_actual_api_key_here
```

### Step 5: Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The app will start at `http://localhost:3000`

## How to Use

1. **Search by City**: Type a city name in the search box and click "Search" (or press Enter)
2. **Use Your Location**: Click the 📍 button to automatically detect your location
3. **Switch Temperature Units**: Click °C or °F to toggle between Celsius and Fahrenheit
4. **Dark Mode**: Click 🌙 to enable/disable dark theme (preference is saved)

## API Architecture

### Security Design

The API key is **never** exposed to the client. Here's how it works:

1. **Client** (Browser) → Makes request to `/api/weather` with city name or coordinates
2. **Server** (Next.js) → Receives request, uses the API key from environment variables
3. **Server** → Calls OpenWeather API with the secret API key
4. **Server** → Returns weather data to the client
5. **Client** → Displays the weather data

This is the **recommended and secure way** to handle API keys in web applications!

### API Endpoint

```
POST /api/weather
```

**Request Body:**
```json
{
  "city": "Tokyo"
}
```

Or with coordinates:
```json
{
  "lat": 35.6762,
  "lon": 139.6503
}
```

**Response:**
```json
{
  "name": "Tokyo",
  "sys": {
    "country": "JP",
    "sunrise": 1234567890,
    "sunset": 1234567890
  },
  "main": {
    "temp": 25.5,
    "feels_like": 26.1,
    "temp_min": 22.3,
    "temp_max": 28.9,
    "humidity": 65,
    "pressure": 1013
  },
  "weather": [
    {
      "main": "Clear",
      "description": "clear sky",
      "icon": "01d"
    }
  ],
  "wind": {
    "speed": 3.5,
    "gust": 5.2,
    "deg": 180
  },
  "visibility": 10000,
  "rain": null,
  "snow": null
}
```
## Documentation

![ui-openweather](/img/dashboard.png)

## Deployment

**Vercel Link :** [Click Here for Online Access](https://openweather-pi.vercel.app/)

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues:

1. Check the **Troubleshooting** section above
2. Review the [Next.js Documentation](https://nextjs.org/docs)
3. Check the [OpenWeather API Documentation](https://openweathermap.org/api)
4. Open an issue on [GitHub](https://github.com/YOUR_USERNAME/weather-tracker/issues)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [OpenWeather API Documentation](https://openweathermap.org/api)
- [Vercel Documentation](https://vercel.com/docs)

---

**Happy Weather Tracking! 🌤️**

Built with ❤️ using Next.js
# openweather
