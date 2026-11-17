import { useCallback, useEffect, useState } from 'react'
import { searchCity, getWeather, describe } from './weather'

const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

const dayName = (iso) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })

export default function App() {
  const [query, setQuery] = useState('')
  const [place, setPlace] = useState(null)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unit, setUnit] = useState(() => load('wx-unit', 'C'))
  const [recent, setRecent] = useState(() => load('wx-recent', []))

  const fetchFor = useCallback(async (resolvePlace) => {
    setLoading(true)
    setError('')
    try {
      const p = await resolvePlace()
      const w = await getWeather(p)
      setPlace(p)
      setWeather(w)
      return p
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const last = load('wx-recent', [])[0] || 'Lagos'
    fetchFor(() => searchCity(last))
  }, [fetchFor])

  const search = async (name) => {
    const city = name.trim()
    if (!city) return
    const p = await fetchFor(() => searchCity(city))
    if (p) {
      const next = [p.city, ...recent.filter((c) => c !== p.city)].slice(0, 5)
      setRecent(next)
      save('wx-recent', next)
      setQuery('')
    }
  }

  const locateMe = () => {
    if (!navigator.geolocation) {
      setError('Location is not supported on this device.')
      return
    }
    setLoading(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        fetchFor(async () => ({
          city: 'Your location',
          country: '',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        })),
      () => {
        setLoading(false)
        setError('Location permission denied. Search for a city instead.')
      },
      { timeout: 10000 },
    )
  }

  const changeUnit = (u) => {
    setUnit(u)
    save('wx-unit', u)
  }

  const t = (c) => Math.round(unit === 'F' ? (c * 9) / 5 + 32 : c)
  const wind = (kmh) =>
    unit === 'F' ? `${Math.round(kmh * 0.621)} mph` : `${Math.round(kmh)} km/h`

  const cur = weather ? weather.current : null
  const daily = weather ? weather.daily : null
  const info = cur ? describe(cur.weather_code, cur.is_day) : null

  return (
    <div className={`app ${cur ? (cur.is_day ? 'day' : 'night') : ''}`}>
      <main className="card">
        <header className="top">
          <h1>
            Weather<span>Now</span>
          </h1>
          <div className="unit">
            <button className={unit === 'C' ? 'on' : ''} onClick={() => changeUnit('C')}>
              °C
            </button>
            <button className={unit === 'F' ? 'on' : ''} onClick={() => changeUnit('F')}>
              °F
            </button>
          </div>
        </header>

        <form
          className="search"
          onSubmit={(e) => {
            e.preventDefault()
            search(query)
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a city..."
            aria-label="City name"
          />
          <button type="submit" disabled={loading}>
            Search
          </button>
          <button
            type="button"
            onClick={locateMe}
            aria-label="Use my location"
            title="Use my location"
          >
            📍
          </button>
        </form>

        {recent.length > 0 && (
          <div className="chips">
            {recent.map((c) => (
              <button key={c} onClick={() => search(c)}>
                {c}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {loading && (
          <div className="loader" aria-label="Loading">
            <span />
          </div>
        )}

        {cur && (
          <div className={`content${loading ? ' dim' : ''}`}>
            <section className="current">
              <p className="place">
                {place.city}
                {place.country ? `, ${place.country}` : ''}
              </p>
              <div className="icon" aria-hidden="true">
                {info.icon}
              </div>
              <p className="temp">{t(cur.temperature_2m)}°</p>
              <p className="desc">{info.label}</p>
              <div className="stats">
                <div>
                  <span>Feels like</span>
                  <strong>{t(cur.apparent_temperature)}°</strong>
                </div>
                <div>
                  <span>Humidity</span>
                  <strong>{cur.relative_humidity_2m}%</strong>
                </div>
                <div>
                  <span>Wind</span>
                  <strong>{wind(cur.wind_speed_10m)}</strong>
                </div>
              </div>
            </section>

            <section className="forecast">
              <h2>Next 5 days</h2>
              <ul>
                {daily.time.slice(1).map((d, i) => {
                  const idx = i + 1
                  const di = describe(daily.weather_code[idx])
                  return (
                    <li key={d}>
                      <span className="day">{dayName(d)}</span>
                      <span aria-hidden="true">{di.icon}</span>
                      <span className="rain">
                        💧 {daily.precipitation_probability_max[idx] ?? 0}%
                      </span>
                      <span className="range">
                        <b>{t(daily.temperature_2m_max[idx])}°</b>{' '}
                        {t(daily.temperature_2m_min[idx])}°
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          </div>
        )}

        <footer>
          Data by{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo
          </a>
        </footer>
      </main>
    </div>
  )
}
