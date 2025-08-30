import express from 'express'
import { appRoutes } from './http/routes'
import { ZodError } from 'zod'
import { env } from './env'

export const app = express()
app.use(express.json())
appRoutes(app)

app.use((error, res) => {
    if (error instanceof ZodError) {
        return res.status(400).send({ message: 'Validation Error', issues: error.format()     })
    }
    if (env.NODE_ENV !== 'prod') {
        console.error(error)
        
    } else {
        // TODO: Log to an external tool like DataDog/NewRelic/Sentry
    }
    return res.status(500).send({ message: 'Internal Server Error' })
})

