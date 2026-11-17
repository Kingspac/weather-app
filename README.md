# WeatherNow

A fast, responsive weather app built with React and Vite. Search any city and get current conditions plus a 5-day forecast, powered by the free Open-Meteo API (no API key needed).

## Features

- City search with geocoding
- Current temperature, feels-like, humidity and wind
- 5-day forecast with rain probability
- Use my location (browser geolocation)
- Celsius / Fahrenheit toggle, remembered between visits
- Recent searches saved in localStorage
- Loading spinner and clear error messages (unknown city, no internet, denied location)
- Day / night theme and landscape-friendly layout

## Tech Stack

React 19, Vite, Open-Meteo Geocoding and Forecast APIs, CSS3

## Getting Started

    git clone https://github.com/Kingspac/weather-app.git
    cd weather-app
    npm install
    npm run dev

## Project Structure

    src/
      App.jsx       UI, state, search and geolocation
      weather.js    API calls and weather-code descriptions
      index.css     styles

## Deployment (Render, static site)

- Build command: `npm install && npm run build`
- Publish directory: `dist`

## Credits

Weather data by [Open-Meteo](https://open-meteo.com/).

## Author

Bulus Kingsley, Full Stack Developer (MERN)
