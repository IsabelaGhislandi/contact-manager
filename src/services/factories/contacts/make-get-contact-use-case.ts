import { GetContactUseCase } from "../../contacts/get-contact"
import { WeatherService } from "../../weather/weather-service"
import { contactsRepository } from "./make-contacts-repository"

export function makeGetContactUseCase() {
    const weatherService = new WeatherService()
    const getContactUseCase = new GetContactUseCase(contactsRepository, weatherService)
    return getContactUseCase
}