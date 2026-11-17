const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

async function request(url) {
  let res
  try {
    res = await fetch(url)
  } catch {
    throw new Error('No internet connection. Check your network and try again.')
  }
  if (!res.ok) throw new Error('The weather service is unavailable. Try again shortly.')
  return res.json()
}

export async function searchCity(name) {
  const data = await request(
    `${GEO_URL}?name=${encodeURIComponent(name)}&count=1&language=en&format=json`,
  )
  const hit = data.results && data.results[0]
  if (!hit) throw new Error(`No city found for "${name}". Check the spelling.`)
  return {
    city: hit.name,
    country: hit.country || '',
    latitude: hit.latitude,
    longitude: hit.longitude,
  }
}

export function getWeather({ latitude, longitude }) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: 6,
  })
  return request(`${FORECAST_URL}?${params}`)
}

export function describe(code, isDay = 1) {
  if (code === 0) return { label: 'Clear sky', icon: isDay ? '☀️' : '🌙' }
  if (code === 1) return { label: 'Mainly clear', icon: isDay ? '🌤️' : '🌙' }
  if (code === 2) return { label: 'Partly cloudy', icon: '⛅' }
  if (code === 3) return { label: 'Overcast', icon: '☁️' }
  if (code === 45 || code === 48) return { label: 'Foggy', icon: '🌫️' }
  if (code >= 51 && code <= 57) return { label: 'Drizzle', icon: '🌦️' }
  if (code >= 61 && code <= 67) return { label: 'Rain', icon: '🌧️' }
  if (code >= 71 && code <= 77) return { label: 'Snow', icon: '❄️' }
  if (code >= 80 && code <= 82) return { label: 'Rain showers', icon: '🌧️' }
  if (code === 85 || code === 86) return { label: 'Snow showers', icon: '🌨️' }
  if (code >= 95) return { label: 'Thunderstorm', icon: '⛈️' }
  return { label: 'Unknown', icon: '🌡️' }
}
