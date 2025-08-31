import { describe, it, expect } from 'vitest'
import { WeatherService } from './weather-service'
import { env } from '../../env'

describe('Weather Integration (Real API)', () => {
  it('should check if OpenWeather API key is configured', () => {
    console.log('OPENWEATHER_API_KEY:', env.OPENWEATHER_API_KEY ? 'Configurada' : 'Não configurada')
    console.log('NODE_ENV:', env.NODE_ENV)
  })

  it('should test weather service with real API (if key is configured)', async () => {
    const weatherService = new WeatherService()
    
    const result = await weatherService.getWeatherByCity('São Paulo')

    expect(result.message).toBeDefined()
    expect(typeof result.message).toBe('string')
    expect(result.message.length).toBeGreaterThan(0)
    
    console.log('Resultado do clima:', {
      message: result.message,
      hasWeatherData: !!result.weather,
      weather: result.weather
    })
    
    if (result.weather) {
      expect(result.weather.temperature).toBeDefined()
      expect(result.weather.condition).toBeDefined()
      expect(result.weather.city).toBeDefined()
      expect(result.weather.description).toBeDefined()
    }
  }, 10000) 

  it('should test weather service with different cities', async () => {
    const weatherService = new WeatherService()
    
    const cities = ['Rio de Janeiro', 'Florianópolis', 'Curitiba']
    
    for (const city of cities) {
      const result = await weatherService.getWeatherByCity(city)
      
      expect(result.message).toBeDefined()
      console.log(`${city}:`, result.message)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }, 30000) })