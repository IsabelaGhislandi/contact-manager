import { ContactsRepository, ContactWithPhones } from "../../repositories/contacts-repository"
import { ContactNotFoundError } from "../errors/contact-not-found-error"
import { WeatherService, WeatherSuggestion } from "../weather/weather-service"

interface GetContactUseCaseRequest {
    contactId: string
    userId: string
}

interface GetContactUseCaseResponse {
    contact: ContactWithPhones
    weatherSuggestion: WeatherSuggestion
}

export class GetContactUseCase {
    constructor(
        private contactsRepository: ContactsRepository,
        private weatherService: WeatherService  
    ) {}

    async execute({ 
        contactId, 
        userId 
    }: GetContactUseCaseRequest): Promise<GetContactUseCaseResponse> {

        const contact = await this.contactsRepository.findById(contactId)

        if (!contact) {
            throw new ContactNotFoundError()
        }

        // Only contacts by this user
        if (contact.userId !== userId) {
            throw new ContactNotFoundError()
        }

        // Get weather information for the contact's city
        const weatherSuggestion = await this.weatherService.getWeatherByCity(contact.city)

        return {
            contact,
            weatherSuggestion
        }
    }
}