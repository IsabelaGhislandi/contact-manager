import { Express } from 'express'
import { register } from './controller/register'
import { authenticate } from './controller/authenticate'

export function appRoutes(app: Express) {
    app.post('/users', register)
    app.post('/sessions', authenticate)
}   