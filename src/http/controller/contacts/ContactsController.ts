import { Body, Controller, Delete, Get, Path, Post, Put, Route, Security, SuccessResponse, Tags, Request } from 'tsoa'
import { CreateContactRequest, UpdateContactRequest, ContactResponse, ContactWithWeatherResponse } from '../../../models'
import { makeCreateContactUseCase } from '../../../services/factories/contacts/make-create-use-case'
import { makeGetContactUseCase } from '../../../services/factories/contacts/make-get-contact-use-case'
import { makeUpdateContactUseCase } from '../../../services/factories/contacts/make-update-contact-use-case'
import { makeDeleteContactUseCase } from '../../../services/factories/contacts/make-delete-contact-use-case'
import { makeListContactsUseCase } from '../../../services/factories/contacts/make-list-contacts-use-case'
import { makeWeatherService } from '../../../services/factories/weather/make-weather-service'

interface AuthenticatedRequest extends Express.Request {
  userId: string
}

@Route('contacts')
@Tags('Contacts')
@Security('jwt')
export class ContactsController extends Controller {
  
  @Post()
  @SuccessResponse('201', 'Contato criado com sucesso')
  public async createContact(
    @Body() requestBody: CreateContactRequest,
    @Request() request: AuthenticatedRequest
  ): Promise<{ message: string, contact: ContactResponse }> {
    const createContactUseCase = makeCreateContactUseCase()
    
    const { contact } = await createContactUseCase.execute({
      userId: request.userId,
      name: requestBody.name,
      address: requestBody.address,
      email: requestBody.email,
      phones: requestBody.phones,
      city: requestBody.city
    })
    
    return {
      message: 'Contact created successfully',
      contact: {
        id: contact.id,
        name: contact.name,
        address: contact.address,
        email: contact.email,
        city: contact.city,
        phones: contact.phones.map(phone => ({
          id: phone.id,
          number: phone.number
        })),
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }
    }
  }

  @Get('{id}')
  @SuccessResponse('200', 'Contato encontrado com informações de clima')
  public async getContact(
    @Path() id: string,
    @Request() request: AuthenticatedRequest
  ): Promise<ContactWithWeatherResponse> {
    const getContactUseCase = makeGetContactUseCase()
    const weatherService = makeWeatherService()
    
    const { contact, weatherSuggestion } = await getContactUseCase.execute({
      contactId: id,
      userId: request.userId
    })
    
    return {
      contact: {
        id: contact.id,
        name: contact.name,
        address: contact.address,
        email: contact.email,
        city: contact.city,
        phones: contact.phones.map(phone => ({
          id: phone.id,
          number: phone.number
        })),
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      },
      weather: weatherSuggestion.weather ? {
        temperature: weatherSuggestion.weather.temperature,
        condition: weatherSuggestion.weather.description,
        suggestion: weatherSuggestion.message
      } : {
        error: weatherSuggestion.message
      }
    }
  }

  @Get()
  @SuccessResponse('200', 'Lista de contatos')
  public async listContacts(
    @Request() request: AuthenticatedRequest
  ): Promise<{ contacts: ContactResponse[] }> {
    const listContactsUseCase = makeListContactsUseCase()
    
    const { contacts } = await listContactsUseCase.execute({
      userId: request.userId
    })
    
    return {
      contacts: contacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        address: contact.address,
        email: contact.email,
        city: contact.city,
        phones: contact.phones.map(phone => ({
          id: phone.id,
          number: phone.number
        })),
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }))
    }
  }

  @Put('{id}')
  @SuccessResponse('200', 'Contato atualizado com sucesso')
  public async updateContact(
    @Path() id: string,
    @Body() requestBody: UpdateContactRequest,
    @Request() request: AuthenticatedRequest
  ): Promise<{ message: string, contact: ContactResponse }> {
    const updateContactUseCase = makeUpdateContactUseCase()
    
    const { contact } = await updateContactUseCase.execute({
      contactId: id,
      userId: request.userId,
      ...requestBody
    })
    
    return {
      message: 'Contact updated successfully',
      contact: {
        id: contact.id,
        name: contact.name,
        address: contact.address,
        email: contact.email,
        city: contact.city,
        phones: contact.phones.map(phone => ({
          id: phone.id,
          number: phone.number
        })),
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }
    }
  }

  @Delete('{id}')
  @SuccessResponse('204', 'Contato deletado com sucesso')
  public async deleteContact(
    @Path() id: string,
    @Request() request: AuthenticatedRequest
  ): Promise<void> {
    const deleteContactUseCase = makeDeleteContactUseCase()
    
    await deleteContactUseCase.execute({
      contactId: id,
      userId: request.userId
    })
  }
}
