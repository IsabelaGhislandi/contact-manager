import { Express } from 'express'
import { register } from './controller/users/register'
import { authenticate } from './controller/users/authenticate'
import { createContact } from './controller/contacts/create-contact'
import { listContacts } from './controller/contacts/list-contacts'
import { getContact } from './controller/contacts/get-contact'
import { updateContact } from './controller/contacts/update-contact'
import { deleteContact } from './controller/contacts/delete-contact'
import { jwtAuth } from './middleware/jwt-auth'

export function appRoutes(app: Express) {
    // Rotas de usuários
    app.post('/users', register)
    app.post('/sessions', authenticate)

    // Rotas de contatos (protegidas)
    app.post('/contacts', jwtAuth, createContact)    
    app.get('/contacts/:id', jwtAuth, getContact)
    app.get('/contacts', jwtAuth, listContacts)
    app.put('/contacts/:id', jwtAuth, updateContact)
    app.delete('/contacts/:id', jwtAuth, deleteContact)

}