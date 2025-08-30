import { Express } from 'express'
import { register } from './controller/register'

export function appRoutes(app: Express) {
    app.post('/users', register)
}   