import request from "supertest";
import { app } from "../../../app";
import { describe, expect, it } from "vitest";

describe('Register (e2e)', () => {

    it('should be able to register', async () => {
        const response = await request(app).post('/users').send({
            name: 'John Doe',
            email: 'john.doe@example.com',
            password: '123456',
        })

        expect(response.status).toEqual(201)
    });
})