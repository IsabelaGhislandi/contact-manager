import request from "supertest";
import { app } from "../../../app";
import { describe, expect, it } from "vitest";

describe('Authenticate (e2e)', () => {

    it('should be able to authenticate', async () => {
        await request(app).post('/users').send({
            name: 'John Doe',
            email: 'john.doe@example.com',
            password: '123456',
        })
       
        const response = await request(app).post('/sessions').send({
            email: 'john.doe@example.com',
            password: '123456',
        })

        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
            message: "User authenticated successfully",
            token: expect.any(String),
            user: {
              id: expect.any(String),
              name: "John Doe",
              email: "john.doe@example.com"
            }
          })
    });
})