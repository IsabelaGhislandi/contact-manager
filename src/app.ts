import express from 'express'
import { ZodError } from 'zod'
import { env } from './env'
import swaggerUi from 'swagger-ui-express'
import { appRoutes } from './http/routes'
import { RegisterRoutes } from './swagger/routes'
import { errorHandler } from './http/middleware/error-handler'
import * as swaggerDocument from './swagger/swagger.json'

export const app = express()
app.use(express.json())

// swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Contact Manager API'
}))

// tsoa
RegisterRoutes(app)

// dev routes
appRoutes(app)
app.use(errorHandler);  

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Validation Error', issues: error.format() })
    }
    if (env.NODE_ENV !== 'prod') {
        console.error(error)
    } else {
        // TODO: Log to an external tool like DataDog/NewRelic/Sentry
    }
    return res.status(500).json({ message: 'Internal Server Error' })
})

