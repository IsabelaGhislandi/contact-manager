"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express = __toESM(require("express"));
var import_zod9 = require("zod");

// src/env/index.ts
var import_config = require("dotenv/config");
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["dev", "prod", "test"]).default("dev"),
  PORT: import_zod.z.coerce.number().default(3333),
  DATABASE_URL: import_zod.z.string().default("postgresql://postgres:postgres@localhost:5432/contact_manager?schema=public"),
  JWT_SECRET: import_zod.z.string().default("jwt-secret-for-development-and-tests"),
  OPENWEATHER_API_KEY: import_zod.z.string().optional()
});
var _env = envSchema.safeParse(process.env);
if (_env.success === false) {
  throw new Error("Invalid environment variables. Check the console for details.");
}
var env = _env.data;

// src/http/controller/users/register.ts
var import_zod2 = __toESM(require("zod"));

// src/services/errors/user-already-exists-error.ts
var UserAlreadyExistsError = class extends Error {
  constructor() {
    super("User with same email already exists");
  }
};

// src/services/users/register.ts
var import_bcrypt = require("bcrypt");
var RegisterUseCase = class {
  constructor(usersRepository2) {
    this.usersRepository = usersRepository2;
  }
  async execute({
    name,
    email,
    password
  }) {
    if (password.length < 6) {
      throw new Error("Password must have at least 6 characters");
    }
    const userWithSameEmail = await this.usersRepository.findByEmail(email);
    if (userWithSameEmail) {
      throw new UserAlreadyExistsError();
    }
    const passwordHash = await (0, import_bcrypt.hash)(password, 6);
    const user = await this.usersRepository.create({
      name,
      email,
      password: passwordHash
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  }
};

// src/repositories/in-memory/in-memory-users-repository.ts
var import_crypto = require("crypto");
var InMemoryUsersRepository = class {
  constructor() {
    this.items = [];
  }
  async findById(id) {
    const user = this.items.find((user2) => user2.id === id);
    if (!user) {
      return null;
    }
    return user;
  }
  async findByEmail(email) {
    const user = this.items.find((user2) => user2.email === email);
    if (!user) {
      return null;
    }
    return user;
  }
  async create(data) {
    const user = {
      id: (0, import_crypto.randomUUID)(),
      name: data.name,
      email: data.email,
      password: data.password,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.items.push(user);
    return user;
  }
};

// src/services/factories/users/make-users-repository.ts
var usersRepository = new InMemoryUsersRepository();

// src/services/factories/contacts/make-register-use-case.ts
function makeRegisterUseCase() {
  const registerUseCase = new RegisterUseCase(usersRepository);
  return registerUseCase;
}

// src/http/controller/users/register.ts
async function register(req, res) {
  try {
    const registerBodySchema = import_zod2.default.object({
      name: import_zod2.default.string(),
      email: import_zod2.default.string().email(),
      password: import_zod2.default.string().min(6, "Password must have at least 6 characters")
    });
    const { name, email, password } = registerBodySchema.parse(req.body);
    const registerUseCase = makeRegisterUseCase();
    const user = await registerUseCase.execute({ name, email, password });
    return res.status(201).json({
      message: "User created successfully",
      user
    });
  } catch (error) {
    if (error instanceof import_zod2.default.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
    }
    if (error instanceof UserAlreadyExistsError) {
      return res.status(409).json({
        message: error.message
      });
    }
    throw error;
  }
}

// src/http/controller/users/authenticate.ts
var import_zod3 = __toESM(require("zod"));
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));

// src/services/errors/invalid-credential-errors.ts
var InvalidCredentialErrors = class extends Error {
  constructor() {
    super("E-mail ou senha incorretos");
  }
};

// src/services/users/authtenticate.ts
var import_bcrypt2 = require("bcrypt");
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var AuthenticateUseCase = class {
  constructor(usersRepository2) {
    this.usersRepository = usersRepository2;
  }
  async execute({ email, password }) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialErrors();
    }
    const doesPasswordMatch = await (0, import_bcrypt2.compare)(password, user.password);
    if (!doesPasswordMatch) {
      throw new InvalidCredentialErrors();
    }
    const token = import_jsonwebtoken.default.sign(
      { sub: user.id },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    };
  }
};

// src/services/factories/users/make-authenticate-use-case.ts
function makeAuthenticateUseCase() {
  const authenticateUseCase = new AuthenticateUseCase(usersRepository);
  return authenticateUseCase;
}

// src/http/controller/users/authenticate.ts
async function authenticate(req, res) {
  try {
    const autheticateBodySchema = import_zod3.default.object({
      email: import_zod3.default.string().email(),
      password: import_zod3.default.string().min(6, "Password must have at least 6 characters")
    });
    const { email, password } = autheticateBodySchema.parse(req.body);
    const authenticateUseCase = makeAuthenticateUseCase();
    const { user } = await authenticateUseCase.execute({ email, password });
    const token = import_jsonwebtoken2.default.sign(
      {
        sub: user.id
      },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.status(200).json({
      message: "User authenticated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    if (error instanceof import_zod3.default.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
    }
    if (error instanceof InvalidCredentialErrors) {
      return res.status(401).json({
        message: "Email or password incorrect"
      });
    }
    console.error("Authentication error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
}

// src/http/controller/contacts/create-contact.ts
var import_zod4 = __toESM(require("zod"));

// src/services/errors/invalid-email-format-error.ts
var InvalidEmailFormatError = class extends Error {
  constructor() {
    super("Contact with invalid email");
  }
};

// src/services/errors/invalid-phone-error.ts
var InvalidPhoneFormatError = class extends Error {
  constructor() {
    super("Invalid phone format");
  }
};

// src/services/errors/invalid-city-format-error.ts
var InvalidCityFormatError = class extends Error {
  constructor() {
    super("City must contain only letters, spaces and accents");
  }
};

// src/services/errors/duplicate-phone-error.ts
var DuplicatePhoneNumbersError = class extends Error {
  constructor() {
    super("Duplicate phone numbers are not allowed");
  }
};

// src/services/errors/phone-required-error.ts
var PhoneRequiredError = class extends Error {
  constructor() {
    super("Contact must have at least one phone number");
  }
};

// src/services/contacts/create-contact.ts
var CreateContactUseCase = class {
  constructor(contactsRepository2) {
    this.contactsRepository = contactsRepository2;
  }
  async execute({
    userId,
    name,
    address,
    email,
    phones,
    city
  }) {
    if (!this.isValidEmail(email)) {
      throw new InvalidEmailFormatError();
    }
    const contactWithSameEmail = await this.contactsRepository.findByEmail(email);
    if (contactWithSameEmail) {
      throw new Error("User with same email already exists");
    }
    if (!this.isValidCity(city)) {
      throw new InvalidCityFormatError();
    }
    if (!phones || phones.length === 0) {
      throw new PhoneRequiredError();
    }
    const uniquePhones = [...new Set(phones)];
    if (uniquePhones.length !== phones.length) {
      throw new DuplicatePhoneNumbersError();
    }
    phones.forEach((phone) => {
      if (!this.isValidPhoneFormat(phone)) {
        throw new InvalidPhoneFormatError();
      }
    });
    const createContact2 = await this.contactsRepository.create({
      name,
      address,
      email,
      city,
      user: {
        connect: { id: userId }
      },
      phones: {
        create: phones.map((phone) => ({
          number: this.cleanPhoneNumber(phone)
        }))
      }
    });
    return {
      contact: createContact2
    };
  }
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  isValidCity(city) {
    const cityRegex = /^[a-zA-ZÀ-ÿ\s\-]+$/;
    return cityRegex.test(city.trim()) && city.trim().length > 0;
  }
  isValidPhoneFormat(phone) {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }
  //TODO: Remove this method and use the isValidPhoneFormat method
  cleanPhoneNumber(phone) {
    return phone.replace(/\D/g, "");
  }
};

// src/repositories/in-memory/in-memory-contacts-repository.ts
var InMemoryContactsRepository = class {
  constructor() {
    this.items = [];
    this.nextContactId = 1;
    this.nextPhoneId = 1;
  }
  async create(data) {
    const contactId = this.nextContactId.toString();
    this.nextContactId++;
    if (!data.user?.connect?.id) {
      throw new Error("User ID is required");
    }
    const contact = {
      id: contactId,
      name: data.name,
      address: data.address || "",
      city: data.city || "",
      email: data.email,
      userId: data.user.connect.id,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      deletedAt: null,
      phones: []
    };
    if (data.phones?.create) {
      const phonesData = Array.isArray(data.phones.create) ? data.phones.create : [data.phones.create];
      contact.phones = [];
      phonesData.forEach((phoneData) => {
        contact.phones.push({
          id: this.nextPhoneId.toString(),
          number: phoneData.number,
          contactId,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        });
        this.nextPhoneId++;
      });
    }
    this.items.push(contact);
    return contact;
  }
  async findById(id) {
    const contact = this.items.find((item) => item.id === id && !item.deletedAt);
    if (!contact) {
      return null;
    }
    return contact;
  }
  async findByEmail(email) {
    const contact = this.items.find((item) => item.email === email && !item.deletedAt);
    if (!contact) {
      return null;
    }
    return contact;
  }
  async findByUserId(userId) {
    return this.items.filter((item) => item.userId === userId && !item.deletedAt);
  }
  async findManyWithFilters(userId, filters) {
    let contacts = this.items.filter((item) => item.userId === userId && !item.deletedAt);
    if (filters.name) {
      contacts = contacts.filter(
        (contact) => contact.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.address) {
      contacts = contacts.filter(
        (contact) => contact.address.toLowerCase().includes(filters.address.toLowerCase())
      );
    }
    if (filters.email) {
      contacts = contacts.filter(
        (contact) => contact.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }
    if (filters.city) {
      contacts = contacts.filter(
        (contact) => contact.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }
    if (filters.phone) {
      contacts = contacts.filter(
        (contact) => contact.phones.some((phone) => phone.number.includes(filters.phone))
      );
    }
    return contacts;
  }
  async update(id, data) {
    const contactIndex = this.items.findIndex((item) => item.id === id && !item.deletedAt);
    if (contactIndex === -1) {
      throw new Error("Contact not found");
    }
    const contact = this.items[contactIndex];
    if (data.name) contact.name = data.name;
    if (data.address) contact.address = data.address;
    if (data.city) contact.city = data.city;
    if (data.email) contact.email = data.email;
    if (data.deletedAt !== void 0) contact.deletedAt = data.deletedAt;
    contact.updatedAt = /* @__PURE__ */ new Date();
    if (data.phones) {
      if (data.phones.deleteMany !== void 0) {
        contact.phones = [];
      }
      if (data.phones.create) {
        const phonesData = Array.isArray(data.phones.create) ? data.phones.create : [data.phones.create];
        const newPhones = phonesData.map((phoneData) => ({
          id: this.nextPhoneId.toString(),
          number: phoneData.number,
          contactId: id,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }));
        contact.phones = [...contact.phones, ...newPhones];
        this.nextPhoneId += newPhones.length;
      }
    }
    return contact;
  }
  async delete(id) {
    const contactIndex = this.items.findIndex((item) => item.id === id && !item.deletedAt);
    if (contactIndex === -1) {
      throw new Error("Contact not found");
    }
    this.items[contactIndex].deletedAt = /* @__PURE__ */ new Date();
  }
};

// src/services/factories/contacts/make-contacts-repository.ts
var contactsRepository = new InMemoryContactsRepository();

// src/services/factories/contacts/make-create-use-case.ts
function makeCreateContactUseCase() {
  const createContactUseCase = new CreateContactUseCase(contactsRepository);
  return createContactUseCase;
}

// src/http/controller/contacts/create-contact.ts
async function createContact(req, res) {
  try {
    const createContactBodySchema = import_zod4.default.object({
      name: import_zod4.default.string().min(1, "Name is required"),
      address: import_zod4.default.string().min(1, "Address is required"),
      email: import_zod4.default.string().email("Invalid email format"),
      phones: import_zod4.default.array(import_zod4.default.string()).min(1, "At least one phone number is required"),
      city: import_zod4.default.string().min(1, "City is required")
    });
    const { name, address, email, phones, city } = createContactBodySchema.parse(req.body);
    const userId = req.userId;
    const createContactUseCase = makeCreateContactUseCase();
    const { contact } = await createContactUseCase.execute({
      userId,
      name,
      address,
      email,
      phones,
      city
    });
    return res.status(201).json({
      message: "Contact created successfully",
      contact: {
        id: contact.id,
        name: contact.name,
        address: contact.address,
        email: contact.email,
        city: contact.city,
        phones: contact.phones.map((phone) => ({
          id: phone.id,
          number: phone.number
        })),
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }
    });
  } catch (error) {
    if (error instanceof import_zod4.default.ZodError) {
      console.log("Validation errors:", error.issues);
      return res.status(400).json({
        message: "Validation error?",
        errors: error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message
        }))
      });
    }
    if (error instanceof InvalidEmailFormatError) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }
    if (error instanceof InvalidPhoneFormatError) {
      return res.status(400).json({
        message: "Invalid phone format"
      });
    }
    if (error instanceof Error) {
      if (error.message === "User with same email already exists") {
        return res.status(409).json({
          message: "User with same email already exists"
        });
      }
      if (error.message === "City must contain only letters, spaces and accents") {
        return res.status(400).json({
          message: "City must contain only letters, spaces and accents"
        });
      }
      if (error.message === "Contact must have at least one phone number") {
        return res.status(400).json({
          message: "Contact must have at least one phone number"
        });
      }
      if (error.message === "Duplicate phone numbers are not allowed") {
        return res.status(400).json({
          message: "Duplicate phone numbers are not allowed"
        });
      }
    }
    console.error("Unexpected error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
}

// src/http/controller/contacts/list-contacts.ts
var import_zod5 = __toESM(require("zod"));

// src/services/contacts/list-contacts.ts
var ListContactsUseCase = class {
  constructor(contactsRepository2) {
    this.contactsRepository = contactsRepository2;
  }
  async execute({
    userId,
    filters
  }) {
    let contacts;
    if (filters && Object.keys(filters).length > 0) {
      contacts = await this.contactsRepository.findManyWithFilters(userId, filters);
    } else {
      contacts = await this.contactsRepository.findByUserId(userId);
    }
    return {
      contacts
    };
  }
};

// src/services/factories/contacts/make-list-contacts-use-case.ts
function makeListContactsUseCase() {
  const listContactsUseCase = new ListContactsUseCase(contactsRepository);
  return listContactsUseCase;
}

// src/http/controller/contacts/list-contacts.ts
async function listContacts(req, res) {
  try {
    const listContactsQuerySchema = import_zod5.default.object({
      name: import_zod5.default.string().optional(),
      address: import_zod5.default.string().optional(),
      email: import_zod5.default.string().optional(),
      phone: import_zod5.default.string().optional(),
      city: import_zod5.default.string().optional()
    });
    const { name, address, email, phone, city } = listContactsQuerySchema.parse(req.query);
    const userId = req.userId;
    const listContactsUseCase = makeListContactsUseCase();
    const filters = { name, address, email, phone, city };
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== void 0)
    );
    const { contacts } = await listContactsUseCase.execute({
      userId,
      filters: Object.keys(cleanFilters).length > 0 ? cleanFilters : void 0
    });
    if (contacts.length === 0) {
      return res.status(404).json({
        message: "No contacts found"
      });
    }
    return res.status(200).json({
      contacts: contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        address: contact.address,
        email: contact.email,
        city: contact.city,
        phones: contact.phones.map((phone2) => ({
          id: phone2.id,
          number: phone2.number
        })),
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }))
    });
  } catch (error) {
    if (error instanceof import_zod5.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
    }
    console.error("Unexpected error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
}

// src/http/controller/contacts/get-contact.ts
var import_zod6 = __toESM(require("zod"));

// src/services/errors/contact-not-found-error.ts
var ContactNotFoundError = class extends Error {
  constructor() {
    super("Contact not found");
  }
};

// src/services/contacts/get-contact.ts
var GetContactUseCase = class {
  constructor(contactsRepository2) {
    this.contactsRepository = contactsRepository2;
  }
  async execute({
    contactId,
    userId
  }) {
    const contact = await this.contactsRepository.findById(contactId);
    if (!contact) {
      throw new ContactNotFoundError();
    }
    if (contact.userId !== userId) {
      throw new ContactNotFoundError();
    }
    return {
      contact
    };
  }
};

// src/services/factories/contacts/make-get-contact-use-case.ts
function makeGetContactUseCase() {
  const getContactUseCase = new GetContactUseCase(contactsRepository);
  return getContactUseCase;
}

// src/http/controller/contacts/get-contact.ts
async function getContact(req, res) {
  try {
    const getContactQuerySchema = import_zod6.default.object({
      userId: import_zod6.default.string().uuid("Invalid user ID format")
    });
    const getContactParamsSchema = import_zod6.default.object({
      id: import_zod6.default.string().min(1, "Contact ID is required")
    });
    const { id } = getContactParamsSchema.parse(req.params);
    const { userId } = getContactQuerySchema.parse(req.query);
    const getContactUseCase = makeGetContactUseCase();
    const { contact } = await getContactUseCase.execute({
      contactId: id,
      userId
    });
    return res.status(200).json({
      contact: {
        id: contact.id,
        name: contact.name,
        address: contact.address,
        email: contact.email,
        city: contact.city,
        phones: contact.phones.map((phone) => ({
          id: phone.id,
          number: phone.number
        })),
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }
    });
  } catch (error) {
    if (error instanceof import_zod6.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
    }
    if (error instanceof ContactNotFoundError) {
      return res.status(404).json({
        message: "Contact not found"
      });
    }
    console.error("Unexpected error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
}

// src/http/controller/contacts/update-contact.ts
var import_zod7 = __toESM(require("zod"));

// src/services/contacts/update-contact.ts
var UpdateContactUseCase = class {
  constructor(contactsRepository2) {
    this.contactsRepository = contactsRepository2;
  }
  async execute({
    contactId,
    userId,
    name,
    address,
    email,
    phones,
    city
  }) {
    const existingContact = await this.contactsRepository.findById(contactId);
    if (!existingContact || existingContact.userId !== userId) {
      throw new ContactNotFoundError();
    }
    if (email && !this.isValidEmail(email)) {
      throw new InvalidEmailFormatError();
    }
    if (email && email !== existingContact.email) {
      const contactWithSameEmail = await this.contactsRepository.findByEmail(email);
      if (contactWithSameEmail && contactWithSameEmail.id !== contactId) {
        throw new Error("User with same email already exists");
      }
    }
    if (city && !this.isValidCity(city)) {
      throw new InvalidCityFormatError();
    }
    if (phones) {
      if (phones.length === 0) {
        throw new PhoneRequiredError();
      }
      const uniquePhones = [...new Set(phones)];
      if (uniquePhones.length !== phones.length) {
        throw new DuplicatePhoneNumbersError();
      }
      phones.forEach((phone) => {
        if (!this.isValidPhoneFormat(phone)) {
          throw new InvalidPhoneFormatError();
        }
      });
    }
    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (email) updateData.email = email;
    if (city) updateData.city = city;
    if (phones) {
      updateData.phones = {
        deleteMany: {},
        create: phones.map((phone) => ({
          number: this.cleanPhoneNumber(phone)
        }))
      };
    }
    const updatedContact = await this.contactsRepository.update(contactId, updateData);
    return {
      contact: updatedContact
    };
  }
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  isValidCity(city) {
    const cityRegex = /^[a-zA-ZÀ-ÿ\s\-]+$/;
    return cityRegex.test(city.trim()) && city.trim().length > 0;
  }
  isValidPhoneFormat(phone) {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }
  cleanPhoneNumber(phone) {
    return phone.replace(/\D/g, "");
  }
};

// src/services/factories/contacts/make-update-contact-use-case.ts
function makeUpdateContactUseCase() {
  const updateContactUseCase = new UpdateContactUseCase(contactsRepository);
  return updateContactUseCase;
}

// src/http/controller/contacts/update-contact.ts
async function updateContact(req, res) {
  try {
    const updateContactParamsSchema = import_zod7.default.object({
      id: import_zod7.default.string().min(1, "Contact ID is required")
    });
    const updateContactBodySchema = import_zod7.default.object({
      name: import_zod7.default.string().min(1).optional(),
      address: import_zod7.default.string().min(1).optional(),
      email: import_zod7.default.string().email().optional(),
      phones: import_zod7.default.array(import_zod7.default.string()).min(1).optional(),
      city: import_zod7.default.string().min(1).optional()
    });
    const { id } = updateContactParamsSchema.parse(req.params);
    const data = updateContactBodySchema.parse(req.body);
    const updateContactUseCase = makeUpdateContactUseCase();
    const { contact } = await updateContactUseCase.execute({
      contactId: id,
      userId: req.userId,
      // Midleware  exists
      ...data
    });
    return res.status(200).json({
      message: "Contact updated successfully",
      contact: {
        id: contact.id,
        name: contact.name,
        address: contact.address,
        email: contact.email,
        city: contact.city,
        phones: contact.phones.map((phone) => ({
          id: phone.id,
          number: phone.number
        }))
      }
    });
  } catch (error) {
    if (error instanceof import_zod7.default.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
    }
    if (error instanceof ContactNotFoundError) {
      return res.status(404).json({ message: "Contact not found" });
    }
    if (error instanceof InvalidEmailFormatError) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (error instanceof InvalidPhoneFormatError) {
      return res.status(400).json({ message: "Invalid phone format" });
    }
    if (error instanceof InvalidCityFormatError) {
      return res.status(400).json({ message: "Invalid city format" });
    }
    if (error instanceof DuplicatePhoneNumbersError) {
      return res.status(400).json({ message: "Duplicate phone numbers are not allowed" });
    }
    if (error instanceof PhoneRequiredError) {
      return res.status(400).json({ message: "At least one phone number is required" });
    }
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// src/http/controller/contacts/delete-contact.ts
var import_zod8 = __toESM(require("zod"));

// src/services/contacts/delete-contact.ts
var DeleteContactUseCase = class {
  constructor(contactsRepository2) {
    this.contactsRepository = contactsRepository2;
  }
  async execute({
    contactId,
    userId
  }) {
    const contact = await this.contactsRepository.findById(contactId);
    if (!contact || contact.userId !== userId) {
      throw new ContactNotFoundError();
    }
    await this.contactsRepository.delete(contactId);
  }
};

// src/services/factories/contacts/make-delete-contact-use-case.ts
function makeDeleteContactUseCase() {
  const deleteContactUseCase = new DeleteContactUseCase(contactsRepository);
  return deleteContactUseCase;
}

// src/http/controller/contacts/delete-contact.ts
async function deleteContact(req, res) {
  try {
    const deleteContactParamsSchema = import_zod8.default.object({
      id: import_zod8.default.string().min(1, "Contact ID is required")
    });
    const { id } = deleteContactParamsSchema.parse(req.params);
    const deleteContactUseCase = makeDeleteContactUseCase();
    await deleteContactUseCase.execute({
      contactId: id,
      userId: req.userId
      // O middleware garante que existe
    });
    return res.status(200).json({
      message: "Contact deleted successfully",
      contactId: id,
      deletedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    if (error instanceof import_zod8.default.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.issues
      });
    }
    if (error instanceof ContactNotFoundError) {
      return res.status(404).json({ message: "Contact not found" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

// src/http/middleware/jwt-auth.ts
var import_jsonwebtoken3 = __toESM(require("jsonwebtoken"));
function jwtAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      message: "Token de acesso requerido"
    });
  }
  const [, token] = authHeader.split(" ");
  if (!token) {
    return res.status(401).json({
      message: "Token de acesso malformado"
    });
  }
  try {
    const decoded = import_jsonwebtoken3.default.verify(token, env.JWT_SECRET);
    req.userId = decoded.sub;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token de acesso inv\xE1lido"
    });
  }
}

// src/services/weather/enhanced-weather-service.ts
var EnhancedWeatherService = class {
  // 1 segundo entre requests
  constructor(apiKey) {
    this.cache = /* @__PURE__ */ new Map();
    this.CACHE_DURATION = 10 * 60 * 1e3;
    // 10 minutos
    this.MAX_CACHE_SIZE = 100;
    this.requestCount = 0;
    this.lastRequestTime = 0;
    this.MIN_REQUEST_INTERVAL = 1e3;
    this.apiKey = apiKey;
    console.log(`\u{1F324}\uFE0F EnhancedWeatherService iniciado:`, {
      has_api_key: !!apiKey,
      cache_duration: `${this.CACHE_DURATION / 1e3 / 60}min`,
      rate_limit: `${this.MIN_REQUEST_INTERVAL}ms entre requests`
    });
  }
  async getWeatherInfo(city) {
    console.log(`
\u{1F3AF} Buscando clima para: ${city}`);
    if (!this.apiKey) {
      return this.createErrorResponse(city, {
        type: "unauthorized",
        description: "Chave da API OpenWeatherMap n\xE3o configurada"
      });
    }
    const cacheKey = this.generateCacheKey(city);
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) {
      console.log(`\u2705 Cache hit (${Math.round((Date.now() - cachedResult.timestamp) / 1e3)}s atr\xE1s)`);
      const response = { ...cachedResult.data };
      response.source = "cache";
      if (response.api_info) {
        response.api_info.cached_at = new Date(cachedResult.timestamp).toISOString();
        response.api_info.cache_expires = new Date(cachedResult.timestamp + this.CACHE_DURATION).toISOString();
      }
      return response;
    }
    await this.enforceRateLimit();
    const apiResult = await this.tryOpenWeatherAPI(city);
    if (apiResult && "weather" in apiResult) {
      console.log(`\u2705 Dados obtidos da OpenWeatherMap!`);
      const response = {
        weather: apiResult.weather,
        message: this.generateMessage(apiResult.weather),
        source: "openweather_api",
        api_info: apiResult.api_info
      };
      this.saveToCache(cacheKey, response);
      return response;
    }
    console.log(`\u274C API OpenWeatherMap falhou`);
    const errorDetails = apiResult && "error_details" in apiResult ? apiResult.error_details : void 0;
    return this.createErrorResponse(city, errorDetails);
  }
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`\u23F3 Rate limiting: aguardando ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
    this.requestCount++;
  }
  generateCacheKey(city) {
    return city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }
  getFromCache(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    return entry;
  }
  saveToCache(key, response) {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      data: response,
      timestamp: Date.now(),
      city_key: key
    });
    console.log(`\u{1F4BE} Cache salvo (${this.cache.size}/${this.MAX_CACHE_SIZE})`);
  }
  async tryOpenWeatherAPI(city) {
    try {
      const startTime = Date.now();
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=pt_br`;
      console.log(`\u{1F4E1} OpenWeatherMap API call #${this.requestCount}`);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Contact-Manager-Enhanced/1.0"
        },
        signal: AbortSignal.timeout(8e3)
      });
      const responseTime = Date.now() - startTime;
      if (!response.ok) {
        return this.handleApiError(response.status);
      }
      const data = await response.json();
      if (!data.name || !data.main || !data.weather?.[0]) {
        return {
          error_details: {
            type: "invalid_response",
            description: "API retornou dados incompletos"
          }
        };
      }
      const weather = data.weather[0];
      return {
        weather: {
          temperature: Math.round(data.main.temp),
          condition: weather.main,
          description: weather.description,
          city: `${data.name}, ${data.sys.country}`,
          feels_like: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          wind_speed: data.wind?.speed ? Math.round(data.wind.speed * 3.6) : void 0
        },
        api_info: {
          response_time_ms: responseTime,
          country: data.sys.country,
          coordinates: {
            lat: data.coord.lat,
            lon: data.coord.lon
          }
        }
      };
    } catch (error) {
      console.error(`\u274C Erro OpenWeatherMap: ${error.message}`);
      return this.handleNetworkError(error);
    }
  }
  handleApiError(status) {
    switch (status) {
      case 401:
        return {
          error_details: {
            type: "unauthorized",
            http_status: 401,
            description: "Chave da API inv\xE1lida"
          }
        };
      case 404:
        return {
          error_details: {
            type: "not_found",
            http_status: 404,
            description: "Cidade n\xE3o encontrada"
          }
        };
      case 429:
        return {
          error_details: {
            type: "rate_limit",
            http_status: 429,
            description: "Limite de requisi\xE7\xF5es excedido"
          }
        };
      default:
        return {
          error_details: {
            type: "network_error",
            http_status: status,
            description: `Erro HTTP ${status}`
          }
        };
    }
  }
  handleNetworkError(error) {
    if (error.name === "AbortError") {
      return {
        error_details: {
          type: "network_error",
          description: "Timeout na requisi\xE7\xE3o"
        }
      };
    } else {
      return {
        error_details: {
          type: "unknown",
          description: `Erro: ${error.message}`
        }
      };
    }
  }
  createErrorResponse(city, errorDetails) {
    return {
      weather: {
        temperature: 0,
        condition: "Erro",
        description: "Dados indispon\xEDveis",
        city
      },
      message: {
        temperature: 0,
        condition: "Erro",
        message: "Servi\xE7o temporariamente indispon\xEDvel",
        description: "Dados indispon\xEDveis"
      },
      source: "api_error",
      error_details: errorDetails
    };
  }
  generateMessage(weather) {
    const { temperature, condition, description } = weather;
    let message = "Que tal entrar em contato com essa pessoa?";
    let icon = "\u{1F60A}";
    if (temperature <= 15) {
      message = "Ofere\xE7a um chocolate quente ao seu contato...";
      icon = "\u2615";
    } else if (temperature >= 30) {
      if (this.isSunny(condition)) {
        message = "Convide seu contato para ir \xE0 praia com esse calor!";
        icon = "\u{1F3D6}\uFE0F";
      } else if (this.isRainy(condition)) {
        message = "Convide seu contato para tomar um sorvete";
        icon = "\u{1F366}";
      } else {
        message = "Est\xE1 muito quente! Que tal um lugar com ar condicionado?";
        icon = "\u{1F975}";
      }
    } else if (temperature > 15 && temperature < 30) {
      if (this.isSunny(condition)) {
        message = "Convide seu contato para fazer alguma atividade ao ar livre";
        icon = "\u{1F6B6}\u200D\u2642\uFE0F";
      } else if (this.isRainy(condition)) {
        message = "Convide seu contato para ver um filme";
        icon = "\u{1F3AC}";
      }
    }
    return {
      temperature,
      condition,
      message,
      description,
      icon
    };
  }
  isSunny(condition) {
    const conditionLower = condition.toLowerCase();
    return ["clear", "sun", "sol", "ensolarado", "limpo"].some((sunny) => conditionLower.includes(sunny));
  }
  isRainy(condition) {
    const conditionLower = condition.toLowerCase();
    return ["rain", "drizzle", "chuva", "chuvisco", "garoa", "thunderstorm"].some((rainy) => conditionLower.includes(rainy));
  }
  getCacheStats() {
    return {
      size: this.cache.size,
      max_size: this.MAX_CACHE_SIZE,
      request_count: this.requestCount,
      cache_duration_minutes: this.CACHE_DURATION / 1e3 / 60
    };
  }
};

// src/services/factories/weather/make-enhanced-weather-service.ts
function makeEnhancedWeatherService() {
  const apiKey = env.OPENWEATHER_API_KEY;
  return new EnhancedWeatherService(apiKey);
}

// src/http/controller/test/weather-test.ts
async function testWeatherService(req, res) {
  try {
    const city = req.query.city || "S\xE3o Paulo";
    const weatherService = makeEnhancedWeatherService();
    const result = await weatherService.getWeatherInfo(city);
    return res.status(200).json({
      success: true,
      city_requested: city,
      weather: result.weather,
      suggestion: result.message,
      source: result.source,
      api_info: result.api_info,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Erro no servi\xE7o de clima",
      message: error.message
    });
  }
}
async function testWeatherStats(req, res) {
  try {
    const weatherService = makeEnhancedWeatherService();
    const stats = weatherService.getCacheStats();
    return res.status(200).json({
      success: true,
      cache_stats: stats,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// src/http/routes.ts
function appRoutes(app2) {
  app2.post("/users", register);
  app2.post("/sessions", authenticate);
  app2.post("/contacts", jwtAuth, createContact);
  app2.get("/contacts/:id", jwtAuth, getContact);
  app2.get("/contacts", jwtAuth, listContacts);
  app2.put("/contacts/:id", jwtAuth, updateContact);
  app2.delete("/contacts/:id", jwtAuth, deleteContact);
  app2.get("/test/weather", testWeatherService);
  app2.get("/test/weather/stats", testWeatherStats);
}

// src/app.ts
var app = (0, import_express.default)();
app.use(import_express.default.json());
appRoutes(app);
app.use((error, req, res, next) => {
  if (error instanceof import_zod9.ZodError) {
    return res.status(400).json({ message: "Validation Error", issues: error.format() });
  }
  if (env.NODE_ENV !== "prod") {
    console.error(error);
  } else {
  }
  return res.status(500).json({ message: "Internal Server Error" });
});

// src/server.ts
app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${env.PORT}!`);
});
