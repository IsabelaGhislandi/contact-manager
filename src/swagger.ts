import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Contacts API',
      version: '1.0.0',
      description: 'API REST for managing contacts with weather information',
      contact: {
        name: 'API Support',
        email: 'support@contactsapi.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insert the JWT token obtained in the authentication endpoint'
        }
      },
      schemas: {
        // ============ USER SCHEMAS ============
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'João Silva' },
            email: { type: 'string', format: 'email', example: 'joao@example.com' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateUserRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 1, example: 'João Silva' },
            email: { type: 'string', format: 'email', example: 'joao@example.com' },
            password: { type: 'string', minLength: 6, example: '123456' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'joao@example.com' },
            password: { type: 'string', example: '123456' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'User authenticated successfully' },
            user: { $ref: '#/components/schemas/User' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },

        // ============ CONTACT SCHEMAS ============
        Phone: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            number: { type: 'string', example: '11999999999' }
          }
        },
        Contact: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Maria Santos' },
            address: { type: 'string', example: 'Rua das Flores, 123' },
            email: { type: 'string', format: 'email', example: 'maria@example.com' },
            city: { type: 'string', example: 'São Paulo' },
            phones: {
              type: 'array',
              items: { $ref: '#/components/schemas/Phone' }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateContactRequest: {
          type: 'object',
          required: ['name', 'address', 'email', 'phones', 'city'],
          properties: {
            name: { type: 'string', minLength: 1, example: 'Maria Santos' },
            address: { type: 'string', minLength: 1, example: 'Rua das Flores, 123' },
            email: { type: 'string', format: 'email', example: 'maria@example.com' },
            phones: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              example: ['11999999999', '11888888888']
            },
            city: { type: 'string', minLength: 1, example: 'São Paulo' }
          }
        },
        UpdateContactRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, example: 'Maria Santos Silva' },
            address: { type: 'string', minLength: 1, example: 'Av. Paulista, 456' },
            email: { type: 'string', format: 'email', example: 'maria.silva@example.com' },
            phones: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              example: ['11999999999']
            },
            city: { type: 'string', minLength: 1, example: 'Rio de Janeiro' }
          }
        },

        // ============ WEATHER SCHEMAS ============
        WeatherData: {
          type: 'object',
          properties: {
            temperature: { type: 'number', example: 25 },
            condition: { type: 'string', example: 'clear' },
            description: { type: 'string', example: 'céu limpo' },
            city: { type: 'string', example: 'São Paulo' }
          }
        },
        ContactWithWeather: {
          type: 'object',
          properties: {
            contact: { $ref: '#/components/schemas/Contact' },
            weather: {
              oneOf: [
                { $ref: '#/components/schemas/WeatherData' },
                { type: 'null' }
              ]
            },
            suggestion: { type: 'string', example: 'Convide seu contato para fazer alguma atividade ao ar livre' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },

        // ============ RESPONSE SCHEMAS ============
        SuccessResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Validation error' },
            code: { type: 'string', example: 'VALIDATION_ERROR' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Invalid email format' }
                }
              }
            },
            timestamp: { type: 'string', format: 'date-time' },
            path: { type: 'string', example: '/contacts' },
            method: { type: 'string', example: 'POST' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Contact not found' },
            code: { type: 'string', example: 'CONTACT_NOT_FOUND' },
            timestamp: { type: 'string', format: 'date-time' },
            path: { type: 'string', example: '/contacts/123' },
            method: { type: 'string', example: 'GET' }
          }
        }
      }
    },
    paths: {
      // ============ USER ENDPOINTS ============
      '/users': {
        post: {
          tags: ['Users'],
          summary: 'Create a new user',
          description: 'Register a new user in the system',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateUserRequest' }
              }
            }
          },
          responses: {
            '201': {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'User created successfully' },
                      user: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
                }
              }
            },
            '409': {
              description: 'User already exists',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/sessions': {
        post: {
          tags: ['Authentication'],
          summary: 'Authenticate user',
          description: 'Login with email and password to get JWT token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Authentication successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/LoginResponse' }
                }
              }
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
                }
              }
            },
            '401': {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },

      // ============ CONTACT ENDPOINTS ============
      '/contacts': {
        post: {
          tags: ['Contacts'],
          summary: 'Create a new contact',
          description: 'Create a new contact for the authenticated user',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateContactRequest' }
              }
            }
          },
          responses: {
            '201': {
              description: 'Contact created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Contact created successfully' },
                      contact: { $ref: '#/components/schemas/Contact' }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Invalid or missing token',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            '409': {
              description: 'Contact with this email already exists',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        },
        get: {
          tags: ['Contacts'],
          summary: 'List contacts',
          description: 'Get all contacts for the authenticated user with optional filters',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'name',
              in: 'query',
              description: 'Filter by contact name',
              schema: { type: 'string' },
              example: 'Maria'
            },
            {
              name: 'email',
              in: 'query',
              description: 'Filter by contact email',
              schema: { type: 'string' },
              example: 'maria@example.com'
            },
            {
              name: 'address',
              in: 'query',
              description: 'Filter by contact address',
              schema: { type: 'string' },
              example: 'Rua das Flores'
            },
            {
              name: 'city',
              in: 'query',
              description: 'Filter by contact city',
              schema: { type: 'string' },
              example: 'São Paulo'
            },
            {
              name: 'phone',
              in: 'query',
              description: 'Filter by phone number',
              schema: { type: 'string' },
              example: '11999999999'
            }
          ],
          responses: {
            '200': {
              description: 'Contacts retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      contacts: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Contact' }
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Invalid or missing token',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/contacts/{id}': {
        get: {
          tags: ['Contacts'],
          summary: 'Get contact with weather info',
          description: 'Get a specific contact by ID with weather information for their city',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Contact ID',
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          responses: {
            '200': {
              description: 'Contact retrieved successfully with weather info',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ContactWithWeather' }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Invalid or missing token',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            '404': {
              description: 'Contact not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        },
        put: {
          tags: ['Contacts'],
          summary: 'Update contact',
          description: 'Update an existing contact',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Contact ID',
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateContactRequest' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Contact updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Contact updated successfully' },
                      contact: { $ref: '#/components/schemas/Contact' }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Invalid or missing token',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            '404': {
              description: 'Contact not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            '409': {
              description: 'Contact with this email already exists',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        },
        delete: {
          tags: ['Contacts'],
          summary: 'Delete contact',
          description: 'Soft delete a contact (marks as deleted)',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Contact ID',
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          responses: {
            '200': {
              description: 'Contact deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Contact deleted successfully' },
                      contactId: { type: 'string', format: 'uuid' },
                      deletedAt: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Invalid or missing token',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            '404': {
              description: 'Contact not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: []
}

const specs = swaggerJSDoc(options)

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customSiteTitle: "Contacts API Documentation",
    customfavIcon: "/favicon.ico",
    customCss: '.swagger-ui .topbar { display: none }'
  }))
  
  // Also make the JSON specification available
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(specs)
  })
}