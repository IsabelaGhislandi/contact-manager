import { env } from "../../env"

export interface WeatherData {
  temperature: number
  condition: string
  city: string
  description: string
}

export interface WeatherSuggestion {
  message: string
  weather?: WeatherData
}

export class WeatherService {
  private readonly baseUrl = "http://api.openweathermap.org/data/2.5/weather"
  private readonly apiKey: string | undefined

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.OPENWEATHER_API_KEY
  }

  async getWeatherByCity(city: string): Promise<WeatherSuggestion> {
    if (!this.apiKey) {
      return {
        message: "Configuração de clima indisponível no momento."
      }
    }

    try {
      const url = `${this.baseUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=pt_br`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      
      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main.toLowerCase(),
        city: data.name,
        description: data.weather[0].description
      }

      const suggestion = this.generateSuggestion(weatherData)
      
      return {
        message: suggestion,
        weather: weatherData
      }

    } catch (error) {
      console.error('Weather API Error:', error)
      return {
        message: "Não foi possível obter informações do clima no momento. Tente novamente mais tarde."
      }
    }
  }

  private generateSuggestion(weather: WeatherData): string {
    const { temperature, condition } = weather
    const isSunny = ['clear', 'sunny'].includes(condition)
    const isRainy = ['rain', 'drizzle', 'thunderstorm'].includes(condition)

    if (temperature <= 18) {
      return "Ofereça um chocolate quente ao seu contato..."
    }

    if (temperature >= 30) {
      if (isSunny) {
        return "Convide seu contato para ir à praia com esse calor!"
      }
      if (isRainy) {
        return "Convide seu contato para tomar um sorvete"
      }
    }

    // Entre 18° e 30°
    if (isSunny) {
      return "Convide seu contato para fazer alguma atividade ao ar livre"
    }
    
    if (isRainy) {
      return "Convide seu contato para ver um filme"
    }

    // Condição padrão para temperaturas entre 18-30° sem condição específica
    return "Que tal entrar em contato com essa pessoa hoje?"
  }
}