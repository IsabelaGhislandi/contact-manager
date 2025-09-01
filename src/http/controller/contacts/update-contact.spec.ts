import request from "supertest";
import { describe, it, beforeAll, expect } from "vitest";
import { app } from "../../../app";

describe("Update Contact (e2e)", () => {
  let token: string;
  let contactId: string;

  beforeAll(async () => {
    await request(app).post("/users").send({
      name: "John Doe",
      email: "john.update@example.com",
      password: "123456",
    });

    const loginResponse = await request(app).post("/sessions").send({
      email: "john.update@example.com",
      password: "123456",
    });

    token = loginResponse.body.token;

    const contactResponse = await request(app)
      .post("/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Maria Silva",
        address: "Rua das Flores, 123",
        email: "maria@example.com",
        phones: ["11999887766"],
        city: "São Paulo",
      });

    contactId = contactResponse.body.contact.id;
  });

  it("should update a contact successfully with all fields", async () => {
    const response = await request(app)
      .put(`/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Maria Santos Silva",
        address: "Av. Paulista, 456",
        email: "maria.santos@example.com",
        phones: ["11987654321", "11876543210"],
        city: "Rio de Janeiro",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Contact updated successfully");
    expect(response.body.contact.name).toBe("Maria Santos Silva");
    expect(response.body.contact.address).toBe("Av. Paulista, 456");
    expect(response.body.contact.email).toBe("maria.santos@example.com");
    expect(response.body.contact.city).toBe("Rio de Janeiro");
    expect(response.body.contact.phones).toHaveLength(2);
    expect(response.body.contact.phones[0].number).toBe("11987654321");
  });

  it("should update only specific fields (partial update)", async () => {
    const response = await request(app)
      .put(`/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Maria Santos Updated",
        city: "Brasília",
      });

    expect(response.status).toBe(200);
    expect(response.body.contact.name).toBe("Maria Santos Updated");
    expect(response.body.contact.city).toBe("Brasília");
    expect(response.body.contact.email).toBe("maria.santos@example.com");
  });

  it("should return 404 if contact does not exist", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";
    const response = await request(app)
      .put(`/contacts/${nonExistentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Ghost Contact",
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Contact not found");
  });

  it("should return 400 for invalid email format", async () => {
    const response = await request(app)
      .put(`/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: "invalid-email-format",
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Validation error");
    expect(response.body.errors).toBeDefined();
  });

  it("should return 400 for duplicate phone numbers", async () => {
    const response = await request(app)
      .put(`/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        phones: ["11999999999", "11999999999"],
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Duplicate phone numbers are not allowed");
  });

  it("should return 400 for empty phone array", async () => {
    const response = await request(app)
      .put(`/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        phones: [],
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Validation error");
  });

  it("should return 401 without authentication token", async () => {
    const response = await request(app)
      .put(`/contacts/${contactId}`)
      .send({
        name: "Unauthorized Update",
      });

    expect(response.status).toBe(401);
  });

  it("should not update contact from another user", async () => {
    await request(app).post("/users").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "123456",
    });

    const otherUserLogin = await request(app).post("/sessions").send({
      email: "jane@example.com",
      password: "123456",
    });

    const otherUserToken = otherUserLogin.body.token;

    const response = await request(app)
      .put(`/contacts/${contactId}`)
      .set("Authorization", `Bearer ${otherUserToken}`)
      .send({
        name: "Hacked Name",
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Contact not found");
  });

  it("should return 404 for invalid contact ID format", async () => {
    const response = await request(app)
      .put("/contacts/invalid-id")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Name",
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Contact not found");
  });
});