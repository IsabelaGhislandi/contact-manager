# 📱 Contacts API - Agenda Telefônica

> API REST para gerenciamento de agenda telefônica com integração de dados meteorológicos

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-lightgrey.svg)](https://expressjs.com/)
[![Swagger](https://img.shields.io/badge/API-Swagger-green.svg)](http://localhost:3333/api-docs)

## 🎯 Sobre o Projeto

Esta API foi desenvolvida para gerenciar uma agenda telefônica, oferecendo operações CRUD completas para contatos com integração de dados meteorológicos. Ao visualizar um contato, a API consulta automaticamente as condições climáticas da cidade do contato e fornece sugestões personalizadas de atividades.

### ✨ Funcionalidades Principais

- **CRUD Completo** de contatos com validações robustas
- **Múltiplos telefones** por contato
- **Filtros avançados** na listagem (nome, email, cidade, telefone, endereço)
- **Integração climática** com sugestões contextuais
- **Soft delete** para preservação de dados
- **Autenticação JWT** segura
- **Documentação automática** com Swagger
- **Tratamento de erros** padronizado e informativo

## 🏗️ Arquitetura

### Clean Architecture + SOLID

```
src/
├── http/                    # Camada de apresentação
│   ├── controllers/         # Controllers Express
│   └── middlewares/         # Middlewares (auth, validation)
├── services/                # Camada de aplicação
│   ├── contacts/           # Use cases de contatos
│   ├── users/              # Use cases de usuários
│   ├── weather/            # Serviço de clima
│   ├── errors/             # Classes de erro padronizadas
│   └── factories/          # Dependency Injection
├── repositories/            # Camada de dados
│   ├── prisma/             # Implementação PostgreSQL/Prisma
│   └── in-memory/          # Implementação em memória (testes)
├── lib/                    # Configurações (Prisma client)
├── utils/                  # Utilitários compartilhados
└── swagger.ts              # Configuração da documentação
```

### 🔧 Padrões Adotados

- **Use Cases Pattern**: Lógica de negócio isolada
- **Repository Pattern**: Abstração da camada de dados
- **Factory Pattern**: Injeção de dependências
- **Error Handling**: Classes de erro tipadas
- **Validation**: Zod para validação de schemas
- **Response Patterns**: Responses padronizadas

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- PostgreSQL 12+
- Chave da API OpenWeather (opcional para integração climática)

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd contacts-api

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Configure o banco de dados
npx prisma migrate dev
npx prisma generate
```

### Configuração do Ambiente

```env
# .env
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/contact_manager?schema=public"
JWT_SECRET=your-super-secret-jwt-key-here
OPENWEATHER_API_KEY=your-openweather-api-key-here  # Opcional
PORT=3333
```

### Executar a Aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm start

# Testes
npm test
npm run test:watch
```

### 📚 Acessar Documentação

Após iniciar o servidor:

- **API**: http://localhost:3333
- **Swagger UI**: http://localhost:3333/api-docs
- **Swagger JSON**: http://localhost:3333/api-docs.json

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação:

### 1. Registrar usuário
```http
POST /users
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "123456"
}
```

### 2. Fazer login
```http
POST /sessions
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "123456"
}
```

### 3. Usar o token
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📋 Endpoints da API

### 👤 Autenticação
- `POST /users` - Registrar usuário
- `POST /sessions` - Fazer login

### 📞 Contatos
- `POST /contacts` - Criar contato
- `GET /contacts` - Listar contatos (com filtros)
- `GET /contacts/:id` - Buscar contato (com clima)
- `PUT /contacts/:id` - Atualizar contato
- `DELETE /contacts/:id` - Excluir contato (soft delete)

## 🌤️ Integração com Clima

### ⚠️ Nota Importante sobre API do Clima

**Por que OpenWeather ao invés de HgBrasil?**

Embora o requisito original especificasse a API HgBrasil Weather, optei por utilizar a **OpenWeather API** pelo acesso à chave ser gratuito para as requisições propostas.

A API integra-se com a **OpenWeather API** para fornecer:

### Dados Retornados
- Temperatura atual
- Condição climática
- Sugestões contextuais

### 🎯 Regras de Sugestão

| Condição | Sugestão |
|----------|----------|
| ≤ 18° | "Ofereça um chocolate quente ao seu contato..." |
| ≥ 30° + ☀️ | "Convide seu contato para ir à praia com esse calor!" |
| ≥ 30° + 🌧️ | "Convide seu contato para tomar um sorvete" |
| 18°-30° + ☀️ | "Convide seu contato para fazer alguma atividade ao ar livre" |
| 18°-30° + 🌧️ | "Convide seu contato para ver um filme" |

### Tolerância a Falhas
- Se a API do clima falhar, o contato é retornado normalmente
- Mensagem de erro clara no campo `weather`
- Funcionalidade principal não é afetada

## 📝 Exemplos de Uso

### Criar Contato
```json
POST /contacts
Authorization: Bearer <token>

{
  "name": "Maria Santos",
  "address": "Rua das Flores, 123",
  "email": "maria@example.com",
  "phones": ["11999999999", "11888888888"],
  "city": "São Paulo"
}
```

### Buscar Contato com Clima
```json
GET /contacts/123
Authorization: Bearer <token>

Response:
{
  "contact": {
    "id": "123",
    "name": "Maria Santos",
    "city": "São Paulo",
    "phones": [{"id": "1", "number": "11999999999"}]
  },
  "weather": {
    "temperature": 25,
    "condition": "clear",
    "description": "céu limpo"
  },
  "suggestion": "Convide seu contato para fazer alguma atividade ao ar livre",
  "timestamp": "2024-03-15T10:30:00.000Z"
}
```

### Filtrar Contatos
```http
GET /contacts?city=São Paulo&name=Maria
Authorization: Bearer <token>
```

## 🛡️ Validações e Regras de Negócio

### Contatos
- ✅ **Email único e válido** (formato RFC)
- ✅ **Telefones únicos** por contato (10-11 dígitos)
- ✅ **Cidade válida** (apenas letras, espaços, acentos)
- ✅ **Múltiplos telefones** permitidos
- ✅ **Soft delete** preserva dados históricos

### Usuários
- ✅ **Email único** no sistema
- ✅ **Senha mínima** de 6 caracteres
- ✅ **JWT expira** em 7 dias

## 🔍 Filtros Avançados

A listagem de contatos suporta filtros combinados:

```http
GET /contacts?name=João&city=São Paulo&email=gmail.com
```

Todos os filtros são aplicados com busca parcial (LIKE).

## ❌ Tratamento de Erros

### Estrutura de Erro Padronizada
```json
{
  "message": "Validation error",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2024-03-15T10:30:00.000Z",
  "path": "/contacts",
  "method": "POST"
}
```

### Códigos de Erro
- `VALIDATION_ERROR` (400) - Dados inválidos
- `UNAUTHORIZED` (401) - Token requerido/inválido
- `FORBIDDEN` (403) - Acesso negado
- `NOT_FOUND` (404) - Recurso não encontrado
- `CONFLICT` (409) - Recurso já existe
- `INTERNAL_SERVER_ERROR` (500) - Erro interno

## 🧪 Testes

### Cobertura de Testes
- **✅ 55 testes unitários** - Use cases e serviços
- **✅ 26 testes e2e** - Endpoints e integração
- **🎯 Total: 81 testes** com 100% de aprovação

### Estrutura de Testes
```bash
src/
├── services/**/*.spec.ts    # Testes unitários (55 testes)
└── http/**/*.spec.ts        # Testes E2E (26 testes)
```

### Executar Testes
```bash
# Todos os testes
npm test

# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Testes em modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 🚀 Deploy

### Variáveis de Produção
```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:5432/contact_manager?schema=public"
JWT_SECRET=<secret>
OPENWEATHER_API_KEY=<sua-chave-api>
PORT=3333
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3333
CMD ["npm", "start"]
```

