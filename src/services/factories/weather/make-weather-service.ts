import { WeatherService } from '../../weather/weather-service'

export function makeWeatherService() {
  return new WeatherService()
}
