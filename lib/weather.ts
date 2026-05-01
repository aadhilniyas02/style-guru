const WEATHER_KEY = process.env.EXPO_PUBLIC_WEATHER_KEY
const COLOMBO_LAT = 6.9271
const COLOMBO_LON = 79.8612

export interface WeatherData {
  temp: number        // Celsius
  description: string
  icon: string        // OpenWeatherMap icon code e.g. "01d"
  city: string
}

export async function getWeather(): Promise<WeatherData> {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${COLOMBO_LAT}&lon=${COLOMBO_LON}&units=metric&appid=${WEATHER_KEY}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`)

  const data = await res.json()
  return {
    temp: Math.round(data.main.temp),
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    city: data.name,
  }
}
