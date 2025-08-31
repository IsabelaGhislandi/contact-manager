import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
    NODE_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),
    PORT: z.coerce.number().default(3333),
    DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/contact_manager?schema=public"),
    JWT_SECRET: z.string().default("jwt-secret-for-development-and-tests"),
    OPENWEATHER_API_KEY: z.string().optional(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {

    throw new Error('Invalid environment variables. Check the console for details.')
}

export const env = _env.data



