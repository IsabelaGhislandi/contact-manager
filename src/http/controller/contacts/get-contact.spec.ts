import request from "supertest";
import { describe, it, beforeAll, expect } from "vitest";
import { app } from "../../../app";

describe("Get Contact with Weather (e2e)", () => {
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
    expect(response.body.contact.city).toBe("São Paulo");
    expect(response.body.contact.address).toBe("123 Main Street");
    expect(response.body.contact.email).toBe("alice@example.com");
    expect(response.body.contact.phones).toHaveLength(1);
    expect(response.body.contact.phones[0].number).toBe("11999999999");
  });

  it("should include weather suggestion in response", async () => {
    const response = await request(app)
      .get(`/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    
    expect(response.body).toHaveProperty('suggestion');
    expect(typeof response.body.suggestion).toBe('string');
    expect(response.body.suggestion.length).toBeGreaterThan(0);

    if (response.body.weather) {
      expect(response.body.weather).toHaveProperty('temperature');
      expect(response.body.weather).toHaveProperty('condition');
      expect(response.body.weather).toHaveProperty('description');
      expect(response.body.weather).toHaveProperty('city');
      expect(typeof response.body.weather.temperature).toBe('number');
    }
  });

  it("should return 404 if contact not found", async () => {
    const response = await request(app)
      .get("/contacts/nonexistent-id")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Contact not found");
  });

  it("should return 401 if token is missing", async () => {
    const response = await request(app).get(`/contacts/${contactId}`);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Token de acesso requerido");
  });

  it("should work with different cities", async () => {
    // Criar contato em cidade diferente
    const rioContactResponse = await request(app)
      .post("/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Carlos Silva",
        address: "Copacabana, 456",
        email: "carlos@example.com",
        phones: ["21988887777"],
        city: "Rio de Janeiro",
      });

    const rioContactId = rioContactResponse.body.contact.id;

    const response = await request(app)
      .get(`/contacts/${rioContactId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.contact.city).toBe("Rio de Janeiro");
    expect(response.body).toHaveProperty('suggestion');
    expect(typeof response.body.suggestion).toBe('string');
  });

  it("should handle cities with accents and spaces", async () => {
    // Criar contato em cidade com acentos
    const florianopolisContactResponse = await request(app)
      .post("/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "João Santos",
        address: "Rua das Rendeiras, 789",
        email: "joao@example.com",
        phones: ["48999888777"],
        city: "Florianópolis",
      });

    const florianopolisContactId = florianopolisContactResponse.body.contact.id;

    const response = await request(app)
      .get(`/contacts/${florianopolisContactId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.contact.city).toBe("Florianópolis");
    expect(response.body).toHaveProperty('suggestion');
    expect(typeof response.body.suggestion).toBe('string');
  });

  it("should work even if weather API is unavailable", async () => {
    // Este teste funciona independente da disponibilidade da API
    const response = await request(app)
      .get(`/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.contact).toHaveProperty("id", contactId);
    
    // Sempre deve ter uma sugestão, mesmo que seja de erro
    expect(response.body).toHaveProperty('suggestion');
    expect(typeof response.body.suggestion).toBe('string');
    
    // Pode ser null se a API falhou, ou um objeto se funcionou
    expect(['object', 'undefined']).toContain(typeof response.body.weather);
  });
});