import express from 'express'
import { PrismaClient } from '@prisma/client'

export const app = express()
const prisma = new PrismaClient()
prisma.contact.create({
    data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: ['1234567890']
    }
})