// User Models
export interface CreateUserRequest {
  name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface UserResponse {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export interface LoginResponse {
  message: string
  token: string
  user: UserResponse
}

// Contact Models
export interface CreateContactRequest {
  name: string
  address: string
  email: string
  phones: string[]
  city: string
}

export interface UpdateContactRequest {
  name?: string
  address?: string
  email?: string
  phones?: string[]
  city?: string
}

export interface PhoneResponse {
  id: string
  number: string
}

export interface ContactResponse {
  id: string
  name: string
  address: string
  email: string
  city: string
  phones: PhoneResponse[]
  createdAt: Date
  updatedAt: Date
}

export interface WeatherInfo {
  temperature?: number
  condition?: string
  suggestion?: string
  error?: string
}

export interface ContactWithWeatherResponse {
  contact: ContactResponse
  weather: WeatherInfo
}

export interface ListContactsResponse {
  contacts: ContactResponse[]
}
