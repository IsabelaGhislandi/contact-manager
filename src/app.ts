import express from 'express'
import { appRoutes } from './http/routes'
import { setupSwagger } from './swagger'

export const app = express()
app.use(express.json())
setupSwagger(app)
// dev routes
appRoutes(app) 