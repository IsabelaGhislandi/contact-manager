import request from "supertest";
import { describe, it, beforeAll, expect } from "vitest";
import { app } from "../../../app";
 
describe("Create Contact (e2e)", () => {
  let token: string;

  beforeAll(async () => {
    await request(app).post("/users").send({
      name: "John Doe",
      email: "john@example.com",
      password: "123456",
    });

    const loginResponse = await request(app).post("/sessions").send({
      email: "john@example.com",
      password: "123456",
    });

    token = loginResponse.body.token;
  });

  it("it should create a contact successfully (integration test)", async () => {
    const response = await request(app)
      .post("/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Alice Johnson",
        address: "123 Main Street",
        email: "alice@example.com",
        phones: ["11999999999"],
        city: "São Paulo",
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Contact created successfully");
    expect(response.body.contact).toHaveProperty("id");
  });
});
