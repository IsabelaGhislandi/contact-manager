import { ContactsRepository, ContactWithPhones } from "../../repositories/contacts-repository"
import { ContactNotFoundError, InvalidEmailFormatError, InvalidCityFormatError, InvalidPhoneFormatError, DuplicatePhoneError, PhoneRequiredError, DuplicateEmailError } from "../errors"
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

        if (contact.userId !== userId) {
            throw new ContactNotFoundError()
        }

        const weatherSuggestion = await this.weatherService.getWeatherByCity(contact.city)

        return {
            contact,
            weatherSuggestion
        }
    }
}