import request from "supertest";
import { describe, it, beforeAll, expect } from "vitest";
import { app } from "../../../app";

describe("Get Contact (e2e)", () => {
  let token: string;
  let contactId: string;

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

    const createResponse = await request(app)
      .post("/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Alice Johnson",
        address: "123 Main Street",
        email: "alice@example.com",
        phones: ["11999999999"],
        city: "São Paulo",
      });

    contactId = createResponse.body.contact.id;
  });

  it("should retrieve a contact successfully", async () => {
    const response = await request(app)
      .get(`/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.contact).toHaveProperty("id", contactId);
    expect(response.body.contact.name).toBe("Alice Johnson");
  });

  it("should return 404 if contact not found", async () => {
    const response = await request(app)
      .get("/contacts/nonexistent-id")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Contact not found");
  });
});
