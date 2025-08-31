import request from "supertest";
import { describe, it, beforeAll, expect } from "vitest";
import { app } from "../../../app";
import { Contact } from "@prisma/client";

describe("List Contacts (e2e)", () => {
  let token: string;
  let contactId1: string;
  let contactId2: string;

  beforeAll(async () => {
    // Criar usuário
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

    // Criar contatos
    const contact1 = await request(app)
      .post("/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Alice Johnson",
        address: "123 Main Street",
        email: "alice@example.com",
        phones: ["11999999999"],
        city: "São Paulo",
      });

    const contact2 = await request(app)
      .post("/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Bob Smith",
        address: "456 Elm Street",
        email: "bob@example.com",
        phones: ["11988888888"],
        city: "Rio de Janeiro",
      });

    contactId1 = contact1.body.contact.id;
    contactId2 = contact2.body.contact.id;
  });

  it("should retrieve all contacts for the user", async () => {
    const response = await request(app)
      .get("/contacts")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.contacts)).toBe(true);
    expect(response.body.contacts.length).toBeGreaterThanOrEqual(2);
    expect(response.body.contacts.some((contact: Contact) => contact.id === contactId1)).toBe(true);
    expect(response.body.contacts.some((contact: Contact) => contact.id === contactId2)).toBe(true);
  });

  it("should filter contacts by name", async () => {
    const response = await request(app)
      .get("/contacts")
      .query({ name: "Alice Johnson" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.contacts.length).toBe(1);
    expect(response.body.contacts[0].name).toBe("Alice Johnson");
  });

  it("should filter contacts by email", async () => {
    const response = await request(app)
      .get("/contacts")
      .query({ email: "alice@example.com" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.contacts.length).toBe(1);
    expect(response.body.contacts[0].email).toBe("alice@example.com");
  });

  it("should filter contacts by city", async () => {
    const response = await request(app)
      .get("/contacts")
      .query({ city: "São Paulo" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.contacts.length).toBe(1);
    expect(response.body.contacts[0].city).toBe("São Paulo");
  });

 
});
