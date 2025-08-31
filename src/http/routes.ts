import { Express } from 'express'
import { register } from './controller/register'
import { authenticate } from './controller/authenticate'
import { createContact } from './controller/create-contact'
import { listContacts } from './controller/list-contacts'
import { getContact } from './controller/get-contact'

export function appRoutes(app: Express) {
    app.post('/users', register)
    app.post('/sessions', authenticate)
    app.post('/contacts', createContact)    
    app.get('/contacts/:id', getContact)
    app.get('/contacts', listContacts)  
}   