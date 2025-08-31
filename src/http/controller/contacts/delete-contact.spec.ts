import request from "supertest";
import { app } from "../../../app";
import { describe, it, expect, beforeAll } from "vitest";

describe("Delete Contact (e2e)", () => {
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

    const contactResponse = await request(app)
      .post("/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Alice Johnson",
        address: "123 Main Street",
        email: "alice@example.com",
        phones: ["55119999999"],
        city: "São Paulo",
      });

    expect(contactResponse.status).toBe(201);
    if (!contactResponse.body.contact) {
      throw new Error("Failed to create contact. Check response body!");
    }

    contactId = contactResponse.body.contact.id;
  });

  it("should delete contact successfully", async () => {
    const response = await request(app)
      .delete(`/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Contact deleted successfully");
    expect(response.body).toHaveProperty("contactId", contactId);
    expect(response.body).toHaveProperty("deletedAt");
  });

  it("should return 404 if contact does not exist", async () => {
    const response = await request(app)
      .delete(`/contacts/non-existent-id`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Contact not found");
  });

  it("should return 401 if token is missing", async () => {
    const response = await request(app).delete(`/contacts/${contactId}`);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Token de acesso requerido");
  });
});
